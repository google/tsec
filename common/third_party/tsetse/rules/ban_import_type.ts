import * as ts from 'typescript';

import {Checker} from '../checker';
import {ErrorCode} from '../error_code';
import {replaceNode} from '../failure';
import {AbstractRule} from '../rule';

/**
 * Bans 'import type'. google3 uses compiler options that elide imports that are
 * only used in a type position, so there is no need to ever use import type.
 */
export class Rule extends AbstractRule {
  static readonly RULE_NAME = 'ban-import-type';
  readonly ruleName = Rule.RULE_NAME;
  readonly code = ErrorCode.BAN_IMPORT_TYPE;

  register(checker: Checker) {
    checker.on(ts.SyntaxKind.ImportDeclaration, checkImport, this.code);
    checker.on(
        ts.SyntaxKind.ImportEqualsDeclaration, checkImportEquals, this.code);
  }
}

function checkImport(
    checker: Checker, importDeclaration: ts.ImportDeclaration) {
  if (!importDeclaration.importClause) return;  // side effect import
  if (!importDeclaration.importClause.isTypeOnly) return;
  checkPort(checker, importDeclaration.importClause);
}

function checkImportEquals(
    checker: Checker, importEqualsDeclaration: ts.ImportEqualsDeclaration) {
  if (!importEqualsDeclaration.isTypeOnly) return;
  checkPort(checker, importEqualsDeclaration);
}

function checkPort(
    checker: Checker, parentNode: ts.ImportClause|ts.ImportEqualsDeclaration) {
  const sourceFile = parentNode.getSourceFile();
  const typeKeyword = parentNode.getChildren(sourceFile)
                          .find(t => t.kind === ts.SyntaxKind.TypeKeyword);
  if (!typeKeyword) {
    throw new Error(
        'import type must have a type keyword: ' + parentNode.getFullText());
  }
  // Remove the type keyword.
  const fix = replaceNode(typeKeyword, '');
  checker.addFailureAtNode(
      typeKeyword,
      `do not use import type, use regular imports.`
      ,
      Rule.RULE_NAME, undefined, [fix]);
}
