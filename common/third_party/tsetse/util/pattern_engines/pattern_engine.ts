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

import * as ts from 'typescript';

import {Allowlist} from '../../allowlist';
import {Checker} from '../../checker';
import {Fix, Fixer} from '../../util/fixer';
import {PatternEngineConfig} from '../../util/pattern_config';
import {getLineColumn, shouldExamineNode} from '../ast_tools';
import {giveConfidence} from '../confidence';
import {explainDiagnosticsCollector} from '../explain_diagnostics';
import {Match} from './match';

/**
 * A patternEngine is the logic that handles a specific PatternKind.
 */
export abstract class PatternEngine {
  private readonly allowlist: Allowlist;

  constructor(
    protected readonly ruleName: string,
    protected readonly config: PatternEngineConfig,
    protected readonly fixers?: Fixer[],
  ) {
    this.allowlist = new Allowlist(config.allowlistEntries);
  }

  /**
   * `register` will be called by the ConformanceRule to tell Tsetse the
   * PatternEngine will handle matching. Implementations should use
   * `checkAndFilterResults` as a wrapper for `check`.
   */
  abstract register(checker: Checker): void;

  /**
   * A composer that wraps checking functions with code handling aspects of the
   * analysis that are not engine-specific, and which defers to the
   * subclass-specific logic afterwards. Subclasses should transform their
   * checking logic with this composer before registered on the checker.
   */
  protected wrapCheckWithAllowlistingAndFixer<T extends ts.Node>(
    matchFunction: (tc: ts.TypeChecker, n: T) => Match<ts.Node> | undefined,
  ): (c: Checker, n: T) => void {
    return (c: Checker, n: T) => {
      const sf = n.getSourceFile();
      if (!shouldExamineNode(n) || sf.isDeclarationFile) {
        return;
      }
      const match = matchFunction(c.typeChecker, n);
      if (match === undefined) {
        return;
      }
      const {node: matchedNode} = match;
      const fixes = this.fixers
        ?.map((fixer) => fixer.getFixForFlaggedNode(matchedNode))
        ?.filter((fix): fix is Fix => fix !== undefined);
      const confidence = giveConfidence(match);
      c.addFailureAtNode(
        matchedNode,
        this.config.errorMessage,
        this.ruleName,
        this.allowlist,
        fixes,
        undefined,
        confidence,
      );
    };
  }

  /**
   * A wrapper that logs the rule name on the diagnostics collector before
   * calling the match function.
   */
  protected wrapMatchWithExplainDiagnosticsLogs<F extends Function>(
    matchFunction: F,
  ): F {
    return ((...args: unknown[]) => {
      const node = args[1] as ts.Node;
      explainDiagnosticsCollector.pushEvent(
        `Evaluating rule: ${this.ruleName} for \`${node.getText()}\` ${stringifyLineColumn(getLineColumn(node.getStart(), node.getSourceFile()))}`,
      );
      return matchFunction(...args);
    }) as unknown as F;
  }
}

function stringifyLineColumn({line, column}: {line: number; column: number}) {
  return `Ln${line},Col${column}`;
}
