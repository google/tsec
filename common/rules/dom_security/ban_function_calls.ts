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

import {Allowlist} from '../../third_party/tsetse/allowlist';
import {Checker} from '../../third_party/tsetse/checker';
import {ErrorCode} from '../../third_party/tsetse/error_code';
import {AbstractRule} from '../../third_party/tsetse/rule';
import {AbsoluteMatcher} from '../../third_party/tsetse/util/absolute_matcher';
import {shouldExamineNode} from '../../third_party/tsetse/util/ast_tools';
import {isExpressionOfAllowedTrustedType} from '../../third_party/tsetse/util/is_trusted_type';
import {TRUSTED_SCRIPT} from '../../third_party/tsetse/util/trusted_types_configuration';
import * as ts from 'typescript';

import {RuleConfiguration} from '../../rule_configuration';

let errMsg = 'Constructing functions from strings can lead to XSS.';

/**
 * A Rule that looks for calls to the constructor of Function, either directly
 * or through Function.prototype.constructor.
 */
export class Rule extends AbstractRule {
  static readonly RULE_NAME = 'ban-function-calls';
  readonly ruleName = Rule.RULE_NAME;
  readonly code = ErrorCode.CONFORMANCE_PATTERN;

  private readonly allowTrustedTypes: boolean = true;
  private readonly nameMatcher: AbsoluteMatcher;
  private readonly allowlist?: Allowlist;

  constructor(configuration: RuleConfiguration = {}) {
    super();
    this.nameMatcher = new AbsoluteMatcher('GLOBAL|Function');
    if (configuration?.allowlistEntries) {
      this.allowlist = new Allowlist(configuration?.allowlistEntries);
    }
  }

  register(checker: Checker) {
    const check = (c: Checker, n: ts.Node) => {
      const node = this.checkNode(c.typeChecker, n, this.nameMatcher);
      if (node) {
        checker.addFailureAtNode(node, errMsg, Rule.RULE_NAME, this.allowlist);
      }
    };
    checker.onNamedIdentifier(this.nameMatcher.bannedName, check, this.code);
    checker.onStringLiteralElementAccess(
      'Function',
      (c, n) => {
        check(c, n.argumentExpression);
      },
      this.code,
    );
  }

  private checkNode(
    tc: ts.TypeChecker,
    n: ts.Node,
    matcher: AbsoluteMatcher,
  ): ts.Node | undefined {
    let matched: (ts.Node & {arguments: readonly ts.Expression[]}) | undefined =
      undefined;

    if (!shouldExamineNode(n)) return;
    if (!matcher.matches(n, tc)) return;

    if (!n.parent) return;

    // Function can be accessed through window or other globalThis objects
    // through the dot or bracket syntax. Check if we are seeing one of these
    // cases
    if (
      (ts.isPropertyAccessExpression(n.parent) && n.parent.name === n) ||
      ts.isElementAccessExpression(n.parent)
    ) {
      n = n.parent;
    }
    // Additionally cover the case `(Function)('bad script')`.
    // Note: there can be parentheses in every expression but we cann't afford
    // to check all of them. Leave other cases unchecked until we see real
    // bypasses.
    if (ts.isParenthesizedExpression(n.parent)) {
      n = n.parent;
    }

    const parent = n.parent;

    // Check if the matched node is part of a `new Function(string)` or
    // `Function(string)` expression
    if (ts.isNewExpression(parent) || ts.isCallExpression(parent)) {
      if (parent.expression === n && parent.arguments?.length) {
        matched = parent as Exclude<typeof matched, undefined>;
      }
    } else {
      if (!parent.parent || !parent.parent.parent) return;

      // Check if the matched node is part of a
      // `Function.prototype.constructor(string)` expression.
      if (
        ts.isPropertyAccessExpression(parent) &&
        parent.name.text === 'prototype' &&
        ts.isPropertyAccessExpression(parent.parent) &&
        parent.parent.name.text === 'constructor' &&
        ts.isCallExpression(parent.parent.parent) &&
        parent.parent.parent.expression === parent.parent &&
        parent.parent.parent.arguments.length
      ) {
        matched = parent.parent.parent;
      }
    }

    // If the constructor is called with TrustedScript arguments, do not flag it
    // (if the rule is confugired this way).
    if (
      matched &&
      this.allowTrustedTypes &&
      matched.arguments.every((arg) =>
        isExpressionOfAllowedTrustedType(tc, arg, TRUSTED_SCRIPT),
      )
    ) {
      return;
    }

    return matched;
  }
}
