import * as ts from 'typescript';

import {
  dealias,
  debugLog,
  isAllowlistedNamedDeclaration,
  isInStockLibraries,
} from './ast_tools';
import {
  AbsoluteMatcherDescriptor,
  AnySymbolMatcherDescriptor,
  ClosureMatcherDescriptor,
  GlobalMatcherDescriptor,
  PatternDescriptor,
} from './pattern_config';

const PATH_NAME_FORMAT = '[/\\.\\w\\d_\\-$]+';
const JS_IDENTIFIER_FORMAT = '[\\w\\d_\\-$]+';
const FQN_FORMAT = `(${JS_IDENTIFIER_FORMAT}.)*${JS_IDENTIFIER_FORMAT}`;
/**
 * Clutz glues js symbols to ts namespace by prepending "ಠ_ಠ.clutz.".
 * We need to include this prefix when the banned name is from Closure.
 */
const CLUTZ_SYM_PREFIX = 'ಠ_ಠ.clutz.';

/**
 * The scope of the matcher, which may be GLOBAL,
 * ANY_SYMBOL, CLOSURE or a file path filter. CLOSURE indicates that the
 * symbol is from the JS Closure library processed by clutz.
 */
export enum Scope {
  GLOBAL,
  ANY_SYMBOL,
  CLOSURE,
  PATH,
}

/**
 * This class matches symbols given a "foo.bar.baz" name, where none of the
 * steps are instances of classes.
 *
 * Note that this isn't smart about subclasses and types: to write a check, we
 * strongly suggest finding the expected symbol in externs to find the object
 * name on which the symbol was initially defined.
 *
 * The file filter (using AbsoluteMatcherDescriptor) specifies
 * (part of) the path of the file in which the symbol of interest is defined.
 * For example,
 * `new AbsoluteMatcherDescriptor('foo.bar.baz', 'path/to/file.ts')`.
 * With this filter, only symbols named "foo.bar.baz" that are defined in a path
 * that contains "path/to/file.ts" are matched.
 *
 * This filter is useful when mutiple symbols have the same name but
 * you want to match with a specific one. For example, assume that there are
 * two classes named "Foo" defined in /path/to/file0 and /path/to/file1.
 * // in /path/to/file0
 * export class Foo { static bar() {return "Foo.bar in file0";} }
 *
 * // in /path/to/file1
 * export class Foo { static bar() {return "Foo.bar in file1";} }
 *
 * Suppose that these two classes are referenced in two other files.
 * // in /path/to/file2
 * import {Foo} from /path/to/file0;
 * Foo.bar();
 *
 * // in /path/to/file3
 * import {Foo} from /path/to/file1;
 * Foo.bar();
 *
 * An absolute matcher "Foo.bar" without a file filter will match with both
 * references to "Foo.bar" in /path/to/file2 and /path/to/file3.
 * An absolute matcher from
 * `new AbsoluteMatcherDescriptor("Foo.bar", "/path/to/file1")` matches with the
 * "Foo.bar()" in /path/to/file3 because that references the "Foo.bar" defined
 * in /path/to/file1.
 *
 * Note that an absolute matcher will match with any reference to the symbol
 * defined in the file(s) specified by the file filter. For example, assume that
 * Foo from file1 is extended in file4.
 *
 * // in /path/to/file4
 * import {Foo} from /path/to/file1;
 * class Moo extends Foo { static tar() {return "Moo.tar in file4";} }
 * Moo.bar();
 *
 * An absolute matcher
 * `new AbsoluteMatcherDescriptor('Foo.bar', '/path/to/file1')` matches with
 * "Moo.bar()" because "bar" is defined as part of Foo in /path/to/file1.
 *
 * By default, the matcher won't match symbols in import statements if the
 * symbol is not renamed. Machers can be optionally configured symbols in import
 * statements even if it's not a named import.
 */
export class AbsoluteMatcher {
  readonly filePath?: string;
  readonly bannedName: string;
  readonly scope: Scope;

  constructor(
    value: PatternDescriptor,
    readonly matchImport: boolean = false,
  ) {
    if (value instanceof AbsoluteMatcherDescriptor) {
      this.scope = Scope.PATH;
      this.bannedName = value.fullyQualifiedName;
      this.filePath = value.pathName;
    } else if (value instanceof ClosureMatcherDescriptor) {
      this.scope = Scope.CLOSURE;
      this.bannedName = CLUTZ_SYM_PREFIX + value.fullyQualifiedName;
    } else if (value instanceof AnySymbolMatcherDescriptor) {
      this.scope = Scope.ANY_SYMBOL;
      this.bannedName = value.fullyQualifiedName;
    } else if (value instanceof GlobalMatcherDescriptor) {
      this.scope = Scope.GLOBAL;
      this.bannedName = value.fullyQualifiedName;
    } else {
      throw new Error(
        `AbsoluteMatcher expects an AbsoluteMatcherDescriptor, ClosureMatcherDescriptor, AnySymbolMatcherDescriptor, or GlobalMatcherDescriptor. Got ${typeof value}`,
      );
    }

    if (
      !value.fullyQualifiedName.match(FQN_FORMAT) ||
      (value instanceof AbsoluteMatcherDescriptor &&
        !value.pathName.match(PATH_NAME_FORMAT))
    ) {
      throw new Error(`Malformed matcher: ${JSON.stringify(value)}.`);
    }

    // JSConformance used to use a Foo.prototype.bar syntax for bar on
    // instances of Foo. TS doesn't surface the prototype part in the FQN, and
    // so you can't tell static `bar` on `foo` from the `bar` property/method
    // on `foo`. To avoid any confusion, throw there if we see `prototype` in
    // the spec: that way, it's obvious that you're not trying to match
    // properties.
    if (value.fullyQualifiedName.match('.prototype.')) {
      throw new Error(
        'Your pattern includes a .prototype, but the AbsoluteMatcher is ' +
          'meant for non-object matches. Use the PropertyMatcher instead, or ' +
          'the Property-based PatternKinds.',
      );
    }
  }

  matches(n: ts.Node, tc: ts.TypeChecker): boolean {
    const p = n.parent;

    debugLog(() => `start matching ${n.getText()} in ${p?.getText()}`);

    if (p !== undefined) {
      // Check if the node is being declared. Declaration may be imported
      // without programmer being aware of. We should not alert them about that.
      // Since import statments are also declarations, this has two notable
      // consequences.
      // - Match is negative for imports without renaming
      // - Match is positive for imports with renaming, when the imported name
      //   is the target. Since Tsetse is flow insensitive and we don't track
      //   symbol aliases, the import statement is the only place we can match
      //   bad symbols if they get renamed.
      if (isAllowlistedNamedDeclaration(p) && p.name === n) {
        if (!this.matchImport || !ts.isImportSpecifier(p)) {
          return false;
        }
      }
    }

    // Get the symbol (or the one at the other end of this alias) that we're
    // looking at.
    const s = dealias(tc.getSymbolAtLocation(n), tc);
    if (!s) {
      debugLog(() => `cannot get symbol`);
      return (
        this.scope === Scope.GLOBAL && matchGoogGlobal(n, this.bannedName, tc)
      );
    }

    // The TS-provided FQN tells us the full identifier, and the origin file
    // in some circumstances.
    const fqn = tc.getFullyQualifiedName(s);
    debugLog(() => `got FQN ${fqn}`);

    // Name-based check: `getFullyQualifiedName` returns `"filename".foo.bar` or
    // just `foo.bar` or `global.foo.bar` if the symbol is ambient. The check
    // here should consider all three cases.
    if (
      !fqn.endsWith('".' + this.bannedName) &&
      fqn !== this.bannedName &&
      fqn !== 'global.' + this.bannedName
    ) {
      debugLog(() => `FQN ${fqn} doesn't match name ${this.bannedName}`);
      return false;
    }

    // If scope is ANY_SYMBOL or CLOSURE, it's sufficient to conclude we have a
    // match.
    if (this.scope === Scope.ANY_SYMBOL || this.scope === Scope.CLOSURE) {
      return true;
    }

    // If there is no declaration, the symbol is a language built-in object.
    // This is a match only if scope is GLOBAL.
    const declarations = s.getDeclarations();
    if (declarations === undefined) {
      return this.scope === Scope.GLOBAL;
    }

    // No file info in the FQN means it's imported from a .d.ts declaration
    // file. This can be from a core library, a JS library, or an exported local
    // symbol defined in another TS target. We need to extract the name of the
    // declaration file.
    if (!fqn.startsWith('"')) {
      if (this.scope === Scope.GLOBAL) {
        return declarations.some(isInStockLibraries);
      } else {
        return declarations.some((d) => {
          const srcFilePath = d.getSourceFile()?.fileName;
          return srcFilePath && srcFilePath.match(this.filePath!);
        });
      }
    } else {
      // Matchers like global scope can't come from a file.
      if (this.filePath === undefined) {
        return false;
      }
      const last = fqn.indexOf('"', 1);
      if (last === -1) {
        throw new Error('Malformed fully-qualified name.');
      }
      const filePath = fqn.substring(1, last);
      return filePath.match(this.filePath!) !== null;
    }
  }
}

function matchGoogGlobal(n: ts.Node, bannedName: string, tc: ts.TypeChecker) {
  if (n.parent === undefined) return false;

  let accessExpr = n.parent;

  const ids = bannedName.split('.').reverse();
  for (const id of ids) {
    let memberName;
    if (ts.isPropertyAccessExpression(accessExpr)) {
      memberName = accessExpr.name.text;
      accessExpr = accessExpr.expression;
    } else if (ts.isElementAccessExpression(accessExpr)) {
      const argType = tc.getTypeAtLocation(accessExpr.argumentExpression);
      if (argType.isStringLiteral()) {
        memberName = argType.value;
      } else {
        return false;
      }
      accessExpr = accessExpr.expression;
    } else {
      return false;
    }
    if (id !== memberName) return false;
  }

  const s = dealias(tc.getSymbolAtLocation(accessExpr), tc);
  if (s === undefined) return false;

  return tc.getFullyQualifiedName(s) === 'goog.global';
}
