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
  return ts.isVoidExpression(node.parent) ||
      tsutils.isExpressionValueUsed(node);
}
