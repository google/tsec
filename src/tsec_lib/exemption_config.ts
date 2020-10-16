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

import {AllowlistEntry, ExemptionReason} from '../third_party/tsetse/util/allowlist';
import * as path from 'path';
import * as ts from 'typescript';

import {getDiagnosticErrorFromJsonNode} from './tsconfig';

/**
 * Mapping from rule name to the list of names of files that are exempted from
 * the rule.
 */
export type ExemptionList = Map<string, AllowlistEntry>;

/**
 * Create an empty ExemptionList instance.
 */
export function createEmptyExemptionList() {
  return new Map<string, AllowlistEntry>();
}

/** Parse the content of the conformance exemption configuration file. */
export function parseConformanceExemptionConfig(
    exemptionConfigPath: string,
    host: ts.ParseConfigHost = ts.sys): ExemptionList|ts.Diagnostic[] {
  const errors: ts.Diagnostic[] = [];

  const jsonContent = host.readFile(exemptionConfigPath)!;
  const jsonSourceFile = ts.parseJsonText(exemptionConfigPath, jsonContent);

  if (!jsonSourceFile.statements.length) {
    errors.push({
      source: 'tsec',
      category: ts.DiagnosticCategory.Error,
      code: 21110,
      file: jsonSourceFile,
      start: 1,
      length: undefined,
      messageText: 'Invalid conformance exemtpion list',
    });
    return errors;
  }

  const jsonObj = jsonSourceFile.statements[0].expression;
  if (!ts.isObjectLiteralExpression(jsonObj)) {
    errors.push(getDiagnosticErrorFromJsonNode(
        jsonObj, jsonSourceFile,
        'Conformance exemption configuration requires a value of type object'));
    return errors;
  }

  const conformanceExemption: ExemptionList = new Map();
  const baseDir = path.dirname(exemptionConfigPath);

  for (const prop of jsonObj.properties) {
    if (!ts.isPropertyAssignment(prop)) {
      errors.push(getDiagnosticErrorFromJsonNode(
          prop, jsonSourceFile, 'Property assignment expected'));
      continue;
    }

    if (prop.name === undefined) continue;

    if (!ts.isStringLiteral(prop.name) ||
        !prop.name.getText(jsonSourceFile).startsWith(`"`)) {
      errors.push(getDiagnosticErrorFromJsonNode(
          prop.name, jsonSourceFile,
          'String literal with double quotes expected'));
      continue;
    }

    const ruleName = prop.name.text;

    if (!ts.isArrayLiteralExpression(prop.initializer)) {
      errors.push(getDiagnosticErrorFromJsonNode(
          prop.initializer, jsonSourceFile,
          `Conformance exemption entry '${
              ruleName}' requires a value of type Array`));
      continue;
    }

    const fileNames = [];

    for (const elem of prop.initializer.elements) {
      if (!ts.isStringLiteral(elem)) {
        errors.push(getDiagnosticErrorFromJsonNode(
            elem, jsonSourceFile,
            `Item of conformance exemption entry '${
                ruleName}' requires values of type string`));
        continue;
      }
      fileNames.push(path.resolve(baseDir, elem.text));
    }


    conformanceExemption.set(ruleName, {
      reason: ExemptionReason.UNSPECIFIED,
      prefix: fileNames,
    });
  }

  return errors.length > 0 ? errors : conformanceExemption;
}
