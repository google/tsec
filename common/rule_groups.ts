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
import {Rule as TTBanBaseHrefAssignments} from './rules/dom_security/ban_base_href_assignments';
import {Rule as TTBanDocumentExecCommand} from './rules/dom_security/ban_document_execcommand';
import {Rule as TTBanDocumentWriteCalls} from './rules/dom_security/ban_document_write_calls';
import {Rule as TTBanDocumentWritelnCalls} from './rules/dom_security/ban_document_writeln_calls';
import {Rule as TTBanDomParserParseFromString} from './rules/dom_security/ban_domparser_parsefromstring';
import {Rule as TTBanElementInnerHTMLAssignments} from './rules/dom_security/ban_element_innerhtml_assignments';
import {Rule as TTBanElementInsertAdjacentHTML} from './rules/dom_security/ban_element_insertadjacenthtml';
import {Rule as TTBanElementOuterHTMLAssignments} from './rules/dom_security/ban_element_outerhtml_assignments';
import {Rule as TTBanElementSetAttribute} from './rules/dom_security/ban_element_setattribute';
import {Rule as TTBanEvalCalls} from './rules/dom_security/ban_eval_calls';
import {Rule as TTBanFunctionCalls} from './rules/dom_security/ban_function_calls';
import {Rule as TTBanIFrameSrcdocAssignments} from './rules/dom_security/ban_iframe_srcdoc_assignments';
import {Rule as TTBanObjectDataAssignments} from './rules/dom_security/ban_object_data_assignments';
import {Rule as TTBanRangeCreateContextualFragment} from './rules/dom_security/ban_range_createcontextualfragment';
import {Rule as TTBanScriptAppendChildCalls} from './rules/dom_security/ban_script_appendchild_calls';
import {Rule as TTBanScriptContentAssignments} from './rules/dom_security/ban_script_content_assignments';
import {Rule as TTBanScriptSrcAssignments} from './rules/dom_security/ban_script_src_assignments';
import {Rule as TTBanServiceWorkerContainerRegister} from './rules/dom_security/ban_serviceworkercontainer_register';
import {Rule as TTBanSharedWorkerCalls} from './rules/dom_security/ban_shared_worker_calls';
import {Rule as TTBanTrustedTypesCreatepolicy} from './rules/dom_security/ban_trustedtypes_createpolicy';
import {Rule as TTBanWindowStringfunctiondef} from './rules/dom_security/ban_window_stringfunctiondef';
import {Rule as TTBanWorkerCalls} from './rules/dom_security/ban_worker_calls';
import {Rule as TTBanWorkerImportScripts} from './rules/dom_security/ban_worker_importscripts';
import {Rule as BanLegacyConversions} from './rules/unsafe/ban_legacy_conversions';
import {Rule as BanUncheckedConversions} from './rules/unsafe/ban_reviewed_conversions';

/**
 * An interface unifying rules extending `AbstractRule` and those extending
 * `ConfornacePatternRule`. The interface exposes rule names and make it
 * possible to configure non-Bazel exemption list during rule creation.
 */
export interface RuleConstructor {
  readonly RULE_NAME: string;
  new (configuration?: RuleConfiguration): AbstractRule;
}

/** Conformance rules related to Trusted Types adoption */
export const TRUSTED_TYPES_RELATED_RULES: readonly RuleConstructor[] = [
  TTBanBaseHrefAssignments, // https://github.com/w3c/webappsec-trusted-types/issues/172
  TTBanDocumentExecCommand,
  TTBanDocumentWritelnCalls,
  TTBanDocumentWriteCalls,
  TTBanEvalCalls,
  TTBanFunctionCalls,
  TTBanIFrameSrcdocAssignments,
  TTBanObjectDataAssignments,
  TTBanScriptAppendChildCalls,
  TTBanScriptContentAssignments,
  TTBanScriptSrcAssignments,
  TTBanServiceWorkerContainerRegister,
  TTBanSharedWorkerCalls,
  TTBanTrustedTypesCreatepolicy,
  TTBanWindowStringfunctiondef,
  TTBanWorkerCalls,
  TTBanWorkerImportScripts,
  TTBanElementOuterHTMLAssignments,
  TTBanElementInnerHTMLAssignments,
  TTBanElementInsertAdjacentHTML,
  TTBanDomParserParseFromString,
  TTBanElementSetAttribute,
  TTBanRangeCreateContextualFragment,
  BanLegacyConversions,
  BanUncheckedConversions,
];

/**
 * Conformance rules that should be registered by the check as a compiler
 * plugin.
 */
export const ENABLED_RULES: readonly RuleConstructor[] = [
  ...TRUSTED_TYPES_RELATED_RULES,
];
