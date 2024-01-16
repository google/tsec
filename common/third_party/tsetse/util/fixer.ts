import * as ts from 'typescript';

import {Fix, IndividualChange} from '../failure';
import {debugLog} from './ast_tools';

export {type Fix} from '../failure';


/**
 * A Fixer turns Nodes (that are supposed to have been matched before) into a
 * Fix. This is meant to be implemented by Rule implementers (or
 * ban-preset-pattern users). See also `buildReplacementFixer` for a simpler way
 * of implementing a Fixer.
 */
export interface Fixer {
  getFixForFlaggedNode(node: ts.Node): Fix|undefined;
}

/**
 * A simple Fixer builder based on a function that looks at a node, and
 * output either nothing, or a replacement. If this is too limiting, implement
 * Fixer instead.
 */
export function buildReplacementFixer(
    potentialReplacementGenerator: (node: ts.Node) =>
        ({replaceWith: string} | undefined)): Fixer {
  return {
    getFixForFlaggedNode: (n: ts.Node): Fix | undefined => {
      const partialFix = potentialReplacementGenerator(n);
      if (!partialFix) {
        return;
      }
      return {
        changes: [{
          sourceFile: n.getSourceFile(),
          start: n.getStart(),
          end: n.getEnd(),
          replacement: partialFix.replaceWith,
        }],
      };
    }
  };
}

interface NamedImportsFromModule {
  namedBindings: ts.NamedImports;
  fromModule: string;
}

interface NamespaceImportFromModule {
  namedBindings: ts.NamespaceImport;
  fromModule: string;
}

// Type union is not distributive over properties so just define a new inteface
interface NamedImportBindingsFromModule {
  namedBindings: ts.NamedImports|ts.NamespaceImport;
  fromModule: string;
}

/**
 * Builds an IndividualChange that imports the required symbol from the given
 * file under the given name. This might reimport the same thing twice in some
 * cases, but it will always make it available under the right name (though
 * its name might collide with other imports, as we don't currently check for
 * that).
 */
export function maybeAddNamedImport(
    source: ts.SourceFile, importWhat: string, fromModule: string,
    importAs?: string, tazeComment?: string): IndividualChange|undefined {
  const importStatements = source.statements.filter(ts.isImportDeclaration);
  const importSpecifier =
      importAs ? `${importWhat} as ${importAs}` : importWhat;

  // See if the original code already imported something from the right file
  const importFromRightModule =
      importStatements
          .map(maybeParseImportNode)
          // Exclude undefined
          .filter(
              (binding): binding is NamedImportBindingsFromModule =>
                  binding !== undefined)
          // Exclude wildcard import
          .filter(
              (binding): binding is NamedImportsFromModule =>
                  ts.isNamedImports(binding.namedBindings))
          // Exlcude imports from the wrong file
          .find(binding => binding.fromModule === fromModule);

  if (importFromRightModule) {
    const foundRightImport = importFromRightModule.namedBindings.elements.some(
        iSpec => iSpec.propertyName ?
            iSpec.name.getText() === importAs &&  // import {foo as bar}
                iSpec.propertyName.getText() === importWhat :
            iSpec.name.getText() === importWhat);  // import {foo}
    if (!foundRightImport) {
      // Insert our symbol in the list of imports from that file.
      debugLog(() => `No named imports from that file, generating new fix`);
      return {
        start: importFromRightModule.namedBindings.elements[0].getStart(),
        end: importFromRightModule.namedBindings.elements[0].getStart(),
        sourceFile: source,
        replacement: `${importSpecifier}, `,
      };
    }
    return;  // Our request is already imported under the right name.
  }

  // If we get here, we didn't find anything imported from the wanted file, so
  // we'll need the full import string. Add it after the last import,
  // and let clang-format handle the rest.
  const newImportStatement =
      `import {${importSpecifier}} from '${fromModule}';` +
      (tazeComment ? `  ${tazeComment}\n` : `\n`);
  const insertionPosition = importStatements.length ?
      importStatements[importStatements.length - 1].getEnd() + 1 :
      0;
  return {
    start: insertionPosition,
    end: insertionPosition,
    sourceFile: source,
    replacement: newImportStatement,
  };
}

/**
 * Builds an IndividualChange that imports the required namespace from the given
 * file under the given name. This might reimport the same thing twice in some
 * cases, but it will always make it available under the right name (though
 * its name might collide with other imports, as we don't currently check for
 * that).
 */
export function maybeAddNamespaceImport(
    source: ts.SourceFile, fromModule: string, importAs: string,
    tazeComment?: string): IndividualChange|undefined {
  const importStatements = source.statements.filter(ts.isImportDeclaration);

  const hasTheRightImport =
      importStatements
          .map(maybeParseImportNode)
          // Exclude undefined
          .filter(
              (binding): binding is NamedImportBindingsFromModule =>
                  binding !== undefined)
          // Exlcude named imports
          .filter(
              (binding): binding is NamespaceImportFromModule =>
                  ts.isNamespaceImport(binding.namedBindings))
          .some(
              binding => binding.fromModule === fromModule &&
                  binding.namedBindings.name.getText() === importAs);

  if (!hasTheRightImport) {
    const insertionPosition = importStatements.length ?
        importStatements[importStatements.length - 1].getEnd() + 1 :
        0;
    return {
      start: insertionPosition,
      end: insertionPosition,
      sourceFile: source,
      replacement: tazeComment ?
          `import * as ${importAs} from '${fromModule}';  ${tazeComment}\n` :
          `import * as ${importAs} from '${fromModule}';\n`,
    };
  }
  return;
}

/**
 * This tries to make sense of an ImportDeclaration, and returns the
 * interesting parts, undefined if the import declaration is valid but not
 * understandable by the checker.
 */
function maybeParseImportNode(iDecl: ts.ImportDeclaration):
    NamedImportBindingsFromModule|undefined {
  if (!iDecl.importClause) {
    // something like import "./file";
    debugLog(
        () =>
            `Ignoring import without imported symbol: ${iDecl.getFullText()}`);
    return;
  }
  if (iDecl.importClause.name || !iDecl.importClause.namedBindings) {
    // Seems to happen in defaults imports like import Foo from 'Bar'.
    // Not much we can do with that when trying to get a hold of some
    // symbols, so just ignore that line (worst case, we'll suggest another
    // import style).
    debugLog(() => `Ignoring import: ${iDecl.getFullText()}`);
    return;
  }
  if (!ts.isStringLiteral(iDecl.moduleSpecifier)) {
    debugLog(() => `Ignoring import whose module specifier is not literal`);
    return;
  }
  return {
    namedBindings: iDecl.importClause.namedBindings,
    fromModule: iDecl.moduleSpecifier.text
  };
}
