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

import {ConformancePatternRule, ErrorCode, PatternKind} from '../third_party/tsetse/rules/conformance_pattern_rule';
import {AllowlistEntry} from '../third_party/tsetse/util/allowlist';

let errMsg =
    'Do not assign non-constant values to HTMLStyleElement#textContent or HTMLStyleElement#innerText, as this can open side channels for sensitive information to leak.';

/**
 * A Rule that looks for dynamic assignments to link element's href and rel
 * properties. HTMLLinkElement#href accepts either SafeUrl or
 * TrustedResourceUrl, depending on the value of rel. Therefore, the two
 * properties should always be set in pairs.
 */
export class Rule extends ConformancePatternRule {
  static readonly RULE_NAME = 'ban-style-content-assignments';

  constructor(allowlistEntries?: AllowlistEntry[]) {
    super({
      errorCode: ErrorCode.CONFORMANCE_PATTERN,
      errorMessage: errMsg,
      kind: PatternKind.BANNED_PROPERTY_NON_CONSTANT_WRITE,
      values: [
        'HTMLStyleElement.prototype.textContent',
        'HTMLStyleElement.prototype.innerText',
      ],
      allowlistEntries,
      name: Rule.RULE_NAME,
    });
  }
}
