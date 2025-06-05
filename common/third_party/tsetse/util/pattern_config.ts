import {AllowlistEntry} from '../allowlist';
import {TrustedTypesConfig} from './trusted_types_configuration';

/**
 * The list of supported patterns useable in ConformancePatternRule. The
 * patterns whose name match JSConformance patterns should behave similarly (see
 * https://github.com/google/closure-compiler/wiki/JS-Conformance-Framework)
 */
export enum PatternKind {
  /** Ban use of fully distinguished names. */
  BANNED_NAME = 'banned-name',
  /** Ban use of fully distinguished names, even in import statements. */
  BANNED_IMPORTED_NAME = 'banned-imported-name',
  /** Ban use of instance properties */
  BANNED_PROPERTY = 'banned-property',
  /**
   * Ban instance property, like BANNED_PROPERTY but where reads of the
   * property are allowed.
   */
  BANNED_PROPERTY_WRITE = 'banned-property-write',
  /**
   * Ban instance property write unless the property is assigned a constant
   * literal.
   */
  BANNED_PROPERTY_NON_CONSTANT_WRITE = 'banned-property-non-constant-write',
}

/**
 * A config for `PatternEngine`.
 */
export interface PatternEngineConfig {
  /**
   * Values have a pattern-specific syntax. See each patternKind's tests for
   * examples.
   */
  values: PatternDescriptor[];

  /** The error code assigned to this pattern. */
  errorCode: number;

  /** The error message this pattern will create. */
  errorMessage: string;

  /** A list of allowlist blocks. */
  allowlistEntries?: AllowlistEntry[];

  /**
   * Type of the allowed Trusted value by the rule or custom
   * `TrustedTypesConfig`.
   */
  allowedTrustedType?: TrustedTypesConfig;
}

/**
 * A data class to describe how a symbol should be matched. This is used by the
 * name engine or other engines like WizElementCallEngine.
 */
export class AbsoluteMatcherDescriptor {
  constructor(
    readonly fullyQualifiedName: string,
    readonly pathName: string,
  ) {}
}

/**
 * A data class for reprenting a global symbol to be matched.
 */
export class GlobalMatcherDescriptor {
  constructor(readonly fullyQualifiedName: string) {}
}

/**
 * A data class for reprenting a closure symbol to be matched.
 */
export class ClosureMatcherDescriptor {
  constructor(readonly fullyQualifiedName: string) {}
}

/**
 * A data class for reprenting a symbol to be matched solely from its name.
 */
export class AnySymbolMatcherDescriptor {
  constructor(readonly fullyQualifiedName: string) {}
}

/**
 * A data class for reprenting a property to be matched. The spec should be in
 * the form of "Foo.prototype.bar" format.
 */
export class PropertyMatcherDescriptor {
  constructor(readonly spec: string) {}
}

/**
 * A data class for describing a pattern.
 */
export type PatternDescriptor =
  | GlobalMatcherDescriptor
  | ClosureMatcherDescriptor
  | AnySymbolMatcherDescriptor
  | AbsoluteMatcherDescriptor
  | PropertyMatcherDescriptor;

/**
 * A config for `ConformancePatternRule`.
 */
export interface PatternRuleConfig extends PatternEngineConfig {
  kind: PatternKind;

  /**
   * An optional name for that rule, which will be the rule's `ruleName`.
   * Should be lower-dashed-case.
   */
  name?: string;
}

/**
 * Internal function to override the rule config properties before passing to
 * parent constructor.
 */
export function overridePatternConfig(
  config: PatternRuleConfig,
): PatternRuleConfig {

  return config;
}
