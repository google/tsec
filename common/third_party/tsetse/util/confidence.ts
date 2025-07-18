/**
 * @fileoverview Captures the level of confidence in a failure. Certain failures
 * are more likely to be false positives than others, for instance when a match
 * depends on a loose type.
 * The conformance tool can use this information to determine how to present
 * the failure to the user, deduplicate failures, and silence less confident
 * failures to minimize noise.
 */

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
