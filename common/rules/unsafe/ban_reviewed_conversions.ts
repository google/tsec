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

import {
  ConformancePatternRule,
  ErrorCode,
  PatternKind,
} from '../../third_party/tsetse/rules/conformance_pattern_rule';

import {RuleConfiguration} from '../../rule_configuration';

let errMsg =
  'Use of reviewed conversions to safe values requires security reviews and approval.';

let bannedValues = [
  '/node_modules/safevalues/restricted/reviewed|htmlSafeByReview',
  '/node_modules/safevalues/restricted/reviewed|scriptSafeByReview',
  '/node_modules/safevalues/restricted/reviewed|scriptUrlSafeByReview',
  // Deprecated API, keep banning for now in case people are using an older
  // version of safevalues
  '/node_modules/safevalues/restricted/reviewed|htmlFromStringKnownToSatisfyTypeContract',
  '/node_modules/safevalues/restricted/reviewed|scriptFromStringKnownToSatisfyTypeContract',
  '/node_modules/safevalues/restricted/reviewed|scriptUrlFromStringKnownToSatisfyTypeContract',
  '/node_modules/safevalues/unsafe/reviewed|htmlFromStringKnownToSatisfyTypeContract',
  '/node_modules/safevalues/unsafe/reviewed|scriptFromStringKnownToSatisfyTypeContract',
  '/node_modules/safevalues/unsafe/reviewed|scriptUrlFromStringKnownToSatisfyTypeContract',
];

/** A Rule that bans the use of reviewed conversions to safe values. */
export class Rule extends ConformancePatternRule {
  static readonly RULE_NAME = 'ban-reviewed-conversions';

  constructor(configuration: RuleConfiguration = {}) {
    super({
      errorCode: ErrorCode.CONFORMANCE_PATTERN,
      errorMessage: errMsg,
      kind: PatternKind.BANNED_NAME,
      values: bannedValues,
      name: Rule.RULE_NAME,
      ...configuration,
    });

  }

}
