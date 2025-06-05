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
  'Do not modify HTMLBaseElement#href elements, as this can compromise all other efforts to sanitize unsafe URLs and lead to XSS.';

/**
 * A Rule that looks for dynamic assignments to HTMLBaseElement#href property.
 * With this property modified, every URL in the page becomes unsafe.
 * Developers should avoid writing to this property.
 */
export class Rule extends ConformancePatternRule {
  static readonly RULE_NAME = 'ban-base-href-assignments';

  constructor(configuration: RuleConfiguration = {}) {
    super({
      errorCode: ErrorCode.CONFORMANCE_PATTERN,
      errorMessage: errMsg,
      kind: PatternKind.BANNED_PROPERTY_WRITE,
      values: ['HTMLBaseElement.prototype.href'],
      name: Rule.RULE_NAME,
      ...configuration,
    });
  }
}
