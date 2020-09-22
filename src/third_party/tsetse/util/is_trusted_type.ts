import * as ts from 'typescript';

import {debugLog} from './ast_tools';
import {TrustedTypesConfig} from './trusted_types_configuration';

/**
 * Returns true if the AST expression is Trusted Types compliant and can be
 * safely used in the sink.
 *
 * This function is only called if the rule is configured to allow specific
 * Trusted Type value in the assignment.
 */
export function isExpressionOfAllowedTrustedType(
    tc: ts.TypeChecker, expr: ts.Expression,
    allowedType: TrustedTypesConfig): boolean {
  if (isTrustedTypeCastToUnknownToString(tc, expr, allowedType)) return true;
  if (isTrustedTypeUnionWithStringCastToString(tc, expr, allowedType)) return true;
  if (isTrustedTypeUnwrapperFunction(tc, expr, allowedType)) return true;
  return false;
}

/**
 * Helper function which checks if given TS Symbol is allowed (matches
 * configured Trusted Type).
 */
function isAllowedSymbol(
    tc: ts.TypeChecker, symbol: ts.Symbol|undefined,
    allowedType: TrustedTypesConfig) {
  debugLog(() => `isAllowedSymbol called with symbol ${symbol?.getName()}`);
  if (!symbol) return false;

  const fqn = tc.getFullyQualifiedName(symbol);
  debugLog(() => `fully qualified name is ${fqn}`);
  if (allowedType.fullyQualifiedName !== fqn) return false;

  // check that the type is comes allowed declaration file
  const declarations = symbol.getDeclarations();
  if (!declarations) return false;
  const declarationFileNames =
      declarations.map(d => d.getSourceFile()?.fileName);
  debugLog(() => `got declaration filenames ${declarationFileNames}`);

  return declarationFileNames.some(
      fileName => fileName.endsWith(allowedType.modulePathSuffix));
}

/**
 * Returns true if the expression matches the following format:
 * "AllowedTrustedType as unknown as string"
 */
function isTrustedTypeCastToUnknownToString(
    tc: ts.TypeChecker, expr: ts.Expression, allowedType: TrustedTypesConfig) {
  // check if the expression is a cast expression to string
  if (!ts.isAsExpression(expr) ||
      expr.type.kind !== ts.SyntaxKind.StringKeyword) {
    return false;
  }

  // inner expression should be another cast expression
  const innerExpr = expr.expression;
  if (!ts.isAsExpression(innerExpr) ||
      innerExpr.type.kind !== ts.SyntaxKind.UnknownKeyword) {
    return false;
  }

  // check if left side of the cast expression is of an allowed type.
  const castSource = innerExpr.expression;
  debugLog(() => `looking at cast source ${castSource.getText()}`);
  return isAllowedSymbol(
      tc, tc.getTypeAtLocation(castSource).getSymbol(), allowedType);
}

/**
 * Returns true if the expression matches the following format:
 * "(AllowedTrustedType | string) as string"
 */
function isTrustedTypeUnionWithStringCastToString(
    tc: ts.TypeChecker, expr: ts.Expression, allowedType: TrustedTypesConfig) {
  // verify that the expression is a cast expression to string
  if (!ts.isAsExpression(expr) ||
      expr.type.kind !== ts.SyntaxKind.StringKeyword) {
    return false;
  }

  // inner expression needs to be a type union of trusted value
  const innerExprType = tc.getTypeAtLocation(expr.expression);
  return innerExprType.isUnion() &&
      // do not care how many types are in the union. As long as one of them is
      // the configured Trusted type we are happy.
      innerExprType.types.some(
          type => isAllowedSymbol(tc, type.getSymbol(), allowedType));
}

/**
 * Returns true if the expression is a function call of the following signature:
 * "(TypeCompatibleWithTrustedType): string"
 *
 * where `TypeCompatibleWithTrustedType` can be either the Trusted Type itself
 * or a TS union. We only require the first argument of the call site to be
 * exact Trusted Type. Pattern like `unwrap('err msg', TT)` will not work.
 * We intentionally want make the unwrapper pattern more apparent by forcing the
 * TT value in the first argument.
 */
function isTrustedTypeUnwrapperFunction(
    tc: ts.TypeChecker, expr: ts.Expression, allowedType: TrustedTypesConfig) {
  if (!ts.isCallExpression(expr)) return false;

  return expr.arguments.length > 0 &&
      isAllowedSymbol(
             tc, tc.getTypeAtLocation(expr.arguments[0]).getSymbol(), allowedType);
}
