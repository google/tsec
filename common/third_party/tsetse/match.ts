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
 * @fileoverview Match interfaces.
 */

import * as ts from 'typescript';

/**
 * Represents a node matched by a pattern matcher, including confidence
 * information if a type comparison and a name comparison were made.
 */
export interface Match<T extends ts.Node> {
  node: T;
  typeMatch: TypeMatchConfidence;
  nameMatch: NameMatchConfidence;
}

/**
 * Represents a Match that result from a legacy pattern matcher that doesn't use
 * the type checker's isAssignableTo() method.
 */
export interface LegacyMatch<T extends ts.Node> {
  node: T;
  typeMatch?: undefined;
  nameMatch?: undefined;
}

/**
 * Returns true if the match is a LegacyMatch.
 */
export function isLegacyMatch(
  match: Match<ts.Node> | LegacyMatch<ts.Node>,
): match is LegacyMatch<ts.Node> {
  return match.typeMatch === undefined || match.nameMatch === undefined;
}

/**
 * Confidence level for the typeMatch field of a Match. e.g. if the expression
 * foo.bar is matched, this capture the confidence that foo has a type that
 * matches the rule's specification.
 */
export enum TypeMatchConfidence {
  /** Non applicable to this match. */
  NA = 'NA',
  /**
   * Type matches with the legacy type matching logic, e.g. the
   * PropertyMatcher without useTypedPropertyMatching enabled, does not use
   * isAssignableTo() to compare types.
   */
  LEGACY_MATCH = 'LEGACY_MATCH',
  /**
   * Type does not match with the legacy type matching logic.
   */
  LEGACY_NO_MATCH = 'LEGACY_NO_MATCH',
  /**
   * Type is exactly the matcher's specification
   */
  EXACT = 'EXACT',
  /**
   * Type extends the type of the matcher
   */
  EXTENDS = 'EXTENDS',
  /**
   * Matcher's type extends the type of the node
   */
  PARENT = 'PARENT',
  /**
   * Type is any or unknown.
   */
  ANY_UNKNOWN = 'ANY_UNKNOWN',
  /**
   * Type is unrelated to the matcher
   */
  UNRELATED = 'UNRELATED',
}

/**
 * Confidence level for the nameMatch field of a Match. e.g. if the expression
 * foo[bar] is matched, this capture the confidence that bar matches the rule's
 * specification (here dynamic).
 */
export enum NameMatchConfidence {
  /** Non applicable to this match. */
  NA = 'NA',
  /** Name/property is hardcoded and matches the matcher's specification */
  EXACT = 'EXACT',
  /** Name/property is dynamic (e.g. dynamic array expression access) */
  DYNAMIC = 'DYNAMIC',
}
