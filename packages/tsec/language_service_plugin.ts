// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview The language service plugin for tsec which shows violations
 * directly in the editor.
 */

import {getConfiguredChecker} from '../../common/configured_checker';
import {ErrorCode} from '../../common/third_party/tsetse/error_code';
import {DiagnosticWithFixes} from '../../common/third_party/tsetse/failure';
import * as ts from 'typescript/lib/tsserverlibrary';

import {createProxy} from './utils';

function diagnosticToCodeFixActions(d: DiagnosticWithFixes):
    ts.CodeFixAction[] {
  const codeActions = [];
  for (let i = 0; i < d.fixes?.length || 0; i++) {
    codeActions.push({
      fixName: 'Tsec fix',                     // for TS telemetry use only
      description: `Apply tsec fix ${i + 1}`,  // display name of the code
      changes: d.fixes[i].changes.map(
          c => ({
            fileName: c.sourceFile.fileName,
            textChanges: [{
              span: {start: c.start, length: c.end - c.start},
              newText: c.replacement
            }]
          }))
    });
  }
  return codeActions;
}

function computeKey(start: number, end: number): string {
  return `[${start},${end}]`;
}

/* @internal */
// Work around for missing API to register a code fix.
interface CodeFix {
  errorCodes: number[];
  getCodeActions(context: unknown): ts.CodeAction[]|undefined;
}

interface TsWithCodefix {
  codefix: {registerCodeFix: (codefix: CodeFix) => void};
}

/**
 * Implementation of the tsec LSP.
 *
 * Instance methods of this class are used as references and they need to
 * bound `this`. This is the reason why we use arrow functions for the property
 * methods.
 */
class TsecLanguageServicePlugin {
  codeFixActions: Map<string, Map<string, ts.CodeFixAction[]>>;
  oldService: ts.LanguageService;
  project: ts.server.Project;

  constructor(readonly info: ts.server.PluginCreateInfo) {
    // to avoid running tsetse twice, we store the code actions while running
    // the checker on `getSemanticDiagnostics`.
    this.codeFixActions = new Map();
    this.oldService = info.languageService;
    this.project = info.project;
  }

  boundGetSemanticDiagnostics =
      (fileName: string) => {
        const program = this.oldService.getProgram();
        if (!program) {
          throw new Error(
              'Failed to initialize tsetse language_service_plugin: program is undefined',
          );
        }

        const {checker} = getConfiguredChecker(program, this.project);
        const failures = checker.execute(program.getSourceFile(fileName)!);

        this.codeFixActions.set(fileName, new Map());
        const codeActionsForCurrentFile = this.codeFixActions.get(fileName)!;
        for (const failure of failures) {
          const d = failure.toDiagnostic();
          const codeActions = diagnosticToCodeFixActions(d);
          if (codeActions.length) {
            // ts.Diagnostic#start is optional, but should always be defined
            // when used from failure.
            const key = computeKey(d.start!, d.end);
            if (!codeActionsForCurrentFile.has(key)) {
              codeActionsForCurrentFile.set(key, []);
            }
            codeActionsForCurrentFile.get(key)!.push(...codeActions);
          }
        }

        // make sure to mutate the array and not create a copy
        // otherwise the code fixes stop working
        const result = this.oldService.getSemanticDiagnostics(fileName);
        result.push(
            ...checker.execute(program.getSourceFile(fileName)!)
                .map((failure) => failure.toDiagnostic()),
        );
        return result;
      }

  boundGetCodeFixesAtPosition =
      (fileName: string, start: number, end: number, errorCodes: number[],
       formatOptions: ts.FormatCodeSettings,
       userPreferences: ts.UserPreferences): readonly ts.CodeFixAction[] => {
        const prior = this.oldService.getCodeFixesAtPosition(
            fileName, start, end, errorCodes, formatOptions, userPreferences);
        const fixes = [...prior];

        const codeActionsForCurrentFile = this.codeFixActions.get(fileName);
        if (codeActionsForCurrentFile) {
          const actions =
              codeActionsForCurrentFile.get(computeKey(start, end)) ?? [];

          fixes.push(...actions);
        }


        return fixes;
      }
}

/**
 * Installs the Tsec language server plugin, which checks Tsec
 * rules in your editor and shows issues as semantic errors
 * (red squiggly underline).
 */
function init(modules: {typescript: typeof ts}): ts.server.PluginModule {
  const tsModule = modules.typescript;

  // every error code tsec produces must be registered
  // using the internal codefix API
  if ((tsModule as unknown as TsWithCodefix).codefix) {
    (tsModule as unknown as TsWithCodefix).codefix.registerCodeFix({
      errorCodes: [ErrorCode.CONFORMANCE_PATTERN],
      getCodeActions: () => undefined
    });
  }

  return {
    create(info: ts.server.PluginCreateInfo) {
      const plugin = new TsecLanguageServicePlugin(info);
      const oldService = info.languageService;
      const proxy = createProxy(oldService);

      proxy.getSemanticDiagnostics = plugin.boundGetSemanticDiagnostics;
      proxy.getCodeFixesAtPosition = plugin.boundGetCodeFixesAtPosition;

      return proxy;
    }
  };
}

export = init;
