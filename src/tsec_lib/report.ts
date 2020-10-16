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

/** The default FormatDiagnosticsHost for tsec. */
export const FORMAT_DIAGNOSTIC_HOST: ts.FormatDiagnosticsHost = {
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  // `path.resolve` helps us eliminate relative path segments ('.' and '..').
  // `ts.formatDiagnosticsWithColorAndContext` always produce relative paths.
  getCanonicalFileName: fileName => path.resolve(fileName),
  getNewLine: () => ts.sys.newLine,
};

/** Report a single Diagnostic. */
export function reportDiagnostic(diagnostic: ts.Diagnostic) {
  ts.sys.write(ts.formatDiagnosticsWithColorAndContext(
      [diagnostic], FORMAT_DIAGNOSTIC_HOST));

  const newLine = FORMAT_DIAGNOSTIC_HOST.getNewLine();
  ts.sys.write(newLine + newLine);
}

/** Report the summary of error Diagnostic. */
export function reportErrorSummary(errorCount: number) {
  if (errorCount > 0) {
    const newLine = FORMAT_DIAGNOSTIC_HOST.getNewLine();
    if (errorCount === 1) {
      ts.sys.write(`Found 1 error.${newLine}`);
    } else {
      ts.sys.write(`Found ${errorCount} errors.${newLine}`);
    }
  }
}

/** Report a list of Diagnostic with a trailing error summary. */
export function reportDiagnosticsWithSummary(
    diagnostics: readonly ts.Diagnostic[]): number {
  for (const diag of diagnostics) {
    reportDiagnostic(diag);
  }

  const errorCount =
      diagnostics.filter(d => d.category === ts.DiagnosticCategory.Error)
          .length;

  reportErrorSummary(errorCount);

  return errorCount;
}
