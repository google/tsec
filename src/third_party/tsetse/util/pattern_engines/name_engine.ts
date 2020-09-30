import * as ts from 'typescript';

import {Checker} from '../../checker';
import {ErrorCode} from '../../error_code';
import {AbsoluteMatcher} from '../absolute_matcher';
import {debugLog} from '../ast_tools';
import {Fixer} from '../fixer';
import {isExpressionOfAllowedTrustedType} from '../is_trusted_type';
import {TrustedTypesConfig} from '../trusted_types_configuration';

import {PatternEngine} from './pattern_engine';

function checkId(
    tc: ts.TypeChecker, n: ts.Identifier, matcher: AbsoluteMatcher,
    allowedTrustedType: TrustedTypesConfig|undefined): ts.Identifier|undefined {
  debugLog(() => `inspecting ${n.getText().trim()}`);
  if (!matcher.matches(n, tc)) {
    debugLog(() => 'Not the right global name.');
    return;
  }

  const par = n.parent;
  if (allowedTrustedType && ts.isCallExpression(par) &&
      par.arguments.length > 0 &&
      isExpressionOfAllowedTrustedType(
          tc, par.arguments[0], allowedTrustedType)) {
    return;
  }

  return n;
}

/** Engine for the BANNED_NAME pattern */
export class NameEngine extends PatternEngine {
  register(checker: Checker) {
    for (const value of this.config.values) {
      const matcher = new AbsoluteMatcher(value);

      // `String.prototype.split` only returns emtpy array when both the string
      // and the splitter are empty. Here we should be able to safely assert pop
      // returns a non-null result.
      const bannedIdName = matcher.bannedName.split('.').pop()!;
      checker.onNamedIdentifier(
          bannedIdName,
          this.wrapCheckWithAllowlistingAndFixer(
              (tc, n: ts.Identifier) =>
                  checkId(tc, n, matcher, this.config.allowedTrustedType)),
          this.config.errorCode);
    }
  }
}
