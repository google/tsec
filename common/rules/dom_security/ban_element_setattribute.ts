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

import {Allowlist} from '../../third_party/tsetse/allowlist';
import {Checker} from '../../third_party/tsetse/checker';
import {ErrorCode} from '../../third_party/tsetse/error_code';
import {AbstractRule} from '../../third_party/tsetse/rule';
import {shouldExamineNode} from '../../third_party/tsetse/util/ast_tools';
import {giveConfidence} from '../../third_party/tsetse/util/confidence';
import {isLiteral} from '../../third_party/tsetse/util/is_literal';
import {PropertyMatcherDescriptor} from '../../third_party/tsetse/util/pattern_config';
import {
  Match,
  NameMatchConfidence,
  TypeMatchConfidence,
} from '../../third_party/tsetse/util/pattern_engines/match';
import {PropertyMatcher} from '../../third_party/tsetse/util/property_matcher';
import * as ts from 'typescript';

import {RuleConfiguration} from '../../rule_configuration';

const BANNED_APIS = [
  new PropertyMatcherDescriptor('Element.prototype.setAttribute'),
  new PropertyMatcherDescriptor('Element.prototype.setAttributeNS'),
  new PropertyMatcherDescriptor('Element.prototype.setAttributeNode'),
  new PropertyMatcherDescriptor('Element.prototype.setAttributeNodeNS'),
];

/**
 * Trusted Types related attribute names that should not be set through
 * `setAttribute` or similar functions.
 */
export const TT_RELATED_ATTRIBUTES: Set<string> = new Set([
  'src',
  'srcdoc',
  'data',
  'codebase',
]);

/** A Rule that looks for use of Element#setAttribute and similar properties. */
export abstract class BanSetAttributeRule extends AbstractRule {
  readonly code: ErrorCode = ErrorCode.CONFORMANCE_PATTERN;

  private readonly propMatchers: readonly PropertyMatcher[];
  private readonly allowlist?: Allowlist;

  constructor(configuration: RuleConfiguration) {
    super();
    this.propMatchers = BANNED_APIS.map(
      (descriptor) => PropertyMatcher.fromSpec(descriptor),
      {
        useTypedPropertyMatching: true,
      },
    );
    if (configuration.allowlistEntries) {
      this.allowlist = new Allowlist(configuration.allowlistEntries);
    }
  }

  protected abstract readonly errorMessage: string;
  protected abstract readonly isSecuritySensitiveAttrName: (
    attr: string,
  ) => boolean;

  /**
   * The flag that controls whether the rule matches the "unsure" cases. For all
   * rules that extends this class, only one of them should set this to true,
   * otherwise we will get essentially duplicate finidngs.
   */
  protected abstract readonly looseMatch: boolean;

  /**
   * Check if the attribute name is a literal in a setAttribute call. We will
   * skip matching if the attribute name is not in the blocklist.
   */
  private isCalledWithAllowedAttribute(
    typeChecker: ts.TypeChecker,
    node: ts.CallExpression,
  ): boolean {
    // The 'setAttribute' function expects exactly two arguments: an attribute
    // name and a value. It's OK if someone provided the wrong number of
    // arguments because the code will have other compiler errors.
    if (node.arguments.length !== 2) return true;
    return this.isAllowedAttribute(typeChecker, node.arguments[0]);
  }

  /**
   * Check if the attribute name is a literal and the namespace is null in a
   * setAttributeNS call. We will skip matching if the attribute name is not in
   * the blocklist.
   */
  private isCalledWithAllowedAttributeNS(
    typeChecker: ts.TypeChecker,
    node: ts.CallExpression,
  ): boolean {
    // The 'setAttributeNS' function expects exactly three arguments: a
    // namespace, an attribute name and a value. It's OK if someone provided the
    // wrong number of arguments because the code will have other compiler
    // errors.
    if (node.arguments.length !== 3) return true;
    return (
      node.arguments[0].kind === ts.SyntaxKind.NullKeyword &&
      this.isAllowedAttribute(typeChecker, node.arguments[1])
    );
  }

  /**
   * Check if the attribute name is a literal that is not in the blocklist.
   */
  private isAllowedAttribute(
    typeChecker: ts.TypeChecker,
    attr: ts.Expression,
  ): boolean {
    const attrType = typeChecker.getTypeAtLocation(attr);
    if (this.looseMatch) {
      return (
        attrType.isStringLiteral() &&
        !this.isSecuritySensitiveAttrName(attrType.value.toLowerCase()) &&
        isLiteral(typeChecker, attr)
      );
    } else {
      return (
        !attrType.isStringLiteral() ||
        !isLiteral(typeChecker, attr) ||
        !this.isSecuritySensitiveAttrName(attrType.value.toLowerCase())
      );
    }
  }

  private matchNode(
    tc: ts.TypeChecker,
    n: ts.PropertyAccessExpression | ts.ElementAccessExpression,
    matcher: PropertyMatcher,
  ): Match<ts.Node> | undefined {
    if (!shouldExamineNode(n)) {
      return undefined;
    }

    const typeMatch = matcher.typeMatches(
      tc.getTypeAtLocation(n.expression),
      tc,
    );
    if (typeMatch === TypeMatchConfidence.LEGACY_NO_MATCH) {
      // Allowed: it is a different type.
      return undefined;
    }

    if (!ts.isCallExpression(n.parent)) {
      // Possibly not allowed: not calling it (may be renaming it).
      return this.looseMatch
        ? {node: n, typeMatch, nameMatch: NameMatchConfidence.EXACT}
        : undefined;
    }

    if (n.parent.expression !== n) {
      // Possibly not allowed: calling a different function with it (may be
      // renaming it).
      return this.looseMatch
        ? {node: n, typeMatch, nameMatch: NameMatchConfidence.EXACT}
        : undefined;
    }

    // If the matched node is a call to `setAttribute` (not setAttributeNS, etc)
    // and it's not setting a security sensitive attribute.
    if (matcher.bannedProperty === 'setAttribute') {
      const isAllowedAttr = this.isCalledWithAllowedAttribute(tc, n.parent);
      if (this.looseMatch) {
        // Allowed: it is not a security sensitive attribute.
        if (isAllowedAttr) return undefined;
      } else {
        return isAllowedAttr
          ? undefined
          : {node: n, typeMatch, nameMatch: NameMatchConfidence.EXACT};
      }
    }

    // If the matched node is a call to `setAttributeNS` with a null namespace
    // and it's not setting a security sensitive attribute.
    if (matcher.bannedProperty === 'setAttributeNS') {
      const isAllowedAttr = this.isCalledWithAllowedAttributeNS(tc, n.parent);
      if (this.looseMatch) {
        // Allowed: it is not a security sensitive attribute.
        if (isAllowedAttr) return undefined;
      } else {
        return isAllowedAttr
          ? undefined
          : {node: n, typeMatch, nameMatch: NameMatchConfidence.EXACT};
      }
    }

    return this.looseMatch
      ? {node: n, typeMatch, nameMatch: NameMatchConfidence.EXACT}
      : undefined;
  }

  register(checker: Checker): void {
    for (const matcher of this.propMatchers) {
      checker.onNamedPropertyAccess(
        matcher.bannedProperty,
        (c, n) => {
          const matchResult = this.matchNode(c.typeChecker, n, matcher);
          if (matchResult) {
            checker.addFailureAtNode(
              matchResult.node,
              this.errorMessage,
              this.ruleName,
              this.allowlist,
              undefined,
              undefined,
              giveConfidence(matchResult),
            );
          }
        },
        this.code,
      );

      checker.onStringLiteralElementAccess(
        matcher.bannedProperty,
        (c, n) => {
          const matchResult = this.matchNode(c.typeChecker, n, matcher);
          if (matchResult) {
            checker.addFailureAtNode(
              matchResult.node,
              this.errorMessage,
              this.ruleName,
              this.allowlist,
              undefined,
              undefined,
              giveConfidence(matchResult),
            );
          }
        },
        this.code,
      );
    }
  }
}

let errMsg =
  'Do not use Element#setAttribute or similar APIs, as this can lead to XSS or cause Trusted Types violations.';

/** A Rule that looks for use of Element#setAttribute and similar properties. */
export class Rule extends BanSetAttributeRule {
  static readonly RULE_NAME = 'ban-element-setattribute';

  override readonly ruleName: string = Rule.RULE_NAME;

  protected readonly errorMessage: string = errMsg;
  protected isSecuritySensitiveAttrName = (attr: string): boolean =>
    (attr.startsWith('on') && attr !== 'on') || TT_RELATED_ATTRIBUTES.has(attr);
  protected readonly looseMatch = true;

  constructor(configuration: RuleConfiguration = {}) {
    super(configuration);
  }
}
