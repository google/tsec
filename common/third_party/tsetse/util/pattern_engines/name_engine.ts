import * as ts from 'typescript';

import {Checker} from '../../checker';
import {AbsoluteMatcher} from '../absolute_matcher';
import {isExpressionOfAllowedTrustedType} from '../is_trusted_type';
import {TrustedTypesConfig} from '../trusted_types_configuration';

import {PatternEngine} from './pattern_engine';

function isCalledWithAllowedTrustedType(
    tc: ts.TypeChecker, n: ts.Node,
    allowedTrustedType: TrustedTypesConfig|undefined) {
  const par = n.parent;
  if (allowedTrustedType && ts.isCallExpression(par) &&
      par.arguments.length > 0 &&
      isExpressionOfAllowedTrustedType(
          tc, par.arguments[0], allowedTrustedType)) {
    return true;
  }

  return false;
}

function isPolyfill(n: ts.Node, matcher: AbsoluteMatcher) {
  if (matcher.filePath === 'GLOBAL') {
    const parent = n.parent;
    if (parent && ts.isBinaryExpression(parent) && parent.left === n &&
        parent.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      return true;
    }
  }
  return false;
}

function checkIdentifierNode(
    tc: ts.TypeChecker, n: ts.Identifier, matcher: AbsoluteMatcher,
    allowedTrustedType: TrustedTypesConfig|undefined): ts.Node|undefined {
  const wholeExp = ts.isPropertyAccessExpression(n.parent) ? n.parent : n;
  if (isPolyfill(wholeExp, matcher)) return;
  if (!matcher.matches(n, tc)) return;
  if (isCalledWithAllowedTrustedType(tc, n, allowedTrustedType)) return;

  return wholeExp;
}

function checkElementAccessNode(
    tc: ts.TypeChecker, n: ts.ElementAccessExpression, matcher: AbsoluteMatcher,
    allowedTrustedType: TrustedTypesConfig|undefined): ts.Node|undefined {
  if (isPolyfill(n, matcher)) return;
  if (!matcher.matches(n.argumentExpression, tc)) return;
  if (isCalledWithAllowedTrustedType(tc, n, allowedTrustedType)) return;

  return n;
}

/** Engine for the BANNED_NAME pattern */
export class NameEngine extends PatternEngine {
  protected readonly banImport: boolean = false;

  register(checker: Checker) {
    for (const value of this.config.values) {
      const matcher = new AbsoluteMatcher(value, this.banImport);

      // `String.prototype.split` only returns emtpy array when both the
      // string and the splitter are empty. Here we should be able to safely
      // assert pop returns a non-null result.
      const bannedIdName = matcher.bannedName.split('.').pop()!;
      checker.onNamedIdentifier(
          bannedIdName,
          this.wrapCheckWithAllowlistingAndFixer(
              (tc, n) => checkIdentifierNode(
                  tc, n, matcher, this.config.allowedTrustedType)),
          this.config.errorCode);

      // `checker.onNamedIdentifier` will not match the node if it is accessed
      // using property access expression (e.g. window['eval']).
      // We already found examples on how developers misuse this limitation
      // internally.
      //
      // This engine is inteded to ban global name identifiers, but even these
      // can be property accessed using `globalThis` or `window`.
      checker.onStringLiteralElementAccess(
          bannedIdName,
          this.wrapCheckWithAllowlistingAndFixer(
              (tc, n: ts.ElementAccessExpression) => checkElementAccessNode(
                  tc, n, matcher, this.config.allowedTrustedType)),
          this.config.errorCode);
    }
  }
}

/** Engine for the BANNED_IMPORTED_NAME pattern */
export class ImportedNameEngine extends NameEngine {
  protected override readonly banImport: boolean = true;
}
