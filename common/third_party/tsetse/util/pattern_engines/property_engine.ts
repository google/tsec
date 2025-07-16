import * as ts from 'typescript';

import {Checker} from '../../checker';
import {debugLog} from '../ast_tools';
import {PropertyMatcherDescriptor} from '../pattern_config';
import {
  LegacyPropertyMatcher,
  PropertyMatcher,
  TypedPropertyMatcher,
} from '../property_matcher';

import {PatternEngine} from './pattern_engine';

/** Match an AST node with a property matcher. */
export function matchProperty(
  tc: ts.TypeChecker,
  n: ts.PropertyAccessExpression | ts.ElementAccessExpression,
  matcher: PropertyMatcher,
): ts.Node | undefined {
  debugLog(() => `inspecting ${n.getText().trim()}`);
  if (!matcher.typeMatches(tc.getTypeAtLocation(n.expression))) return;
  return n;
}

/**
 * Engine for the BANNED_PROPERTY pattern. It captures accesses to property
 * matching the spec regardless whether it's a read or write.
 */
export class PropertyEngine extends PatternEngine {
  protected registerWith(checker: Checker, matchNode: typeof matchProperty) {
    for (const value of this.config.values) {
      let matcher: PropertyMatcher;
      if (!(value instanceof PropertyMatcherDescriptor)) {
        throw new Error(
          `PropertyEngine (through BANNED_PROPERTY) requires a PropertyMatcherDescriptor.`,
        );
      }
      if (this.config.useTypedPropertyMatcher) {
        matcher = TypedPropertyMatcher.fromSpec(value);
      } else {
        matcher = LegacyPropertyMatcher.fromSpec(value);
      }
      checker.onNamedPropertyAccess(
        matcher.bannedProperty,
        this.wrapCheckWithAllowlistingAndFixer((tc, n) =>
          matchNode(tc, n, matcher),
        ),
        this.config.errorCode,
      );

      checker.onStringLiteralElementAccess(
        matcher.bannedProperty,
        this.wrapCheckWithAllowlistingAndFixer((tc, n) =>
          matchNode(tc, n, matcher),
        ),
        this.config.errorCode,
      );
    }
  }

  register(checker: Checker) {
    this.registerWith(checker, matchProperty);
  }
}
