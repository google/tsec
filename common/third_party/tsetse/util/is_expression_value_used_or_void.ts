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

import * as tsutils from 'tsutils';
import * as ts from 'typescript';

/**
 * Checks whether an expression value is used, or whether it is the operand of a
 * void expression.
 *
 * This allows the `void` operator to be used to intentionally suppress
 * conformance checks.
 */
export function isExpressionValueUsedOrVoid(node: ts.CallExpression) {
  return (
    ts.isVoidExpression(node.parent) || tsutils.isExpressionValueUsed(node)
  );
}
