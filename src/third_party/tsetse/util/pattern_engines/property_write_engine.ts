import * as ts from 'typescript';

import {Checker} from '../../checker';
import {ErrorCode} from '../../error_code';
import {debugLog} from '../ast_tools';
import {Fixer} from '../fixer';
import {PropertyMatcher} from '../property_matcher';

import {matchProperty, PropertyEngine} from './property_engine';

/** Test if an AST node is a matched property write. */
export function matchPropertyWrite(
    tc: ts.TypeChecker,
    n: ts.PropertyAccessExpression|ts.ElementAccessExpression,
    matcher: PropertyMatcher): ts.BinaryExpression|undefined {
  debugLog(() => `inspecting ${n.parent.getText().trim()}`);

  if (matchProperty(tc, n, matcher) === undefined) return;

  const assignment = n.parent;

  if (!ts.isBinaryExpression(assignment)) return;
  // All properties we track are of the string type, so we only look at
  // `=` and `+=` operators.
  if (assignment.operatorToken.kind !== ts.SyntaxKind.EqualsToken &&
      assignment.operatorToken.kind !== ts.SyntaxKind.PlusEqualsToken) {
    return;
  }
  if (assignment.left !== n) return;

  return assignment;
}

/**
 * The engine for BANNED_PROPERTY_WRITE.
 */
export class PropertyWriteEngine extends PropertyEngine {
  register(checker: Checker) {
    this.registerWith(checker, matchPropertyWrite);
  }
}
