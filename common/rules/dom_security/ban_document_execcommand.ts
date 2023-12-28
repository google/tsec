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
  "Do not use document.execCommand('insertHTML'), as this can lead to XSS.";

function matchNode(
  tc: ts.TypeChecker,
  n: ts.PropertyAccessExpression | ts.ElementAccessExpression,
  matcher: PropertyMatcher,
) {
  if (!shouldExamineNode(n)) return;
  if (!matcher.typeMatches(tc.getTypeAtLocation(n.expression))) return;

  // Check if the matched node is a call to `execCommand` and if the command
  // name is a literal. We will skip matching if the command name is not in
  // the blocklist.
  if (!ts.isCallExpression(n.parent)) return;
  if (n.parent.expression !== n) return;
  // It's OK if someone provided the wrong number of arguments because the code
  // will have other compiler errors.
  if (n.parent.arguments.length < 1) return;
  const ty = tc.getTypeAtLocation(n.parent.arguments[0]);
  if (
    ty.isStringLiteral() &&
    ty.value.toLowerCase() !== 'inserthtml' &&
    isLiteral(tc, n.parent.arguments[0])
  ) {
    return;
  }

  return n;
}

/** A Rule that looks for use of Document#execCommand. */
export class Rule extends AbstractRule {
  static readonly RULE_NAME = 'ban-document-execcommand';

  readonly ruleName = Rule.RULE_NAME;
  readonly code = ErrorCode.CONFORMANCE_PATTERN;

  private readonly propMatcher: PropertyMatcher;
  private readonly allowlist?: Allowlist;

  constructor(configuration: RuleConfiguration = {}) {
    super();
    this.propMatcher = PropertyMatcher.fromSpec(
      'Document.prototype.execCommand',
    );
    if (configuration.allowlistEntries) {
      this.allowlist = new Allowlist(configuration.allowlistEntries);
    }
  }

  register(checker: Checker) {
    checker.onNamedPropertyAccess(
      this.propMatcher.bannedProperty,
      (c, n) => {
        const node = matchNode(c.typeChecker, n, this.propMatcher);
        if (node) {
          checker.addFailureAtNode(
            node,
            errMsg,
            Rule.RULE_NAME,
            this.allowlist,
          );
        }
      },
      this.code,
    );

    checker.onStringLiteralElementAccess(
      this.propMatcher.bannedProperty,
      (c, n) => {
        const node = matchNode(c.typeChecker, n, this.propMatcher);
        if (node) {
          checker.addFailureAtNode(
            node,
            errMsg,
            Rule.RULE_NAME,
            this.allowlist,
          );
        }
      },
      this.code,
    );
  }
}
