import * as ts from 'typescript';

import {Checker} from '../../checker';
import {debugLog} from '../ast_tools';
import {isExpressionOfAllowedTrustedType} from '../is_trusted_type';
import {PropertyMatcher} from '../property_matcher';
import {TrustedTypesConfig} from '../trusted_types_configuration';

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
 * Checks whether the access expression is part of an assignment (write) to the
 * matched property and the type of the right hand side value is not of the
 * an allowed type.
 *
 * Returns `undefined` if the property write is allowed and the assignment node
 * if the assignment should trigger violation.
 */
function allowTrustedExpressionOnMatchedProperty(
    allowedType: TrustedTypesConfig|undefined, tc: ts.TypeChecker,
    n: ts.PropertyAccessExpression|ts.ElementAccessExpression,
    matcher: PropertyMatcher): ts.BinaryExpression|undefined {
  const assignment = matchPropertyWrite(tc, n, matcher);
  if (!assignment) return;

  if (allowedType &&
      isExpressionOfAllowedTrustedType(tc, assignment.right, allowedType)) {
    return;
  }

  return assignment;
}

/**
 * The engine for BANNED_PROPERTY_WRITE. Bans assignments to the restricted
 * properties unless the right hand side of the assignment is of an allowed
 * type.
 */
export class PropertyWriteEngine extends PropertyEngine {
  override register(checker: Checker) {
    this.registerWith(
        checker,
        (tc, n, m) => allowTrustedExpressionOnMatchedProperty(
            this.config.allowedTrustedType, tc, n, m));
  }
}
