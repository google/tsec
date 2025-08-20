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

import {Checker} from '../../checker';
import {PropertyMatcherDescriptor} from '../pattern_config';
import {PropertyMatcher} from '../property_matcher';

import {Match, NameMatchConfidence, TypeMatchConfidence} from './match';
import {PatternEngine} from './pattern_engine';

/** Match an AST node with a property matcher. */
export function matchProperty(
  tc: ts.TypeChecker,
  n: ts.PropertyAccessExpression | ts.ElementAccessExpression,
  matcher: PropertyMatcher,
): Match<ts.Node> | undefined {
  const typeMatch = matcher.typeMatches(tc.getTypeAtLocation(n.expression), tc);
  if (typeMatch === TypeMatchConfidence.LEGACY_NO_MATCH) return;
  return {
    node: n,
    typeMatch,
    nameMatch: NameMatchConfidence.EXACT,
  };
}

/**
 * Engine for the BANNED_PROPERTY pattern. It captures accesses to property
 * matching the spec regardless whether it's a read or write.
 */
export class PropertyEngine extends PatternEngine {
  protected registerWith(checker: Checker, matchNode: typeof matchProperty) {
    for (const value of this.config.values) {
      if (!(value instanceof PropertyMatcherDescriptor)) {
        throw new Error(
          `PropertyEngine (through BANNED_PROPERTY) requires a PropertyMatcherDescriptor.`,
        );
      }
      const matcher = PropertyMatcher.fromSpec(value, {
        useTypedPropertyMatching: this.config.useTypedPropertyMatcher || false,
      });
      checker.onNamedPropertyAccess(
        matcher.bannedProperty,
        this.wrapCheckWithAllowlistingAndFixer((tc, n) =>
          matchNode(tc, n, matcher),
        ),
        this.config.errorCode,
      );

      checker.onStringLiteralElementAccess(
        matcher.bannedProperty,
        this.wrapCheckWithAllowlistingAndFixer((tc, n) =>
          matchNode(tc, n, matcher),
        ),
        this.config.errorCode,
      );
    }
  }

  register(checker: Checker) {
    this.registerWith(checker, matchProperty);
  }
}
