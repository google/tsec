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
import {PatternDescriptor, PropertyMatcherDescriptor} from './pattern_config';
import {
  Match,
  NameMatchConfidence,
  TypeMatchConfidence,
} from './pattern_engines/match';

/**
 * A matcher for property accesses. See LegacyPropertyMatcher and
 * TypedPropertyMatcher for more details.
 */
export interface PropertyMatcher {
  readonly bannedType: string;
  readonly bannedProperty: string;
  matches(
    n: ts.PropertyAccessExpression,
    tc: ts.TypeChecker,
  ): Match<ts.PropertyAccessExpression> | undefined;
  typeMatches(
    inspectedType: ts.Type,
    tc: ts.TypeChecker,
  ): TypeMatchConfidence | false;
}

/**
 * This class matches a property access node, based on a property holder type
 * (through its name), i.e. a class, and a property name.
 *
 * The logic is voluntarily simple: if a matcher for `a.b` tests a `x.y` node,
 * it will return true if:
 * - `x` is of type `a` either directly (name-based) or through inheritance
 *   (ditto),
 * - and, textually, `y` === `b`.
 *
 * Note that the logic is different from TS's type system: this matcher doesn't
 * have any knowledge of structural typing.
 */
export class LegacyPropertyMatcher implements PropertyMatcher {
  static fromSpec(value: PatternDescriptor): LegacyPropertyMatcher {
    if (!(value instanceof PropertyMatcherDescriptor)) {
      throw new Error(
        `LegacyPropertyMatcher expects a PropertyMatcherDescriptor.`,
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
    return new LegacyPropertyMatcher(bannedType, bannedProperty);
  }

  constructor(
    readonly bannedType: string,
    readonly bannedProperty: string,
  ) {}

  /**
   * @param n The PropertyAccessExpression we're looking at.
   */
  matches(
    n: ts.PropertyAccessExpression,
    tc: ts.TypeChecker,
  ): Match<ts.PropertyAccessExpression> | undefined {
    if (n.name.text === this.bannedProperty) {
      const typeMatchConfidence = this.typeMatches(
        tc.getTypeAtLocation(n.expression),
        tc,
      );
      if (typeMatchConfidence !== false) {
        return {
          node: n,
          typeMatch: typeMatchConfidence,
          nameMatch: NameMatchConfidence.EXACT,
        };
      }
    }
    return undefined;
  }

  /**
   * Match types recursively in the lattice. This function over-approximates
   * the result by considering union types and intersection types as the same.
   */
  typeMatches(
    inspectedType: ts.Type,
    tc: ts.TypeChecker,
  ): TypeMatchConfidence.LEGACY_MATCH | false {
    // Skip checking mocked objects
    if (inspectedType.aliasSymbol?.escapedName === 'SpyObj') return false;

    // Exact type match
    if (inspectedType.getSymbol()?.getName() === this.bannedType) {
      return TypeMatchConfidence.LEGACY_MATCH;
    }

    // If the type is an intersection/union, check if any of the component
    // matches
    if (inspectedType.isUnionOrIntersection()) {
      return inspectedType.types.some(
        (comp) =>
          this.typeMatches(comp, tc) === TypeMatchConfidence.LEGACY_MATCH,
      )
        ? TypeMatchConfidence.LEGACY_MATCH
        : false;
    }

    const baseTypes = inspectedType.getBaseTypes() || [];
    return baseTypes.some(
      (base) => this.typeMatches(base, tc) === TypeMatchConfidence.LEGACY_MATCH,
    )
      ? TypeMatchConfidence.LEGACY_MATCH
      : false;
  }
}

/**
 * PropertyMatcher that relies on the comparison of type instances of the base
 * object and property name to match expressions.
 */
export class TypedPropertyMatcher implements PropertyMatcher {
  private bannedTypeCache: ts.Type | undefined = undefined;

  static fromSpec(value: PatternDescriptor): TypedPropertyMatcher {
    if (!(value instanceof PropertyMatcherDescriptor)) {
      throw new Error(
        `TypedPropertyMatcher expects a PropertyMatcherDescriptor, got ${typeof value}`,
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
    return new TypedPropertyMatcher(bannedType, bannedProperty);
  }

  constructor(
    readonly bannedType: string,
    readonly bannedProperty: string,
  ) {}

  /**
   * @param n The PropertyAccessExpression we're looking at.
   */
  matches(
    n: ts.PropertyAccessExpression,
    tc: ts.TypeChecker,
  ): Match<ts.PropertyAccessExpression> | undefined {
    if (n.name.text === this.bannedProperty) {
      return {
        node: n,
        typeMatch: this.typeMatches(tc.getTypeAtLocation(n.expression), tc),
        nameMatch: NameMatchConfidence.EXACT,
      };
    }
    return undefined;
  }

  /**
   * Relies on the type checker to match the type.
   */
  typeMatches(inspectedType: ts.Type, tc: ts.TypeChecker): TypeMatchConfidence {
    const matcherType = (this.bannedTypeCache ??= resolveTypeFromName(
      tc,
      this.bannedType,
    ));
    if (isAnyType(inspectedType) || isUnknownType(inspectedType)) {
      return TypeMatchConfidence.ANY_UNKNOWN;
    }

    if (inspectedType.getSymbol() === matcherType.getSymbol()) {
      return TypeMatchConfidence.EXACT;
    }

    // If the type is an intersection/union, check if any of the component
    // matches. In particular this handles cases with optional properties. Example:
    // Comparing a matcher for `TrustedTypePolicyFactory`, window is types as
    // `{TrustedTypes?: TrustedTypePolicyFactory;}` which is a union of
    // `undefined` and `TrustedTypePolicyFactory`. A property access of
    // window.TrustedTypes should be considered a match.
    if (inspectedType.isUnionOrIntersection()) {
      const typeMatches = inspectedType.types.map((t) =>
        this.typeMatches(t, tc),
      );
      if (typeMatches.includes(TypeMatchConfidence.EXACT)) {
        return TypeMatchConfidence.EXACT;
      }
      if (typeMatches.includes(TypeMatchConfidence.EXTENDS)) {
        return TypeMatchConfidence.EXTENDS;
      }
    }

    if (tc.isTypeAssignableTo(inspectedType, matcherType)) {
      return TypeMatchConfidence.EXTENDS;
    }

    if (tc.isTypeAssignableTo(matcherType, inspectedType)) {
      return TypeMatchConfidence.PARENT;
    }
    return TypeMatchConfidence.UNRELATED;
  }
}

function isUnknownType(type: ts.Type): boolean {
  return (type.flags & ts.TypeFlags.Unknown) !== 0;
}

function isAnyType(type: ts.Type): boolean {
  return (type.flags & ts.TypeFlags.Any) !== 0;
}

/**
 * Resolves a TypeScript type from its name (e.g., "HTMLElement", "Element").
 * Handles the case where the symbol might represent a constructor rather than
 * an instance type
 */
function resolveTypeFromName(
  checker: ts.TypeChecker,
  typeName: string,
): ts.Type {
  const symbol = checker.resolveName(
    typeName,
    /*location=*/ undefined,
    ts.SymbolFlags.Type,
    /*excludeGlobals=*/ false,
  );
  if (!symbol) {
    throw new Error(`Type "${typeName}" not found in TypeScript checker.`);
  }

  const symbolType = checker.getTypeOfSymbol(symbol);

  // For DOM types, the symbol often represents the constructor
  // Try to get the instance type from the constructor's return type
  const constructSignatures = symbolType.getConstructSignatures();
  if (constructSignatures.length > 0) {
    return constructSignatures[0].getReturnType();
  }

  // If no construct signatures, return the type as-is
  return symbolType;
}
