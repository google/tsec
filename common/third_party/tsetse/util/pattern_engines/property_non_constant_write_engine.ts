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

import * as ts from 'typescript';

import {Checker} from '../../checker';
import {debugLog} from '../ast_tools';
import {isLiteral} from '../is_literal';
import {PropertyMatcher} from '../property_matcher';

import {Match} from './match';
import {matchPropertyWrite, PropertyWriteEngine} from './property_write_engine';

function matchPropertyNonConstantWrite(
  tc: ts.TypeChecker,
  n: ts.PropertyAccessExpression | ts.ElementAccessExpression,
  matcher: PropertyMatcher,
): Match<ts.Node> | undefined {
  debugLog(() => `inspecting ${n.getFullText().trim()}`);
  const match = matchPropertyWrite(tc, n, matcher);
  if (match === undefined) {
    return;
  }
  const rval = (n.parent as ts.BinaryExpression).right;
  if (isLiteral(tc, rval)) {
    debugLog(
      () =>
        `Assigned value (${rval.getFullText()}) is a compile-time constant.`,
    );
    return;
  }
  return {
    node: n.parent,
    typeMatch: match.typeMatch,
    nameMatch: match.nameMatch,
  };
}

/**
 * The engine for BANNED_PROPERTY_NON_CONSTANT_WRITE.
 */
export class PropertyNonConstantWriteEngine extends PropertyWriteEngine {
  override register(checker: Checker) {
    this.registerWith(checker, matchPropertyNonConstantWrite);
  }
}
