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
import {shouldExamineNode} from '../../third_party/tsetse/util/ast_tools';
import {isLiteral} from '../../third_party/tsetse/util/is_literal';
import {PropertyMatcher} from '../../third_party/tsetse/util/property_matcher';
import * as ts from 'typescript';

import {RuleConfiguration} from '../../rule_configuration';

let errMsg =
    'Do not use Element#setAttribute or similar APIs, as this can lead to XSS.';

const BANNED_APIS = [
  'Element.prototype.setAttribute',
  'Element.prototype.setAttributeNS',
  'Element.prototype.setAttributeNode',
  'Element.prototype.setAttributeNodeNS',
];

/**
 * Security sensitive attribute names that should not be set through
 * `setAttribute` or similar functions.
 */
export const SECURITY_SENSITIVE_ATTRIBUTES = new Set([
  'src',
  'srcdoc',
]);

function matchNode(
    tc: ts.TypeChecker,
    n: ts.PropertyAccessExpression|ts.ElementAccessExpression,
    matcher: PropertyMatcher) {
  if (!shouldExamineNode(n)) return;
  if (!matcher.typeMatches(tc.getTypeAtLocation(n.expression))) return;

  // Check if the matched node is a call to `setAttribute` and
  // if the attribute name is a literal. We will skip matching if
  // the attribute name is not in the blocklist.
  if (!ts.isCallExpression(n.parent)) return n;
  if (n.parent.expression !== n) return n;
  if (matcher.bannedProperty === 'setAttribute') {
    // It's OK if someone provided the wrong number of arguments because the
    // code will have other compiler errors.
    if (n.parent.arguments.length !== 2) return;
    const ty = tc.getTypeAtLocation(n.parent.arguments[0]);
    if (ty.isStringLiteral() &&
        !SECURITY_SENSITIVE_ATTRIBUTES.has(ty.value.toLowerCase()) &&
        isLiteral(tc, n.parent.arguments[0])) {
      return;
    }
  }

  return n;
}

/** A Rule that looks for use of Element#setAttribute and similar properties. */
export class Rule extends AbstractRule {
  static readonly RULE_NAME = 'ban-element-setattribute';

  readonly ruleName = Rule.RULE_NAME;
  readonly code = ErrorCode.CONFORMANCE_PATTERN;

  private readonly propMatchers: readonly PropertyMatcher[];
  private readonly allowlist?: Allowlist;

  constructor(configuration: RuleConfiguration = {}) {
    super();
    this.propMatchers = BANNED_APIS.map(PropertyMatcher.fromSpec);
    if (configuration.allowlistEntries) {
      this.allowlist = new Allowlist(configuration.allowlistEntries);
    }
  }

  register(checker: Checker) {
    for (const matcher of this.propMatchers) {
      checker.onNamedPropertyAccess(matcher.bannedProperty, (c, n) => {
        const node = matchNode(c.typeChecker, n, matcher);
        if (node) {
          checker.addFailureAtNode(
              node, errMsg, Rule.RULE_NAME, this.allowlist);
        }
      }, this.code);

      checker.onStringLiteralElementAccess(matcher.bannedProperty, (c, n) => {
        const node = matchNode(c.typeChecker, n, matcher);
        if (node) {
          checker.addFailureAtNode(
              node, errMsg, Rule.RULE_NAME, this.allowlist);
        }
      }, this.code);
    }
  }
}
