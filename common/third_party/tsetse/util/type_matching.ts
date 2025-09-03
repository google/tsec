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

/**
 * @fileoverview Type matching logic for Tsetse, in particular for property
 * matchers.
 */

import * as ts from 'typescript';
import {TypeMatchConfidence} from './pattern_engines/match';

/**
 * Type matching logic for property matchers that relies on the type checker to
 * determine if type compatibility between the node and the matcher
 * specification.
 *
 * @param inspectedType The type of the inspected property.
 * @param matcherType The resolved type specified in a matcher configuration.
 * @param tc The type checker.
 * @return The type match confidence.
 */
export function resolveTypeMatch(
  inspectedType: ts.Type,
  matcherType: ts.Type,
  tc: ts.TypeChecker,
): TypeMatchConfidence {
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
    const typeMatchConfidences = inspectedType.types.map((t: ts.Type) =>
      resolveTypeMatch(t, matcherType, tc),
    );
    if (typeMatchConfidences.includes(TypeMatchConfidence.EXACT)) {
      return TypeMatchConfidence.EXACT;
    }
    if (typeMatchConfidences.includes(TypeMatchConfidence.EXTENDS)) {
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

/**
 * Match types recursively in the lattice. This function over-approximates
 * the result by considering union types and intersection types as the same.
 *
 * The logic is voluntarily simple: if a matcher for `a.b` tests a `x.y` node,
 * `legacyResolveTypeMatches` will return true if:
 * - `x` is of type `a` either directly (name-based) or through inheritance
 *   (ditto),
 *
 * Note that the logic is different from TS's type system: this matcher doesn't
 * have any knowledge of structural typing.
 */
export function legacyResolveTypeMatches(
  inspectedType: ts.Type,
  bannedTypeName: string,
  tc: ts.TypeChecker,
): TypeMatchConfidence.LEGACY_MATCH | TypeMatchConfidence.LEGACY_NO_MATCH {
  // Skip checking mocked objects
  if (inspectedType.aliasSymbol?.escapedName === 'SpyObj') {
    return TypeMatchConfidence.LEGACY_NO_MATCH;
  }
  // Exact type match
  if (inspectedType.getSymbol()?.getName() === bannedTypeName) {
    return TypeMatchConfidence.LEGACY_MATCH;
  }

  // If the type is an intersection/union, check if any of the component
  // matches
  if (inspectedType.isUnionOrIntersection()) {
    return inspectedType.types.some(
      (comp: ts.Type) =>
        legacyResolveTypeMatches(comp, bannedTypeName, tc) ===
        TypeMatchConfidence.LEGACY_MATCH,
    )
      ? TypeMatchConfidence.LEGACY_MATCH
      : TypeMatchConfidence.LEGACY_NO_MATCH;
  }

  const baseTypes = inspectedType.getBaseTypes() || [];
  return baseTypes.some(
    (base) =>
      legacyResolveTypeMatches(base, bannedTypeName, tc) ===
      TypeMatchConfidence.LEGACY_MATCH,
  )
    ? TypeMatchConfidence.LEGACY_MATCH
    : TypeMatchConfidence.LEGACY_NO_MATCH;
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
 * an instance type.
 */
export function resolveTypeFromName(
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
