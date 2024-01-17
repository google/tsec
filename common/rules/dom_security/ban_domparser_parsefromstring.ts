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
import {overridePatternConfig} from '../../third_party/tsetse/util/pattern_config';
import {RuleConfiguration} from '../../rule_configuration';

let errMsg =
  'Using DOMParser#parseFromString to parse untrusted input into DOM elements can lead to XSS.';

/** A rule that bans any use of DOMParser.prototype.parseFromString. */
export class Rule extends ConformancePatternRule {
  static readonly RULE_NAME = 'ban-domparser-parsefromstring';

  constructor(configuration: RuleConfiguration = {}) {
    super(
      overridePatternConfig({
        errorCode: ErrorCode.CONFORMANCE_PATTERN,
        errorMessage: errMsg,
        kind: PatternKind.BANNED_PROPERTY,
        values: ['DOMParser.prototype.parseFromString'],
        name: Rule.RULE_NAME,
        ...configuration,
      }),
    );
  }
}
