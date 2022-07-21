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

import {ESLintUtils} from '@typescript-eslint/utils';
import {getConfiguredChecker} from '../../common/configured_checker';
import {Checker} from '../../common/third_party/tsetse/checker';
import * as ts from 'typescript';

const createRule = ESLintUtils.RuleCreator(
    name => 'https://github.com/google/tsec',
);

// The checker is defined here so that it can be instantiated once and re-used
// for each parsed file
let checker: Checker;

/**
 * Rule to check Trusted Types compliance
 */
export const trustedTypesChecks: unknown = createRule({
  name: 'trusted-types-checks',
  meta: {
    type: 'problem',
    docs: {
      description: 'Checks Trusted Types compliance',
      recommended: 'error',
    },
    messages: {},
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    // Skip checking declaration files
    if (context.getFilename().endsWith('.d.ts')) {
      return {};
    }

    const parserServices = ESLintUtils.getParserServices(context);

    // Instantiates the checker if it has not been defined yet
    if (!checker) {
      checker = getConfiguredChecker(
                    parserServices.program,
                    ts.createCompilerHost(
                        parserServices.program.getCompilerOptions()))
                    .checker;
    }

    return {
      // Naming corresponds to ESTree node type
      // tslint:disable-next-line:enforce-name-casing
      Program(node) {
        const tsRootNode = parserServices.esTreeNodeToTSNodeMap.get(node);

        // Run all enabled checks
        const {failures} = checker.execute(tsRootNode, true);

        // Report the detected errors
        for (const failure of failures) {
          const diagnostic = failure.toDiagnostic();
          const start =
              ts.getLineAndCharacterOfPosition(tsRootNode, diagnostic.start!);
          const end =
              ts.getLineAndCharacterOfPosition(tsRootNode, diagnostic.end);

          context.report({
            loc: {
              start: {line: start.line + 1, column: start.character},
              end: {line: end.line + 1, column: end.character}
            },
            message: diagnostic.messageText,
            // Need to cast here because the type definition disallows the
            // message property from being used and instead requires messageIds,
            // however we cannot use messageIds as our messages can be dynamic
            // tslint:disable-next-line:no-any
          } as any);
        }
      }
    };
  },
});
