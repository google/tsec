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

import {
  ConformancePatternRule,
  ErrorCode,
  PatternKind,
} from '../../third_party/tsetse/rules/conformance_pattern_rule';
import {AbsoluteMatcherDescriptor} from '../../third_party/tsetse/util/pattern_config';

import {RuleConfiguration} from '../../rule_configuration';

let errMsg =
  'Use of reviewed conversions to safe values requires security reviews and approval.';

let bannedValues = [
  new AbsoluteMatcherDescriptor(
    'htmlSafeByReview',
    '/node_modules/safevalues/restricted/reviewed',
  ),
  new AbsoluteMatcherDescriptor(
    'scriptSafeByReview',
    '/node_modules/safevalues/restricted/reviewed',
  ),
  new AbsoluteMatcherDescriptor(
    'scriptUrlSafeByReview',
    '/node_modules/safevalues/restricted/reviewed',
  ),
  // Deprecated API, keep banning for now in case people are using an older
  // version of safevalues
  new AbsoluteMatcherDescriptor(
    'htmlFromStringKnownToSatisfyTypeContract',
    '/node_modules/safevalues/restricted/reviewed',
  ),
  new AbsoluteMatcherDescriptor(
    'scriptFromStringKnownToSatisfyTypeContract',
    '/node_modules/safevalues/restricted/reviewed',
  ),
  new AbsoluteMatcherDescriptor(
    'scriptUrlFromStringKnownToSatisfyTypeContract',
    '/node_modules/safevalues/restricted/reviewed',
  ),
  new AbsoluteMatcherDescriptor(
    'htmlFromStringKnownToSatisfyTypeContract',
    '/node_modules/safevalues/unsafe/reviewed',
  ),
  new AbsoluteMatcherDescriptor(
    'scriptFromStringKnownToSatisfyTypeContract',
    '/node_modules/safevalues/unsafe/reviewed',
  ),
  new AbsoluteMatcherDescriptor(
    'scriptUrlFromStringKnownToSatisfyTypeContract',
    '/node_modules/safevalues/unsafe/reviewed',
  ),
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
