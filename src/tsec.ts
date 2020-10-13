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

import {Checker} from './third_party/tsetse/checker';
import * as path from 'path';
import * as ts from 'typescript';

import {ENABLED_RULES} from './rule_groups';
import {ExemptionList, parseConformanceExemptionConfig} from './tsec_lib/exemption_config';
import {ExtendedParsedCommandLine, parseTsConfigFile} from './tsec_lib/tsconfig';

const FORMAT_DIAGNOSTIC_HOST: ts.FormatDiagnosticsHost = {
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  // `path.resolve` helps us eliminate relative path segments ('.' and '..').
  // `ts.formatDiagnosticsWithColorAndContext` always produce relative paths.
  getCanonicalFileName: fileName => path.resolve(fileName),
  getNewLine: () => ts.sys.newLine,
};

function countErrors(diagnostics: readonly ts.Diagnostic[]): number {
  return diagnostics.reduce(
      (sum, diag) =>
          sum + (diag.category === ts.DiagnosticCategory.Error ? 1 : 0),
      0);
}

function reportDiagnosticsWithSummary(diagnostics: readonly ts.Diagnostic[]):
    number {
  ts.sys.write(ts.formatDiagnosticsWithColorAndContext(
      diagnostics, FORMAT_DIAGNOSTIC_HOST));

  const errorCount = countErrors(diagnostics);
  if (errorCount > 0) {
    // Separate from the diagnostics with two line breaks.
    const newLine = FORMAT_DIAGNOSTIC_HOST.getNewLine();
    ts.sys.write(newLine + newLine);

    if (errorCount === 1) {
      ts.sys.write(`Found 1 error.${newLine}`);
    } else {
      ts.sys.write(`Found ${errorCount} errors.${newLine}`);
    }
  }
  return errorCount;
}

function getTsConfigFilePath(projectPath?: string): string {
  let tsConfigFilePath: string;

  // TODO(b/169605827): To fully align with tsc, we should also search parent
  // directories of pwd until a tsconfig.json file is found.
  if (projectPath === undefined) projectPath = '.';

  if (ts.sys.directoryExists(projectPath)) {
    tsConfigFilePath = path.join(projectPath, 'tsconfig.json');
  } else {
    tsConfigFilePath = projectPath;
  }

  return tsConfigFilePath;
}

/**
 * A simple tsc wrapper that runs TSConformance checks over the source files
 * and emits code for files without conformance violations.
 */
function main(args: string[]) {
  let parsedConfig: ExtendedParsedCommandLine = ts.parseCommandLine(args);
  if (parsedConfig.errors.length !== 0) {
    // Same as tsc, do not emit colorful diagnostic texts for command line
    // parsing errors.
    ts.sys.write(
        ts.formatDiagnostics(parsedConfig.errors, FORMAT_DIAGNOSTIC_HOST));
    return 1;
  }

  // If no source files are specified through command line arguments, there
  // must be a configuration file that tells the compiler what to do. Try
  // looking for this file and parse it.
  if (parsedConfig.fileNames.length === 0) {
    const tsConfigFilePath = getTsConfigFilePath(parsedConfig.options.project);
    const parseConfigFileHost: ts.ParseConfigFileHost = {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: (diagnostic: ts.Diagnostic) => {
        ts.sys.write(
            ts.formatDiagnostics([diagnostic], FORMAT_DIAGNOSTIC_HOST));
        ts.sys.exit(1);
      }
    };
    parsedConfig = parseTsConfigFile(
        tsConfigFilePath, parsedConfig.options, parseConfigFileHost);
  }

  const diagnostics = [...parsedConfig.errors];

  // Try locating and parsing exemption list.
  let conformanceExemptionConfig: ExemptionList = new Map();
  if (parsedConfig.conformanceExemptionPath) {
    const conformanceExemptionOrErrors =
        parseConformanceExemptionConfig(parsedConfig.conformanceExemptionPath);

    if (Array.isArray(conformanceExemptionOrErrors)) {
      diagnostics.push(...conformanceExemptionOrErrors);
    } else {
      conformanceExemptionConfig = conformanceExemptionOrErrors;
    }
  }

  const compilerHost = ts.createCompilerHost(parsedConfig.options, true);

  const program = ts.createProgram(
      parsedConfig.fileNames, parsedConfig.options, compilerHost);

  diagnostics.push(...ts.getPreEmitDiagnostics(program));

  // Create all enabled rules with corresponding exemption list entries.
  const conformanceChecker = new Checker(program);
  const conformanceRules = ENABLED_RULES.map(ruleCtr => {
    const allowlistEntries = [];
    const allowlistEntry = conformanceExemptionConfig.get(ruleCtr.RULE_NAME);
    if (allowlistEntry) {
      allowlistEntries.push(allowlistEntry);
    }
    return new ruleCtr(allowlistEntries);
  });

  // Register all rules.
  for (const rule of conformanceRules) {
    rule.register(conformanceChecker);
  }

  // Run all enabled conformance checks and collect errors.
  for (const sf of program.getSourceFiles()) {
    // We don't emit errors for declarations, so might as well skip checking
    // declaration files all together.
    if (sf.isDeclarationFile) continue;
    const conformanceDiagErr = conformanceChecker.execute(sf).map(
        failure => failure.toDiagnosticWithStringifiedFixes());
    diagnostics.push(...conformanceDiagErr);
  }

  // If there are conformance errors while noEmitOnError is set, refrain from
  // emitting code.
  if (diagnostics.length !== 0 && parsedConfig.options.noEmitOnError === true) {
    // We have to override this flag because conformance errors are not visible
    // to the actual compiler. Without `noEmit` being set, the compiler will
    // emit JS code if no other errors are found, even though we already know
    // there are conformance violations at this point.
    program.getCompilerOptions().noEmit = true;
  }

  const result = program.emit();
  diagnostics.push(...result.diagnostics);

  const errorCount = reportDiagnosticsWithSummary(diagnostics);

  return errorCount === 0 ? 0 : 1;
}

process.exitCode = main(process.argv.slice(2));
