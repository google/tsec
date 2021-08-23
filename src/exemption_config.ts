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

import * as glob from 'glob';
import {AllowlistEntry, ExemptionReason} from './third_party/tsetse/allowlist';
import * as minimatch from 'minimatch';
import * as path from 'path';
import * as ts from 'typescript';

/**
 * Stores exemption list configurations by rules. Supports commonly used Map
 * operations.
 */
export class ExemptionList {
  // Extending Map<string, AllowlistEntry> doesn't work in ES5.
  private readonly map: Map<string, AllowlistEntry>;

  constructor(copyFrom?: ExemptionList) {
    this.map = new Map(copyFrom?.map.entries() ?? []);
  }

  get(rule: string): AllowlistEntry|undefined {
    return this.map.get(rule);
  }

  set(rule: string, allowlistEntry: AllowlistEntry) {
    this.map.set(rule, allowlistEntry);
  }

  entries() {
    return this.map.entries();
  }

  get size() {
    return this.map.size;
  }
}

/** Get the path of the exemption configuration file from compiler options. */
export function resolveExemptionConfigPath(configFilePath: string): string|
    undefined {
  if (!ts.sys.fileExists(configFilePath)) {
    configFilePath += ts.Extension.Json;
    if (!ts.sys.fileExists(configFilePath)) {
      return undefined;
    }
  }

  const {config} = ts.readConfigFile(configFilePath, ts.sys.readFile);
  const options = config?.compilerOptions;

  const configFileDir = path.dirname(configFilePath);

  if (Array.isArray(options?.plugins)) {
    for (const plugin of options.plugins as ts.PluginImport[]) {
      if (plugin.name !== 'tsec') continue;
      const {exemptionConfig} = plugin as {exemptionConfig?: unknown};
      if (typeof exemptionConfig === 'string') {
        // Path of the exemption config is relative to the path of
        // tsconfig.json. Resolve it to the absolute path.
        const resolvedPath = path.resolve(configFileDir, exemptionConfig);
        // Always returned a path to an existing file so that tsec won't crash.
        if (ts.sys.fileExists(resolvedPath)) {
          return resolvedPath;
        }
      }
    }
  }

  if (typeof config.extends === 'string') {
    return resolveExemptionConfigPath(
        path.resolve(configFileDir, config.extends));
  }

  return undefined;
}

/** Create a Diagnostic for a JSON node from a configuration file */
function getDiagnosticErrorFromJsonNode(
    node: ts.Node, file: ts.JsonSourceFile,
    messageText: string): ts.Diagnostic {
  const start = node.getStart(file);
  const length = node.getEnd() - start;
  return {
    source: 'tsec',
    category: ts.DiagnosticCategory.Error,
    code: 21110,
    file,
    start,
    length,
    messageText,
  };
}

/** Parse the content of the exemption configuration file. */
export function parseExemptionConfig(exemptionConfigPath: string):
    ExemptionList|ts.Diagnostic[] {
  const errors: ts.Diagnostic[] = [];

  const jsonContent = ts.sys.readFile(exemptionConfigPath)!;
  const jsonSourceFile = ts.parseJsonText(exemptionConfigPath, jsonContent);

  if (!jsonSourceFile.statements.length) {
    errors.push({
      source: 'tsec',
      category: ts.DiagnosticCategory.Error,
      code: 21110,
      file: jsonSourceFile,
      start: 1,
      length: undefined,
      messageText: 'Invalid exemtpion list',
    });
    return errors;
  }

  const jsonObj = jsonSourceFile.statements[0].expression;
  if (!ts.isObjectLiteralExpression(jsonObj)) {
    errors.push(getDiagnosticErrorFromJsonNode(
        jsonObj, jsonSourceFile,
        'Exemption configuration requires a value of type object'));
    return errors;
  }

  const exemption = new ExemptionList();
  const baseDir = path.dirname(exemptionConfigPath);
  const globOptions = {cwd: baseDir, absolute: true, silent: true};

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
          `Exemption entry '${ruleName}' requires a value of type Array`));
      continue;
    }

    const fileNames: string[] = [];
    const patterns: string[] = [];

    for (const elem of prop.initializer.elements) {
      if (!ts.isStringLiteral(elem)) {
        errors.push(getDiagnosticErrorFromJsonNode(
            elem, jsonSourceFile,
            `Item of exemption entry '${
                ruleName}' requires values of type string`));
        continue;
      }
      if (glob.hasMagic(elem.text, globOptions)) {
        let pattern = elem.text;
        if (!pattern.startsWith('/')) {
          pattern = baseDir + '/' + pattern;
        }
        patterns.push(
            // Strip the leading and trailing '/' from the stringified regexp.
            minimatch.makeRe(pattern, {}).toString().slice(1, -1));
      } else {
        fileNames.push(path.resolve(baseDir, elem.text));
      }
    }

    exemption.set(ruleName, {
      reason: ExemptionReason.UNSPECIFIED,
      prefix: fileNames,
      regexp: patterns,
    });
  }

  return errors.length > 0 ? errors : exemption;
}
