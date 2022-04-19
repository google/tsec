import {Checker} from '../checker';
import {ErrorCode} from '../error_code';
import {AbstractRule} from '../rule';
import {Fixer} from '../util/fixer';
import {PatternEngineConfig, PatternKind, PatternRuleConfig} from '../util/pattern_config';
import {ImportedNameEngine, NameEngine} from '../util/pattern_engines/name_engine';
import {PatternEngine} from '../util/pattern_engines/pattern_engine';
import {PropertyEngine} from '../util/pattern_engines/property_engine';
import {PropertyNonConstantWriteEngine} from '../util/pattern_engines/property_non_constant_write_engine';
import {PropertyWriteEngine} from '../util/pattern_engines/property_write_engine';

/**
 * Builds a Rule that matches a certain pattern, given as parameter, and
 * that can additionally run a suggested fix generator on the matches.
 *
 * This is templated, mostly to ensure the nodes that have been matched
 * correspond to what the Fixer expects.
 */
export class ConformancePatternRule implements AbstractRule {
  readonly ruleName: string;
  readonly code: number;
  private readonly engine: PatternEngine;

  constructor(readonly config: PatternRuleConfig, fixers?: Fixer[]) {
    this.code = config.errorCode;
    // Avoid undefined rule names.
    this.ruleName = config.name ?? '';

    let engine: {
      new (ruleName: string, config: PatternEngineConfig, fixers?: Fixer[]):
          PatternEngine
    };

    switch (config.kind) {
      case PatternKind.BANNED_PROPERTY:
        engine = PropertyEngine;
        break;
      case PatternKind.BANNED_PROPERTY_WRITE:
        engine = PropertyWriteEngine;
        break;
      case PatternKind.BANNED_PROPERTY_NON_CONSTANT_WRITE:
        engine = PropertyNonConstantWriteEngine;
        break;
      case PatternKind.BANNED_NAME:
        engine = NameEngine;
        break;
      case PatternKind.BANNED_IMPORTED_NAME:
        engine = ImportedNameEngine;
        break;
      default:
        throw new Error('Config type not recognized, or not implemented yet.');
    }

    this.engine = new engine(this.ruleName, config, fixers);
  }

  register(checker: Checker) {
    this.engine.register(checker);
  }
}

// Re-exported for convenience when instantiating rules.
/**
 * The list of supported patterns useable in ConformancePatternRule. The
 * patterns whose name match JSConformance patterns should behave similarly (see
 * https://github.com/google/closure-compiler/wiki/JS-Conformance-Framework).
 */
export {PatternKind};
export {ErrorCode};
