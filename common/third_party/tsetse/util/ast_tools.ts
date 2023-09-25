/**
 * @fileoverview This is a collection of smaller utility functions to operate on
 * a TypeScript AST, used by JSConformance rules and elsewhere.
 */

import * as ts from 'typescript';

/**
 * Triggers increased verbosity in the rules.
 */
let DEBUG = false;

/**
 * Turns on or off logging for ConformancePatternRules.
 */
export function setDebug(state: boolean) {
  DEBUG = state;
}

/**
 * Debug helper.
 */
export function debugLog(msg: () => string) {
  if (DEBUG) {
    console.log(msg());
  }
}

/**
 * Returns `n`'s parents in order.
 */
export function parents(n: ts.Node): ts.Node[] {
  const p = [];
  while (n.parent) {
    n = n.parent;
    p.push(n);
  }
  return p;
}

/**
 * Searches for something satisfying the given test in `n` or its children.
 */
export function findInChildren(
    n: ts.Node, test: (n: ts.Node) => boolean): boolean {
  let toExplore: ts.Node[] = [n];
  let cur: ts.Node|undefined;
  while ((cur = toExplore.pop())) {
    if (test(cur)) {
      return true;
    }
    // Recurse
    toExplore = toExplore.concat(cur.getChildren());
  }
  return false;
}

function isOperandOfInstanceOf(n: ts.Node) {
  return ts.isBinaryExpression(n.parent) &&
      n.parent.operatorToken.kind === ts.SyntaxKind.InstanceOfKeyword;
}

/**
 * Returns true if the pattern-based Rule should look at that node and consider
 * warning there.
 */
export function shouldExamineNode(n: ts.Node) {
  return !(
      (n.parent && ts.isTypeNode(n.parent)) || isOperandOfInstanceOf(n) ||
      ts.isTypeOfExpression(n.parent) || isInStockLibraries(n));
}

/**
 * Return whether the given Node is (or is in) a library included as default.
 * We currently look for a node_modules/typescript/ prefix, but this could
 * be expanded if needed.
 */
export function isInStockLibraries(n: ts.Node|ts.SourceFile): boolean {
  const sourceFile = ts.isSourceFile(n) ? n : n.getSourceFile();
  if (sourceFile) {
    return sourceFile.fileName.indexOf('node_modules/typescript/') !== -1;
  } else {
    // the node is nowhere? Consider it as part of the core libs: we can't
    // do anything with it anyways, and it was likely included as default.
    return true;
  }
}

/**
 * Turns the given Symbol into its non-aliased version (which could be itself).
 * Returns undefined if given an undefined Symbol (so you can call
 * `dealias(typeChecker.getSymbolAtLocation(node))`).
 */
export function dealias(
    symbol: ts.Symbol|undefined, tc: ts.TypeChecker): ts.Symbol|undefined {
  if (!symbol) {
    return undefined;
  }
  if (symbol.getFlags() & ts.SymbolFlags.Alias) {
    // Note: something that has only TypeAlias is not acceptable here.
    return dealias(tc.getAliasedSymbol(symbol), tc);
  }
  return symbol;
}

/**
 * Returns whether `n`'s parents are something indicating a type.
 */
export function isPartOfTypeDeclaration(n: ts.Node) {
  return [n, ...parents(n)].some(
      p => p.kind === ts.SyntaxKind.TypeReference ||
          p.kind === ts.SyntaxKind.TypeLiteral);
}

/**
 * Returns whether `n` is a declared name on which we do not intend to emit
 * errors.
 */
export function isAllowlistedNamedDeclaration(n: ts.Node):
    n is ts.VariableDeclaration|ts.ClassDeclaration|ts.FunctionDeclaration|
    ts.MethodDeclaration|ts.PropertyDeclaration|ts.InterfaceDeclaration|
    ts.TypeAliasDeclaration|ts.EnumDeclaration|ts.ModuleDeclaration|
    ts.ImportEqualsDeclaration|ts.ExportDeclaration|ts.MissingDeclaration|
    ts.ImportClause|ts.ExportSpecifier|ts.ImportSpecifier {
  return ts.isVariableDeclaration(n) || ts.isClassDeclaration(n) ||
      ts.isFunctionDeclaration(n) || ts.isMethodDeclaration(n) ||
      ts.isPropertyDeclaration(n) || ts.isInterfaceDeclaration(n) ||
      ts.isTypeAliasDeclaration(n) || ts.isEnumDeclaration(n) ||
      ts.isModuleDeclaration(n) || ts.isImportEqualsDeclaration(n) ||
      ts.isExportDeclaration(n) || ts.isMissingDeclaration(n) ||
      ts.isImportClause(n) || ts.isExportSpecifier(n) ||
      ts.isImportSpecifier(n);
}

/**
 * If verbose, logs the given error that happened while walking n, with a
 * stacktrace.
 */
export function logASTWalkError(verbose: boolean, n: ts.Node, e: Error) {
  let nodeText = `[error getting name for ${JSON.stringify(n)}]`;
  try {
    nodeText = '"' + n.getFullText().trim() + '"';
  } catch {
  }
  debugLog(
      () => `Walking node ${nodeText} failed with error ${e}.\n` +
          `Stacktrace:\n${e.stack}`);
}
