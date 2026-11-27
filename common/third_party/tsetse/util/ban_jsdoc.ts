// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as ts from 'typescript';

import {Allowlist} from '../allowlist';
import {Checker} from '../checker';
import {replaceNode} from '../failure';

/**
 * All the ts.SyntaxKind members, which can have JSDoc tags according to
 * ts.HasJSDoc. A type test below verifies that this array stays up to date.
 */
export const HAS_JSDOC_SYNTAX_KINDS = [
  ts.SyntaxKind.ArrowFunction,
  ts.SyntaxKind.Block,
  ts.SyntaxKind.BreakStatement,
  ts.SyntaxKind.CallSignature,
  ts.SyntaxKind.CaseClause,
  ts.SyntaxKind.ClassDeclaration,
  ts.SyntaxKind.ClassExpression,
  ts.SyntaxKind.ClassStaticBlockDeclaration,
  ts.SyntaxKind.ConstructSignature,
  ts.SyntaxKind.Constructor,
  ts.SyntaxKind.ConstructorType,
  ts.SyntaxKind.ContinueStatement,
  ts.SyntaxKind.DebuggerStatement,
  ts.SyntaxKind.DoStatement,
  ts.SyntaxKind.EmptyStatement,
  ts.SyntaxKind.EndOfFileToken,
  ts.SyntaxKind.EnumDeclaration,
  ts.SyntaxKind.EnumMember,
  ts.SyntaxKind.ExportAssignment,
  ts.SyntaxKind.ExportDeclaration,
  ts.SyntaxKind.ExportSpecifier,
  ts.SyntaxKind.ExpressionStatement,
  ts.SyntaxKind.ForInStatement,
  ts.SyntaxKind.ForOfStatement,
  ts.SyntaxKind.ForStatement,
  ts.SyntaxKind.FunctionDeclaration,
  ts.SyntaxKind.FunctionExpression,
  ts.SyntaxKind.FunctionType,
  ts.SyntaxKind.GetAccessor,
  ts.SyntaxKind.IfStatement,
  ts.SyntaxKind.ImportDeclaration,
  ts.SyntaxKind.ImportEqualsDeclaration,
  ts.SyntaxKind.IndexSignature,
  ts.SyntaxKind.InterfaceDeclaration,
  ts.SyntaxKind.JSDocFunctionType,
  ts.SyntaxKind.LabeledStatement,
  ts.SyntaxKind.MethodDeclaration,
  ts.SyntaxKind.MethodSignature,
  ts.SyntaxKind.ModuleDeclaration,
  ts.SyntaxKind.NamedTupleMember,
  ts.SyntaxKind.NamespaceExportDeclaration,
  ts.SyntaxKind.Parameter,
  ts.SyntaxKind.ParenthesizedExpression,
  ts.SyntaxKind.PropertyAssignment,
  ts.SyntaxKind.PropertyDeclaration,
  ts.SyntaxKind.PropertySignature,
  ts.SyntaxKind.ReturnStatement,
  ts.SyntaxKind.SetAccessor,
  ts.SyntaxKind.ShorthandPropertyAssignment,
  ts.SyntaxKind.SpreadAssignment,
  ts.SyntaxKind.SwitchStatement,
  ts.SyntaxKind.ThrowStatement,
  ts.SyntaxKind.TryStatement,
  ts.SyntaxKind.TypeAliasDeclaration,
  ts.SyntaxKind.VariableDeclaration,
  ts.SyntaxKind.VariableStatement,
  ts.SyntaxKind.WhileStatement,
  ts.SyntaxKind.WithStatement,
] as const;

// Verify that the `HAS_JSDOC_SYNTAX_KINDS` array stays up to date. If you see a
// compile error here, add syntax kinds to the array or remove them to make it
// align with `ts.HasJSDoc` again.
type LocalJSDocSyntaxKind = (typeof HAS_JSDOC_SYNTAX_KINDS)[number];
type ExpectLocalArrayToContainAllOf<T extends LocalJSDocSyntaxKind> = T;
type ExpectTsDeclarationToContainAllOf<T extends ts.HasJSDoc['kind']> = T;
// tslint:disable-next-line:no-unused-variable
type TestCases = [
  // TODO: go/ts50upgrade - Auto-added; fix after TS 5.0 upgrade.
  //   TS2344: Type 'SyntaxKind.EndOfFileToken | SyntaxKind.Identifier |
  //   SyntaxKind.TypeParameter | SyntaxKind.Parameter |
  //   SyntaxKind.PropertySignature | SyntaxKind.PropertyDeclaration |
  //   SyntaxKind.MethodSignature | ... 57 more ... | S...
  // @ts-ignore
  ExpectLocalArrayToContainAllOf<ts.HasJSDoc['kind']>,
  ExpectTsDeclarationToContainAllOf<LocalJSDocSyntaxKind>,
];

/**
 * Shared logic for checking for banned JSDoc tags. Create rules that use this
 * for each banned tag, which will allow you to use standard allowlist
 * functionality per tag.
 */
export function checkForBannedJsDocTag(
  bannedTag: string,
  ruleName: string,
  checker: Checker,
  node: ts.HasJSDoc,
  allowlist?: Allowlist,
): void {
  // Reach into TypeScript's @internal `node.jsDoc` property rather than calling
  // `node.getChildren()` (which tokenizes leading trivia and materializes
  // child arrays on every visited node) or `ts.getJSDocTags()` (which walks
  // parent nodes and can omit extraneous tags; see
  // https://github.com/microsoft/TypeScript/issues/42895).
  // tslint:disable-next-line:no-any circumventing @internal TS AST property
  const jsDocs: readonly ts.JSDoc[] | undefined = (node as any).jsDoc;
  if (!jsDocs) return;

  let matchingTag: ts.JSDocTag | undefined;
  for (const jsDoc of jsDocs) {
    if (!jsDoc.tags) continue;
    matchingTag = jsDoc.tags.find((tag) => tag.tagName.text === bannedTag);
    if (matchingTag) break;
  }
  if (!matchingTag) return;

  const fix = replaceNode(matchingTag, '');
  checker.addFailureAtNode(
    matchingTag,
    `do not use @${bannedTag}`,
    ruleName,
    allowlist,
    [fix],
  );
}
