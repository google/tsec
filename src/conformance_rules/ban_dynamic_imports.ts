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

import {Checker} from '../third_party/tsetse/checker';
import {ErrorCode} from '../third_party/tsetse/error_code';
import {AbstractRule} from '../third_party/tsetse/rule';
import {Allowlist, AllowlistEntry} from '../third_party/tsetse/util/allowlist';

import * as path from 'path';
import * as ts from 'typescript';

/** A rule that checks the uses of dynamic imports. */
export class Rule extends AbstractRule {
  static readonly RULE_NAME = 'ban-dynamic-imports';
  readonly ruleName = Rule.RULE_NAME;
  readonly code = ErrorCode.CONFORMANCE_PATTERN;

  static readonly errorMessage =
      'Do not use dynamic import since it can bypass CSP and lead to XSS.';

  private readonly allowlist?: Allowlist;

  constructor(allowlistEntries?: AllowlistEntry[]) {
    super();
    if (allowlistEntries) {
      this.allowlist = new Allowlist(allowlistEntries);
    }
  }

  register(checker: Checker) {
    checker.on(ts.SyntaxKind.ImportKeyword, (checker, node) => {
      if (!ts.isCallExpression(node.parent)) return;
      if (this.allowlist?.isAllowlisted(
              path.resolve(node.getSourceFile().fileName))) {
        return;
      }
      checker.addFailureAtNode(node, Rule.errorMessage);
    }, this.code);
  }
}
