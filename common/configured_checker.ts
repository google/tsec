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

import {ENABLED_RULES} from './rule_groups';
import {Checker} from './third_party/tsetse/checker';
import * as ts from 'typescript';

import {
  ExemptionList,
  parseExemptionConfig,
  resolveExemptionConfigPath,
} from './exemption_config';

/**
 * Create a new cheker with all enabled rules registered and the exemption list
 * configured.
 */
export function getConfiguredChecker(
  program: ts.Program,
  host: ts.ModuleResolutionHost,
): {checker: Checker; errors: ts.Diagnostic[]} {
  let exemptionList: ExemptionList | undefined = undefined;

  const exemptionConfigPath = resolveExemptionConfigPath(
    program.getCompilerOptions()['configFilePath'] as string,
  );

  const errors = [];

  if (exemptionConfigPath) {
    const projExemptionConfigOrErr = parseExemptionConfig(exemptionConfigPath);
    if (projExemptionConfigOrErr instanceof ExemptionList) {
      exemptionList = projExemptionConfigOrErr;
    } else {
      errors.push(...projExemptionConfigOrErr);
    }
  }

  // Create all enabled rules with corresponding exemption list entries.
  const checker = new Checker(program, host);
  const wildcardAllowListEntry = exemptionList?.get('*');
  const rules = ENABLED_RULES.map((ruleCtr) => {
    const allowlistEntries = [];
    const allowlistEntry = exemptionList?.get(ruleCtr.RULE_NAME);
    if (allowlistEntry) {
      allowlistEntries.push(allowlistEntry);
    }
    if (wildcardAllowListEntry) {
      allowlistEntries.push(wildcardAllowListEntry);
    }
    return new ruleCtr({allowlistEntries});
  });

  // Register all rules.
  for (const rule of rules) {
    rule.register(checker);
  }

  return {checker, errors};
}
