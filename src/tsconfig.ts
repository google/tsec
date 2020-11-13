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

/**
 * Extended parsed command line including the path to conformance exemption
 * file
 */
export interface ExtendedParsedCommandLine extends ts.ParsedCommandLine {
  conformanceExemptionPath?: string;
}

/** Create a Diagnostic for a JSon node from a configuration file */
export function getDiagnosticErrorFromJsonNode(
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


/** Parse tsec-recognizable tsconfig */
export function parseTsConfigFile(
    tsConfigPath: string, existingOptions: ts.CompilerOptions,
    host: ts.ParseConfigFileHost): ExtendedParsedCommandLine {
  // Parse the officially supported portion of tsconfig.json
  const parsedConfig: ExtendedParsedCommandLine =
      ts.getParsedCommandLineOfConfigFile(tsConfigPath, existingOptions, host)!;

  // Parse tsconfig again directly into a raw json object to quickly check
  // if the "conformanceExemptionPath" option is set.
  const {config} = ts.readConfigFile(tsConfigPath, host.readFile);
  if (config?.conformanceExemptionPath === undefined) {
    return parsedConfig;
  }

  parsedConfig.conformanceExemptionPath =
      parseConformanceExemptionPath(tsConfigPath, parsedConfig.errors);

  return parsedConfig;

  /** Parse exemption list related part. */
  function parseConformanceExemptionPath(
      jsonPath: string, errors: ts.Push<ts.Diagnostic>,
      existingFilePath?: string): string|undefined {
    const jsonContent = host.readFile(jsonPath);
    if (jsonContent === undefined) {
      return undefined;
    }

    // We want to emit diagnostic errors, so we need to parse the tsconfig.json
    // file into a JsonSourceFile to get the AST.
    const jsonSourceFile = ts.parseJsonText(jsonPath, jsonContent);

    // tsconfig.json itself is malformed. Errors should already have been
    // reported by ts.parseJsonConfigFileContent.
    if (!jsonSourceFile.statements.length) {
      return undefined;
    }
    const jsonObjLit = jsonSourceFile.statements[0].expression;
    if (!ts.isObjectLiteralExpression(jsonObjLit)) {
      return undefined;
    }

    for (const prop of jsonObjLit.properties) {
      if (!ts.isPropertyAssignment(prop)) continue;
      if (prop.name && ts.isStringLiteral(prop.name) &&
          prop.name.text === 'conformanceExemptionPath') {
        if (!ts.isStringLiteral(prop.initializer)) {
          errors.push(getDiagnosticErrorFromJsonNode(
              prop.initializer, jsonSourceFile,
              `Compiler option 'conformanceExemptionPath' requires a value of type string`));
        } else {
          const filePath =
              path.resolve(path.dirname(tsConfigPath), prop.initializer.text);
          existingFilePath = existingFilePath ?? filePath;
          if (!host.fileExists(filePath)) {
            errors.push(getDiagnosticErrorFromJsonNode(
                prop.initializer, jsonSourceFile,
                `File '${prop.initializer.text}' not found`));
          }
        }
      }
    }

    // Recursively parse base tsconfig.json files, even if we have already
    // optained a valid path for the exemption list. There may be errors in base
    // files and we want to capture them.
    const json = ts.convertToObject(jsonSourceFile, errors);
    if (json.extends) {
      const extendedTsConfigPath = json.extends;
      return parseConformanceExemptionPath(
          extendedTsConfigPath, errors, existingFilePath);
    } else {
      return existingFilePath;
    }
  }
}
