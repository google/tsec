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

import {isInBuildMode, performBuild, performConformanceCheck} from './build';
import {createEmptyExemptionList, ExemptionList, parseConformanceExemptionConfig} from './exemption_config';
import {FORMAT_DIAGNOSTIC_HOST, reportDiagnostic, reportDiagnosticsWithSummary, reportErrorSummary} from './report';
import {ExtendedParsedCommandLine, parseTsConfigFile} from './tsconfig';

/**
 * A simple tsc wrapper that runs TSConformance checks over the source files
 * and emits code for files without conformance violations.
 */
function main(args: string[]) {
  if (isInBuildMode(args)) {
    return performBuild(args.slice(1)) === 0 ? 0 : 1;
  }

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
    const tsConfigFilePath = ts.findConfigFile(
        parsedConfig.options.project ?? '.', ts.sys.fileExists);
    if (tsConfigFilePath === undefined) {
      ts.sys.write('tsec: Cannot find project configuration.');
      ts.sys.write(ts.sys.newLine);
      return 1;
    }
    const parseConfigFileHost: ts.ParseConfigFileHost = {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: (diagnostic: ts.Diagnostic) => {
        ts.sys.write(ts.formatDiagnostic(diagnostic, FORMAT_DIAGNOSTIC_HOST));
        ts.sys.exit(1);
      }
    };
    parsedConfig = parseTsConfigFile(
        tsConfigFilePath, parsedConfig.options, parseConfigFileHost);
  }

  const diagnostics = [...parsedConfig.errors];

  // Try locating and parsing exemption list.
  let conformanceExemptionConfig: ExemptionList = createEmptyExemptionList();
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

  diagnostics.push(
      ...performConformanceCheck(program, conformanceExemptionConfig));

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
