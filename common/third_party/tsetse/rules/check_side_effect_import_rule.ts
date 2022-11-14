import * as ts from 'typescript';

import {Checker} from '../checker';
import {ErrorCode} from '../error_code';
import {AbstractRule} from '../rule';

function checkImport(checker: Checker, node: ts.ImportDeclaration) {
  // Check only side-effect imports as other imports are checked by TSC.
  if (node.importClause !== undefined) return;

  const modSpec = node.moduleSpecifier;
  if (!modSpec) return;

  // Code with syntax errors can cause moduleSpecifier to be something other
  // than a string literal. Early return to avoid a crash when
  // `moduleSpecifier.name` is undefined.
  if (!ts.isStringLiteral(modSpec)) return;

  const sym = checker.typeChecker.getSymbolAtLocation(modSpec);
  if (sym) return;

  // It is possible that getSymbolAtLocation returns undefined, but module name
  // is actually resolvable - e.g. when the imported file is empty (i.e. it is a
  // script, not a module). Therefore we have to check with resolveModuleName.

  const modName = modSpec.text;
  const source = node.getSourceFile();
  const resolvingResult = checker.resolveModuleName(modName, source);
  if (resolvingResult && resolvingResult.resolvedModule) return;

  checker.addFailureAtNode(
      node, `Cannot find module`, /*source=*/ undefined,
      /*allowlist*/ undefined);
}

/**
 * Checks side effects imports and adds failures on module resolution errors.
 * This is an equivalent of the TS2307 error, but for side effects imports.
 */
export class Rule extends AbstractRule {
  static readonly RULE_NAME = 'check-imports';
  readonly ruleName = Rule.RULE_NAME;
  readonly code = ErrorCode.BAD_SIDE_EFFECT_IMPORT;

  register(checker: Checker) {
    checker.on(ts.SyntaxKind.ImportDeclaration, checkImport, this.code);
  }
}
