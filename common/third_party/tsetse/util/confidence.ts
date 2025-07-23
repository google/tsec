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
 * @fileoverview Captures the level of confidence in a failure. Certain failures
 * are more likely to be false positives than others, for instance when a match
 * depends on a loose type.
 * The conformance tool can use this information to determine how to present
 * the failure to the user, deduplicate failures, and silence less confident
 * failures to minimize noise.
 */

import * as ts from 'typescript';
import {
  Match,
  NameMatchConfidence,
  TypeMatchConfidence,
} from './pattern_engines/match';

/**
 * Higher values indicate more confidence in the failure. Numerical values are
 * arbitrary but ordered. They are used to compare confidence levels between one
 * another. Keep sorted.
 * HIGH_CONFIDENCE_EXACT is separated from HIGH_CONFIDENCE_EXTENDS to help
 * picking the most precise failure when duplicating 2 HIGH_CONFIDENCE failures.
 */
export enum Confidence {
  NA_CONFIDENCE = 100000, // No confidence information provided.
  HIGH_CONFIDENCE_EXACT = 40,
  HIGH_CONFIDENCE_EXTENDS = 30,
  MEDIUM_CONFIDENCE = 20,
  LOW_CONFIDENCE = 10,
}

/**
 * Translate a match with its matching precision information into a confidence
 * level.
 */
export function giveConfidence(match: Match<ts.Node>): Confidence {
  switch (match.typeMatch) {
    // For the moment, we prioritize legacy matches over the new type based
    // matching to preserve the current behavior. We might make legacy matches
    // a lower confidence in the future as rules are migrated to the new
    // typedPropertyMatcher.
    case TypeMatchConfidence.LEGACY_MATCH:
      return Confidence.NA_CONFIDENCE;
    case TypeMatchConfidence.EXACT:
    case TypeMatchConfidence.EXTENDS:
      switch (match.nameMatch) {
        case NameMatchConfidence.EXACT:
          return match.typeMatch === TypeMatchConfidence.EXACT
            ? Confidence.HIGH_CONFIDENCE_EXACT
            : Confidence.HIGH_CONFIDENCE_EXTENDS;
        case NameMatchConfidence.DYNAMIC:
          return Confidence.MEDIUM_CONFIDENCE;
        case NameMatchConfidence.NA:
          return Confidence.NA_CONFIDENCE;
        default:
          checkExhaustive(
            match.nameMatch,
            `Found a match for which we cannot give confidence. nameMatch case ${match.nameMatch} is not covered. This should never happen.`,
          );
      }
    case TypeMatchConfidence.PARENT:
    case TypeMatchConfidence.ANY_UNKNOWN:
      return Confidence.MEDIUM_CONFIDENCE;
    case TypeMatchConfidence.UNRELATED:
      return Confidence.LOW_CONFIDENCE;
    case TypeMatchConfidence.NA:
      return Confidence.NA_CONFIDENCE;
    default:
      checkExhaustive(
        match.typeMatch,
        `Found a match for which we cannot give confidence. typeMatch case ${match.typeMatch} is not covered. This should never happen.`,
      );
  }
}

/**
 * Translate a confidence level to a readable string representation.
 */
export function confidenceToString(confidence: Confidence): string {
  switch (confidence) {
    case Confidence.NA_CONFIDENCE:
      return 'NA_CONFIDENCE';
    case Confidence.HIGH_CONFIDENCE_EXACT:
      return 'HIGH_CONFIDENCE_EXACT';
    case Confidence.HIGH_CONFIDENCE_EXTENDS:
      return 'HIGH_CONFIDENCE_EXTENDS';
    case Confidence.MEDIUM_CONFIDENCE:
      return 'MEDIUM_CONFIDENCE';
    case Confidence.LOW_CONFIDENCE:
      return 'LOW_CONFIDENCE';
    default:
      checkExhaustive(
        confidence,
        `Found a confidence that cannot be converted to a string. confidence case ${confidence} is not covered. This should never happen.`,
      );
  }
}

function checkExhaustive(
  value: never,
  msg = `unexpected value ${value}!`,
): never {
  throw new Error(msg);
}
