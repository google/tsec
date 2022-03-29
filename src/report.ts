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

import * as path from 'path';
import * as ts from 'typescript';

import {ENABLED_RULES} from './rule_groups';

const ALL_TSEC_RULE_NAMES =
    new Set<string|undefined>(ENABLED_RULES.map(r => r.RULE_NAME));

/** The default FormatDiagnosticsHost for tsec. */
export const FORMAT_DIAGNOSTIC_HOST: ts.FormatDiagnosticsHost = {
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  // `path.resolve` helps us eliminate relative path segments ('.' and '..').
  // `ts.formatDiagnosticsWithColorAndContext` always produce relative paths.
  getCanonicalFileName: fileName => path.resolve(fileName),
  getNewLine: () => ts.sys.newLine,
};

const NEW_LINE = FORMAT_DIAGNOSTIC_HOST.getNewLine();

/** Report the summary of error Diagnostic. */
export function reportErrorSummary(errorCount: number) {
  if (errorCount > 0) {
    if (errorCount === 1) {
      ts.sys.write(`Found 1 error.${NEW_LINE}`);
    } else {
      ts.sys.write(`Found ${errorCount} errors.${NEW_LINE}`);
    }
  }
}

/** Report a list of Diagnostic with an optional trailing error summary. */
function reportDiagnostics(
    diagnostics: readonly ts.Diagnostic[], withSummary: boolean,
    pretty: boolean,
    ignoreBuildErrors: boolean): number {

  const filteredDiagnostics = ignoreBuildErrors === true ? diagnostics.filter(d => ALL_TSEC_RULE_NAMES.has(d.source)) : diagnostics;

  const formatter =
      pretty ? ts.formatDiagnosticsWithColorAndContext : ts.formatDiagnostics;
  ts.sys.write(formatter(filteredDiagnostics, FORMAT_DIAGNOSTIC_HOST));


  const errorCount =
      filteredDiagnostics.filter(d => d.category === ts.DiagnosticCategory.Error)
          .length;

  if (withSummary && errorCount !== 0) {
    ts.sys.write(NEW_LINE + NEW_LINE);
    reportErrorSummary(errorCount);
  }

  return errorCount;
}

interface TsecPluginOptions extends ts.PluginImport {
  exemptionConfig?: string,
  ignoreBuildErrors: boolean,
}

function getTsecPluginOptions(options: ts.CompilerOptions) : TsecPluginOptions {
  const pluginName = 'tsec';
  const tsecPluginOptions: TsecPluginOptions = {
    name: pluginName,
    ignoreBuildErrors: false,
  };
  if (Array.isArray(options?.plugins)) {
    const pluginOptions = (options.plugins as ts.PluginImport[]).find(p => p.name === pluginName);
    if (pluginOptions) {
      Object.assign(tsecPluginOptions, pluginOptions);
    }
  }
  return tsecPluginOptions;
}

/**
 * create a diagnostic reporter with a pretty option inferred from compiler or
 * build options.
 */
export function createDiagnosticsReporter(options: ts.CompilerOptions|
                                          ts.BuildOptions) {
  let pretty =
      ts.sys.writeOutputIsTTY === undefined ? false : ts.sys.writeOutputIsTTY();
  if (options['pretty'] !== undefined) pretty = options['pretty'] as boolean;
  const tsecOptions = getTsecPluginOptions(options);
  return (diagnostics: readonly ts.Diagnostic[], withSummary: boolean) =>
             reportDiagnostics(diagnostics, withSummary, pretty, tsecOptions.ignoreBuildErrors);
}
