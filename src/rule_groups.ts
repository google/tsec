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

import {AbstractRule} from './third_party/tsetse/rule';
import {RuleConfiguration} from './rule_configuration';

import {Rule as TTBanBaseHrefAssignments} from './conformance_rules/ban_base_href_assignments';
import {WritelnRule as TTBanDocumentWritelnCalls, WriteRule as TTBanDocumentWriteCalls} from './conformance_rules/ban_document_write_calls';
import {Rule as TTBanElementInnerHTMLAssignments} from './conformance_rules/ban_element_innerhtml_assignments';
import {Rule as TTBanElementOuterHTMLAssignments} from './conformance_rules/ban_element_outerhtml_assignments';
import {Rule as TTBanElementSrcdocAssignments} from './conformance_rules/ban_element_srcdoc_assignments';
import {Rule as TTBanEvalCalls} from './conformance_rules/ban_eval_calls';
import {Rule as TTBanScriptAppendChildCalls} from './conformance_rules/ban_script_appendchild_calls';
import {Rule as TTBanScriptContentAssignments} from './conformance_rules/ban_script_content_assignments';
import {Rule as TTBanScriptSrcAssignments} from './conformance_rules/ban_script_src_assignments';
import {Rule as TTBanTrustedTypesCreatepolicy} from './conformance_rules/ban_trustedtypes_createpolicy';
import {Rule as TTBanWindowStringfunctiondef} from './conformance_rules/ban_window_stringfunctiondef';
import {Rule as TTBanWorkerCalls} from './conformance_rules/ban_worker_calls';

/**
 * An interface unifying rules extending `AbstractRule` and those extending
 * `ConfornacePatternRule`. The interface exposes rule names and make it
 * possible to configure non-Bazel exemption list during rule creation.
 */
export interface RuleConstructor {
  readonly RULE_NAME: string;
  new(configuration?: RuleConfiguration): AbstractRule;
}

/** Conformance rules related to Trusted Types adoption */
export const TRUSTED_TYPES_RELATED_RULES: readonly RuleConstructor[] = [
  TTBanBaseHrefAssignments,  // https://github.com/w3c/webappsec-trusted-types/issues/172
  TTBanDocumentWritelnCalls,
  TTBanDocumentWriteCalls,
  TTBanEvalCalls,
  TTBanScriptAppendChildCalls,
  TTBanScriptContentAssignments,
  TTBanScriptSrcAssignments,
  TTBanTrustedTypesCreatepolicy,
  TTBanWindowStringfunctiondef,
  TTBanWorkerCalls,
  TTBanElementOuterHTMLAssignments,
  TTBanElementInnerHTMLAssignments,
  TTBanElementSrcdocAssignments,
];

/** Conformance rules that should be registered by the check runner */
export const ENABLED_RULES: readonly RuleConstructor[] = [
  ...TRUSTED_TYPES_RELATED_RULES,
];
