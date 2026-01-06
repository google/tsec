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
import {TSETSE_STATS_COLLECTION_ENABLED} from './compilation_define';
import {
  explainDiagnosticsCollector,
  isExplainDiagnosticsEnabled,
} from './explain_diagnostics';
import {PatternDescriptor, PropertyMatcherDescriptor} from './pattern_config';
import {
  Match,
  NameMatchConfidence,
  TypeMatchConfidence,
} from './pattern_engines/match';
import {
  PROPERTY_MATCHER_ANY_UNKNOWN_COUNTER,
  PROPERTY_MATCHER_TYPE_CHECK_COUNTER,
  statsCollector,
} from './statistics';
import {
  isAnyType,
  isUnknownType,
  legacyResolveTypeMatches,
  resolveTypeFromName,
  resolveTypeMatch,
} from './type_matching';

/**
 * A matcher for property accesses. Two implementations for the type matching
 * logic exist:
 * - legacyResolveTypeMatches: use a name-based matching. This is the historical
 *   implementation.
 * - typedTypeMatches: Relies on the type checker to determine if type
 *   compatibility between the node and the matcher specification.
 *   go/tsetse-sensitivity
 *
 * The ignoreTypes option is only used when typedTypeMatches is enabled. It
 * allows to ignore types that are structurally compatible with the matcher's
 * type to not raise false positive violations. For instance,
 * `HTMLStyleElement#textContent` is a banned property, but since the
 * `HTMLLinkElement extends HTMLStyleElement, the rule would raise false
 * positives for HTMLLinkElement#textContent usages. The flag can be used to
 * ignore matches on HTMLLinkElement#textContent usages.
 */
export class PropertyMatcher {
  private bannedTypeCache: ts.Type | undefined = undefined;
  private ignoreTypesCache: ts.Type[] | undefined = undefined;

  static fromSpec(
    value: PatternDescriptor,
    options: {useTypedPropertyMatching?: boolean; ignoreTypes?: string[]} = {},
  ): PropertyMatcher {
    const {useTypedPropertyMatching = false, ignoreTypes = []} = options;
    if (!(value instanceof PropertyMatcherDescriptor)) {
      throw new Error(
        `PropertyMatcher expects a PropertyMatcherDescriptor, got ${typeof value}`,
      );
    }
    if (value.spec.indexOf('.prototype.') === -1) {
      throw new Error(`BANNED_PROPERTY expects a .prototype in your query.`);
    }
    const requestParser = /^([\w\d_.-]+)\.prototype\.([\w\d_.-]+)$/;
    const matches = requestParser.exec(value.spec);
    if (!matches) {
      throw new Error('Cannot understand the BannedProperty spec' + value.spec);
    }
    const [bannedType, bannedProperty] = matches.slice(1);
    return new PropertyMatcher(
      bannedType,
      bannedProperty,
      useTypedPropertyMatching,
      ignoreTypes,
    );
  }

  constructor(
    readonly bannedType: string,
    readonly bannedProperty: string,
    readonly useTypedPropertyMatching: boolean,
    readonly ignoreTypes: string[] = [],
  ) {}

  /**
   * @param n The PropertyAccessExpression we're looking at.
   */
  matches(
    n: ts.PropertyAccessExpression,
    tc: ts.TypeChecker,
  ): Match<ts.PropertyAccessExpression> | undefined {
    if (n.name.text !== this.bannedProperty) {
      return undefined;
    }
    const typeMatchConfidence = this.typeMatches(
      tc.getTypeAtLocation(n.expression),
      tc,
    );
    if (typeMatchConfidence === TypeMatchConfidence.LEGACY_NO_MATCH) {
      return undefined;
    }
    return {
      node: n,
      typeMatch: typeMatchConfidence,
      nameMatch: NameMatchConfidence.EXACT,
    };
  }

  typeMatches(inspectedType: ts.Type, tc: ts.TypeChecker): TypeMatchConfidence {
    if (isExplainDiagnosticsEnabled()) {
      explainDiagnosticsCollector.pushEvent(
        `∟∟inspectedType: ${tc.typeToString(inspectedType)} ; bannedType: ${this.bannedType}`,
      );
    }
    if (!this.useTypedPropertyMatching) {
      return legacyResolveTypeMatches(inspectedType, this.bannedType, tc);
    }
    const matcherType = (this.bannedTypeCache ??= resolveTypeFromName(
      tc,
      this.bannedType,
    ));
    if (this.ignoreTypesCache === undefined) {
      this.resolveIgnoreTypes(tc);
    }
    if (
      this.ignoreTypesCache!.some((ignoreType) =>
        tc.isTypeAssignableTo(inspectedType, ignoreType),
      )
    ) {
      if (isExplainDiagnosticsEnabled()) {
        explainDiagnosticsCollector.pushEvent(
          `∟∟∟∟UNRELATED: type is assignable to ignore type`,
        );
      }
      return TypeMatchConfidence.UNRELATED;
    }
    if (TSETSE_STATS_COLLECTION_ENABLED) {
      statsCollector.incrementCounter(PROPERTY_MATCHER_TYPE_CHECK_COUNTER);
      const typeMatchConfidence = resolveTypeMatch(
        inspectedType,
        matcherType,
        tc,
      );
      if (typeMatchConfidence === TypeMatchConfidence.ANY_UNKNOWN) {
        statsCollector.incrementCounter(PROPERTY_MATCHER_ANY_UNKNOWN_COUNTER);
      }

      return typeMatchConfidence;
    } else {
      return resolveTypeMatch(inspectedType, matcherType, tc);
    }
  }

  private resolveIgnoreTypes(tc: ts.TypeChecker): void {
    // Cache the ignore types. Ignore types that are not resolved. This is to
    // avoid failing the compilation when an ignore type is not available in the
    // program.
    this.ignoreTypesCache = this.ignoreTypes
      .map((t) => {
        try {
          return resolveTypeFromName(tc, t);
        } catch (e) {
          return undefined;
        }
      })
      .filter(
        (t: ts.Type | undefined): t is ts.Type =>
          t !== undefined && !isAnyType(t) && !isUnknownType(t),
      );
  }
}
