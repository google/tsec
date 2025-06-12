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
import {AbsoluteMatcherDescriptor} from '../../third_party/tsetse/util/pattern_config';

import {RuleConfiguration} from '../../rule_configuration';

let errMsg =
  'Use of legacy conversions to safe values requires security reviews and approval.';

let bannedValues = [
  new AbsoluteMatcherDescriptor(
    'legacyUnsafeHtml',
    '/node_modules/safevalues/restricted/legacy',
  ),
  new AbsoluteMatcherDescriptor(
    'legacyUnsafeScript',
    '/node_modules/safevalues/restricted/legacy',
  ),
  new AbsoluteMatcherDescriptor(
    'legacyUnsafeScriptUrl',
    '/node_modules/safevalues/restricted/legacy',
  ),
  // Deprecated API, keep banning for now in case people are using an older
  // version of safevalues
  new AbsoluteMatcherDescriptor(
    'legacyConversionToHtml',
    '/node_modules/safevalues/restricted/legacy',
  ),
  new AbsoluteMatcherDescriptor(
    'legacyConversionToScript',
    '/node_modules/safevalues/restricted/legacy',
  ),
  new AbsoluteMatcherDescriptor(
    'legacyConversionToScriptUrl',
    '/node_modules/safevalues/restricted/legacy',
  ),
  new AbsoluteMatcherDescriptor(
    'legacyConversionToHtml',
    '/node_modules/safevalues/unsafe/legacy',
  ),
  new AbsoluteMatcherDescriptor(
    'legacyConversionToScript',
    '/node_modules/safevalues/unsafe/legacy',
  ),
  new AbsoluteMatcherDescriptor(
    'legacyConversionToScriptUrl',
    '/node_modules/safevalues/unsafe/legacy',
  ),
];

/** A Rule that bans the use of legacy conversions to safe values. */
export class Rule extends ConformancePatternRule {
  static readonly RULE_NAME = 'ban-legacy-conversions';

  constructor(configuration: RuleConfiguration = {}) {
    super({
      errorCode: ErrorCode.CONFORMANCE_PATTERN,
      errorMessage: errMsg,
      values: bannedValues,
      kind: PatternKind.BANNED_NAME,
      name: Rule.RULE_NAME,
      ...configuration,
    });

  }

}
