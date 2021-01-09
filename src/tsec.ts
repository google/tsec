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

import {isInBuildMode, performBuild, performCheck} from './build';
import {createDiagnosticsReporter, FORMAT_DIAGNOSTIC_HOST} from './report';

/**
 * A simple tsc wrapper that runs TSConformance checks over the source files
 * and emits code for files without conformance violations.
 */
function main(args: string[]) {
  if (isInBuildMode(args)) {
    return performBuild(args.slice(1)) === 0 ? 0 : 1;
  }

  let parsedConfig = ts.parseCommandLine(args);
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
    let tsConfigFilePath: string|undefined = parsedConfig.options.project;
    if (tsConfigFilePath === undefined) {
      tsConfigFilePath = ts.findConfigFile('.', ts.sys.fileExists);
    } else if (ts.sys.directoryExists(tsConfigFilePath)) {
      tsConfigFilePath = path.resolve(tsConfigFilePath, 'tsconfig.json');
    }
    if (tsConfigFilePath === undefined ||
        !ts.sys.fileExists(tsConfigFilePath)) {
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
    parsedConfig = ts.getParsedCommandLineOfConfigFile(
        tsConfigFilePath, parsedConfig.options, parseConfigFileHost)!;
  }

  const diagnostics = [...parsedConfig.errors];
  const compilerHost = ts.createCompilerHost(parsedConfig.options, true);

  const program = ts.createProgram(
      parsedConfig.fileNames, parsedConfig.options, compilerHost);

  diagnostics.push(
      ...ts.getPreEmitDiagnostics(program), ...performCheck(program));

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

  const reportDiagnostics = createDiagnosticsReporter(parsedConfig.options);
  const errorCount = reportDiagnostics(diagnostics, /*withSummary*/ true);

  return errorCount === 0 ? 0 : 1;
}

process.exitCode = main(process.argv.slice(2));
