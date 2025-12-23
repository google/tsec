// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Host the logic for producing explanations for conformance
 * failures and matching logic.
 */

/**
 * Log events containing processed files, evaluated rules, matched nodes, type
 * matches, and silencing reasons for violations.
 * In google3, this flag is enabled through the blaze tsetse_explain_diagnostics
 * tag on the ts_library target.
 * In open-source, this flag is enabled through the explain_diagnostics option
 * in tsconfig.json.
 */
let explainDiagnostics = false;

/**
 * Sets whether tsetse explain diagnostics is enabled.
 */
export function setExplainDiagnostics(enabled: boolean): void {
  explainDiagnostics = enabled;
}

/**
 * Returns whether tsetse explain diagnostics is enabled.
 */
export function isExplainDiagnosticsEnabled(): boolean {
  return explainDiagnostics;
}
