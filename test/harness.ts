import * as fs from 'fs';
import {ENABLED_RULES} from '../src/rule_groups';
import {Checker} from '../src/third_party/tsetse/checker';
import {Failure} from '../src/third_party/tsetse/failure';
import * as path from 'path';
import * as ts from 'typescript';

/** Simplified Failure for test matching purposes. */
export interface SimpleFailure {
  ruleName: string;
  start: ts.LineAndCharacter;
  end: ts.LineAndCharacter;
}

function simplifyFailure(failure: Failure): SimpleFailure {
  const diag = failure.toDiagnostic();
  const start = ts.getLineAndCharacterOfPosition(diag.file!, diag.start!);
  const end = ts.getLineAndCharacterOfPosition(diag.file!, diag.end);
  const ruleName = diag.source!;
  return {ruleName, start, end};
}

/** Compile intergation test assets and run security rules on them. */
export function compileAndCheck(testDir: string): SimpleFailure[] {
  const sourceFiles =
      fs.readdirSync(testDir).map(f => path.resolve(testDir, f));
  const program = ts.createProgram(sourceFiles, {});
  const checker = new Checker(program);
  for (const ruleCtr of ENABLED_RULES) {
    new ruleCtr().register(checker);
  }
  return program.getSourceFiles()
      .map(s => checker.execute(s))
      .reduce((prev, cur) => prev.concat(cur))
      .map(f => simplifyFailure(f));
}

/**
 * Walk the test asset folders and run the checker for all of them to get the
 * violations.
 */
function getCheckResultsForAllAssets(assetPath: string) {
  const goldenReference: {[key: string]: SimpleFailure[]} = {};
  for (const category of ['dom_security', 'unsafe']) {
    const categoryPath = path.resolve(assetPath, category);
    for (const ruleName of fs.readdirSync(categoryPath)) {
      const prefixedRuleName = `${category}/${ruleName}`;
      goldenReference[prefixedRuleName] =
          compileAndCheck(path.resolve(assetPath, prefixedRuleName));
    }
  }
  return goldenReference;
}

if (require.main === module) {
  console.log(JSON.stringify(
      getCheckResultsForAllAssets(path.resolve(__dirname, 'asset')), undefined,
      2));
}
