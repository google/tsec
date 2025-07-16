import * as ts from 'typescript';
import {PatternDescriptor, PropertyMatcherDescriptor} from './pattern_config';

/**
 * A matcher for property accesses. See LegacyPropertyMatcher and
 * TypedPropertyMatcher for more details.
 */
export interface PropertyMatcher {
  readonly bannedType: string;
  readonly bannedProperty: string;
  matches(n: ts.PropertyAccessExpression, tc: ts.TypeChecker): boolean;
  typeMatches(inspectedType: ts.Type): boolean;
}

/**
 * This class matches a property access node, based on a property holder type
 * (through its name), i.e. a class, and a property name.
 *
 * The logic is voluntarily simple: if a matcher for `a.b` tests a `x.y` node,
 * it will return true if:
 * - `x` is of type `a` either directly (name-based) or through inheritance
 *   (ditto),
 * - and, textually, `y` === `b`.
 *
 * Note that the logic is different from TS's type system: this matcher doesn't
 * have any knowledge of structural typing.
 */
export class LegacyPropertyMatcher implements PropertyMatcher {
  static fromSpec(value: PatternDescriptor): LegacyPropertyMatcher {
    if (!(value instanceof PropertyMatcherDescriptor)) {
      throw new Error(
        `LegacyPropertyMatcher expects a PropertyMatcherDescriptor.`,
      );
    }
    if (value.spec.indexOf('.prototype.') === -1) {
      throw new Error(`BANNED_PROPERTY expects a .prototype in your query.`);
    }
    const requestParser = /^([\w\d_.-]+)\.prototype\.([\w\d_.-]+)$/;
    const matches = requestParser.exec(value.spec);
    if (!matches) {
      throw new Error('Cannot understand the BannedProperty spec' + value.spec);
    }
    const [bannedType, bannedProperty] = matches.slice(1);
    return new LegacyPropertyMatcher(bannedType, bannedProperty);
  }

  constructor(
    readonly bannedType: string,
    readonly bannedProperty: string,
  ) {}

  /**
   * @param n The PropertyAccessExpression we're looking at.
   */
  matches(n: ts.PropertyAccessExpression, tc: ts.TypeChecker) {
    return (
      n.name.text === this.bannedProperty &&
      this.typeMatches(tc.getTypeAtLocation(n.expression))
    );
  }

  /**
   * Match types recursively in the lattice. This function over-approximates
   * the result by considering union types and intersection types as the same.
   */
  typeMatches(inspectedType: ts.Type): boolean {
    // Skip checking mocked objects
    if (inspectedType.aliasSymbol?.escapedName === 'SpyObj') return false;

    // Exact type match
    if (inspectedType.getSymbol()?.getName() === this.bannedType) {
      return true;
    }

    // If the type is an intersection/union, check if any of the component
    // matches
    if (inspectedType.isUnionOrIntersection()) {
      return inspectedType.types.some((comp) => this.typeMatches(comp));
    }

    const baseTypes = inspectedType.getBaseTypes() || [];
    return baseTypes.some((base) => this.typeMatches(base));
  }
}

/**
 * PropertyMatcher that reliers on the comparison of type instances of the base
 * object and property name to match expressions.
 * TODO(gweg): Implement this matcher.
 */
export class TypedPropertyMatcher implements PropertyMatcher {
  static fromSpec(value: PatternDescriptor): TypedPropertyMatcher {
    throw new Error('Not implemented yet');
  }

  constructor(
    readonly bannedType: string,
    readonly bannedProperty: string,
  ) {}

  /**
   * @param n The PropertyAccessExpression we're looking at.
   */
  matches(n: ts.PropertyAccessExpression, tc: ts.TypeChecker) {
    return (
      n.name.text === this.bannedProperty &&
      this.typeMatches(tc.getTypeAtLocation(n.expression))
    );
  }

  /**
   * Relies on the type checker to match the type.
   */
  typeMatches(inspectedType: ts.Type): boolean {
    throw new Error('Not implemented yet');
  }
}
