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

import {ENABLED_RULES} from '../../common/rule_groups';
import {getConfiguredChecker} from '../../common/configured_checker';
import * as ts from 'typescript';

import {createDiagnosticsReporter} from './report';
import {createProxy} from './utils';

/** Check if tsec is invoked in the build mode. */
export function isInBuildMode(cmdArgs: string[]): boolean {
  // --build or -b has to be the first argument
  if (cmdArgs.length && cmdArgs[0].charAt(0) === '-') {
    const optionStart = cmdArgs[0].charAt(1) === '-' ? 2 : 1;
    const firstOption = cmdArgs[0].slice(optionStart);
    return firstOption === 'build' || firstOption === 'b';
  }
  return false;
}

/** Perform security checks on a single project. */
export function performCheck(
  program: ts.Program,
  host: ts.ModuleResolutionHost,
): ts.Diagnostic[] {
  const {checker, errors} = getConfiguredChecker(program, host);

  // Run all enabled checks and collect errors.
  for (const sf of program.getSourceFiles()) {
    // We don't emit errors for delcarations, so might as well skip checking
    // declaration files all together.
    if (sf.isDeclarationFile) continue;
    const tsecErrors = checker
      .execute(sf)
      .map((failure) => failure.toDiagnosticWithStringifiedFixes());
    errors.push(...tsecErrors);
  }

  return errors;
}

const ALL_TSEC_RULE_NAMES = new Set<string | undefined>(
  ENABLED_RULES.map((r) => r.RULE_NAME),
);

/** Perform checks on a monorepo. */
export function performBuild(args: string[]): number {
  // This is an internal interface used by the TS compiler.
  interface ParsedBuildCommand {
    buildOptions: ts.BuildOptions;
    watchOptions: ts.WatchOptions | undefined;
    projects: string[];
    errors: ts.Diagnostic[];
  }

  // TypeScript has an API to parse command lines in build mode, but for some
  // reason it's not public. For now we would like to reuse this facility, so
  // we will use type casts to bypass visibility restrictions.
  const parseBuildCommand =
    // tslint:disable-next-line:ban-module-namespace-object-escape
    (
      ts as unknown as {
        parseBuildCommand: (args: readonly string[]) => ParsedBuildCommand;
      }
    ).parseBuildCommand;

  const {buildOptions, projects, errors} = parseBuildCommand(args);
  const reportDiagnostics = createDiagnosticsReporter(buildOptions);

  if (errors.length !== 0) {
    return reportDiagnostics(errors, /*withSummary*/ true);
  }

  if (projects.length === 0) projects.push('.');

  // This list will be filled by `instrumentedCreateProgram`.
  const allTsecErrors: ts.Diagnostic[] = [];

  const builderErrors: ts.Diagnostic[] = [];
  const builderHost = ts.createSolutionBuilderHost(
    ts.sys,
    instrumentedCreateProgram,
    // Suppress the reporting of builder errors. We will report them with
    // other errors together at the end of the build.
    /*reportDiagnostic*/
    (diag) => {
      if (!ALL_TSEC_RULE_NAMES.has(diag.source)) {
        builderErrors.push(diag);
      }
    },
    /*reportSolutionBuilderStatus*/ undefined,
    // Suppress the reporting of error summary. We will report it later.
    /*reportErrorSummary*/ () => {},
  );

  const builder = ts.createSolutionBuilder(builderHost, projects, buildOptions);
  buildOptions['clean'] ? builder.clean() : builder.build();

  const errorCount = reportDiagnostics(
    [...builderErrors, ...allTsecErrors],
    /*withSummary*/ true,
  );

  return errorCount;

  /**
   * The callback fed to solution builder for creating the program for each.
   * project. tsec performs security checks inside this callback, when the
   * the program is created. The API for JS code emission is instrumented so
   * that tsec errors are respected during code emission.
   */
  function instrumentedCreateProgram(
    rootNames: readonly string[] | undefined,
    options: ts.CompilerOptions | undefined,
    host?: ts.CompilerHost,
    oldProgram?: ts.EmitAndSemanticDiagnosticsBuilderProgram,
    configFileParsingDiagnostics?: readonly ts.Diagnostic[],
    projectReferences?: readonly ts.ProjectReference[],
  ): ts.EmitAndSemanticDiagnosticsBuilderProgram {
    const builderProgram = ts.createEmitAndSemanticDiagnosticsBuilderProgram(
      rootNames,
      options,
      host,
      oldProgram,
      configFileParsingDiagnostics,
      projectReferences,
    );
    const program = builderProgram.getProgram();

    const tsecErrorsInThisProgram = performCheck(
      program,
      host ?? ts.createCompilerHost(program.getCompilerOptions()),
    );
    allTsecErrors.push(...tsecErrorsInThisProgram);

    const tsecErrorsByFile = new Map<string, ts.Diagnostic[]>();
    for (const error of tsecErrorsInThisProgram) {
      const fileName = error.file?.fileName;
      if (fileName !== undefined) {
        let errors = tsecErrorsByFile.get(fileName);
        if (errors === undefined) {
          errors = [];
          tsecErrorsByFile.set(fileName, errors);
        }
        errors.push(error);
      }
    }

    return {
      ...createProxy(builderProgram),
      emit: instrumentedEmit,
    };

    /**
     * Instrumented emit function. JS code won't be emitted for a file if there
     * is any tsec error in it.
     */
    function instrumentedEmit(
      targetSourceFile?: ts.SourceFile,
      writeFile?: ts.WriteFileCallback,
      cancellationToken?: ts.CancellationToken,
      emitOnlyDtsFiles?: boolean,
      customTransformers?: ts.CustomTransformers,
    ): ts.EmitResult {
      if (targetSourceFile === undefined) {
        if (tsecErrorsInThisProgram.length !== 0) {
          return {emitSkipped: true, diagnostics: tsecErrorsInThisProgram};
        }
      } else {
        const tsecErrorsInThisFile = tsecErrorsByFile.get(
          targetSourceFile.fileName,
        );

        if (tsecErrorsInThisFile?.length) {
          return {emitSkipped: true, diagnostics: tsecErrorsInThisFile};
        }
      }

      return builderProgram.emit(
        targetSourceFile,
        writeFile,
        cancellationToken,
        emitOnlyDtsFiles,
        customTransformers,
      );
    }
  }
}
