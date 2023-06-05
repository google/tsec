/**
 * @fileoverview Checker contains all the information we need to perform source
 * file AST traversals and report errors.
 */

import * as ts from 'typescript';

import {Allowlist} from './allowlist';
import {Failure, Fix} from './failure';


/**
 * A Handler contains a handler function and its corresponding error code so
 * when the handler function is triggered we know which rule is violated.
 */
interface Handler<T extends ts.Node> {
  handlerFunction(checker: Checker, node: T): void;
  code: number;
}

/**
 * Tsetse rules use on() and addFailureAtNode() for rule implementations.
 * Rules can get a ts.TypeChecker from checker.typeChecker so typed rules are
 * possible. Compiler uses execute() to run the Tsetse check.
 */
export class Checker {
  /** Node to handlers mapping for all enabled rules. */
  private readonly nodeHandlersMap =
      new Map<ts.SyntaxKind, Array<Handler<ts.Node>>>();
  /**
   * Mapping from identifier name to handlers for all rules inspecting property
   * names.
   */
  private readonly namedIdentifierHandlersMap =
      new Map<string, Array<Handler<ts.Identifier>>>();
  /**
   * Mapping from property name to handlers for all rules inspecting property
   * accesses expressions.
   */
  private readonly namedPropertyAccessHandlersMap =
      new Map<string, Array<Handler<ts.PropertyAccessExpression>>>();
  /**
   * Mapping from string literal value to handlers for all rules inspecting
   * string literals.
   */
  private readonly stringLiteralElementAccessHandlersMap =
      new Map<string, Array<Handler<ts.ElementAccessExpression>>>();

  private failures: Failure[] = [];
  private exemptedFailures: Failure[] = [];

  private currentSourceFile: ts.SourceFile|undefined;
  // currentCode will be set before invoking any handler functions so the value
  // initialized here is never used.
  private currentCode = 0;

  private readonly options: ts.CompilerOptions;

  /** Allow typed rules via typeChecker. */
  typeChecker: ts.TypeChecker;

  constructor(
      program: ts.Program, private readonly host: ts.ModuleResolutionHost) {
    // Avoid the cost for each rule to create a new TypeChecker.
    this.typeChecker = program.getTypeChecker();
    this.options = program.getCompilerOptions();
  }

  /**
   * This doesn't run any checks yet. Instead, it registers `handlerFunction` on
   * `nodeKind` node in `nodeHandlersMap` map. After all rules register their
   * handlers, the source file AST will be traversed.
   */
  on<T extends ts.Node>(
      nodeKind: T['kind'], handlerFunction: (checker: Checker, node: T) => void,
      code: number) {
    const newHandler: Handler<T> = {handlerFunction, code};
    const registeredHandlers = this.nodeHandlersMap.get(nodeKind);
    if (registeredHandlers === undefined) {
      this.nodeHandlersMap.set(nodeKind, [newHandler]);
    } else {
      registeredHandlers.push(newHandler);
    }
  }

  /**
   * Similar to `on`, but registers handlers on more specific node type, i.e.,
   * identifiers.
   */
  onNamedIdentifier(
      identifierName: string,
      handlerFunction: (checker: Checker, node: ts.Identifier) => void,
      code: number) {
    const newHandler: Handler<ts.Identifier> = {handlerFunction, code};
    const registeredHandlers =
        this.namedIdentifierHandlersMap.get(identifierName);
    if (registeredHandlers === undefined) {
      this.namedIdentifierHandlersMap.set(identifierName, [newHandler]);
    } else {
      registeredHandlers.push(newHandler);
    }
  }

  /**
   * Similar to `on`, but registers handlers on more specific node type, i.e.,
   * property access expressions.
   */
  onNamedPropertyAccess(
      propertyName: string,
      handlerFunction:
          (checker: Checker, node: ts.PropertyAccessExpression) => void,
      code: number) {
    const newHandler:
        Handler<ts.PropertyAccessExpression> = {handlerFunction, code};
    const registeredHandlers =
        this.namedPropertyAccessHandlersMap.get(propertyName);
    if (registeredHandlers === undefined) {
      this.namedPropertyAccessHandlersMap.set(propertyName, [newHandler]);
    } else {
      registeredHandlers.push(newHandler);
    }
  }

  /**
   * Similar to `on`, but registers handlers on more specific node type, i.e.,
   * element access expressions with string literals as keys.
   */
  onStringLiteralElementAccess(
      key: string,
      handlerFunction:
          (checker: Checker, node: ts.ElementAccessExpression) => void,
      code: number) {
    const newHandler:
        Handler<ts.ElementAccessExpression> = {handlerFunction, code};
    const registeredHandlers =
        this.stringLiteralElementAccessHandlersMap.get(key);
    if (registeredHandlers === undefined) {
      this.stringLiteralElementAccessHandlersMap.set(key, [newHandler]);
    } else {
      registeredHandlers.push(newHandler);
    }
  }

  /**
   * Add a failure with a span.
   * @param source the origin of the failure, e.g., the name of a rule reporting
   *     the failure
   * @param fixes optional, automatically generated fixes that can remediate the
   *     failure
   */
  addFailure(
      start: number, end: number, failureText: string, source: string|undefined,
      allowlist: Allowlist|undefined, fixes?: Fix[],
      relatedInformation?: ts.DiagnosticRelatedInformation[]) {
    if (!this.currentSourceFile) {
      throw new Error('Source file not defined');
    }
    if (start > end || end > this.currentSourceFile.end || start < 0) {
      // Since only addFailureAtNode() is exposed for now this shouldn't happen.
      throw new Error(
          `Invalid start and end position: [${start}, ${end}]` +
          ` in file ${this.currentSourceFile.fileName}.`);
    }

    const failure = new Failure(
        this.currentSourceFile, start, end, failureText, this.currentCode,
        source, fixes ?? [], relatedInformation);

    let filePath = this.currentSourceFile.fileName;
    const isFailureAllowlisted = allowlist?.isAllowlisted(filePath);
    const failures =
        isFailureAllowlisted ? this.exemptedFailures : this.failures;

    failures.push(failure);
  }

  addFailureAtNode(
      node: ts.Node, failureText: string, source: string|undefined,
      allowlist: Allowlist|undefined, fixes?: Fix[],
      relatedInformation?: ts.DiagnosticRelatedInformation[]) {
    // node.getStart() takes a sourceFile as argument whereas node.getEnd()
    // doesn't need it.
    this.addFailure(
        node.getStart(this.currentSourceFile), node.getEnd(), failureText,
        source, allowlist, fixes, relatedInformation);
  }

  createRelatedInformation(node: ts.Node, messageText: string):
      ts.DiagnosticRelatedInformation {
    if (!this.currentSourceFile) {
      throw new Error('Source file not defined');
    }
    const start = node.getStart(this.currentSourceFile);
    return {
      category: ts.DiagnosticCategory.Error,
      code: this.currentCode,
      file: this.currentSourceFile,
      start,
      length: node.getEnd() - start,
      messageText,
    };
  }

  /** Dispatch general handlers registered via `on` */
  dispatchNodeHandlers(node: ts.Node) {
    const handlers = this.nodeHandlersMap.get(node.kind);
    if (handlers === undefined) return;

    for (const handler of handlers) {
      this.currentCode = handler.code;
      handler.handlerFunction(this, node);
    }
  }

  /** Dispatch identifier handlers registered via `onNamedIdentifier` */
  dispatchNamedIdentifierHandlers(id: ts.Identifier) {
    const handlers = this.namedIdentifierHandlersMap.get(id.text);
    if (handlers === undefined) return;

    for (const handler of handlers) {
      this.currentCode = handler.code;
      handler.handlerFunction(this, id);
    }
  }

  /**
   * Dispatch property access handlers registered via `onNamedPropertyAccess`
   */
  dispatchNamedPropertyAccessHandlers(prop: ts.PropertyAccessExpression) {
    const handlers = this.namedPropertyAccessHandlersMap.get(prop.name.text);
    if (handlers === undefined) return;

    for (const handler of handlers) {
      this.currentCode = handler.code;
      handler.handlerFunction(this, prop);
    }
  }

  /**
   * Dispatch string literal handlers registered via
   * `onStringLiteralElementAccess`.
   */
  dispatchStringLiteralElementAccessHandlers(elem: ts.ElementAccessExpression) {
    const ty = this.typeChecker.getTypeAtLocation(elem.argumentExpression);

    if (!ty.isStringLiteral()) return;

    const handlers = this.stringLiteralElementAccessHandlersMap.get(ty.value);
    if (handlers === undefined) return;

    for (const handler of handlers) {
      this.currentCode = handler.code;
      handler.handlerFunction(this, elem);
    }
  }

  /**
   * Walk `sourceFile`, invoking registered handlers with Checker as the first
   * argument and current node as the second argument. Return failures if there
   * are any.
   *
   * Callers of this function can request that the checker report violations
   * that have been exempted by an allowlist by setting the
   * `reportExemptedViolations` parameter to `true`. The function will return an
   * object that contains both the exempted and unexempted failures.
   */
  execute(sourceFile: ts.SourceFile): Failure[];
  execute(sourceFile: ts.SourceFile, reportExemptedViolations: false):
      Failure[];
  execute(sourceFile: ts.SourceFile, reportExemptedViolations: true):
      {failures: Failure[], exemptedFailures: Failure[]};
  execute(sourceFile: ts.SourceFile, reportExemptedViolations: boolean = false):
      Failure[]|{failures: Failure[], exemptedFailures: Failure[]} {
    const thisChecker = this;
    this.currentSourceFile = sourceFile;
    this.failures = [];
    this.exemptedFailures = [];
    run(sourceFile);
    return reportExemptedViolations ?
        {failures: this.failures, exemptedFailures: this.exemptedFailures} :
        this.failures;

    function run(node: ts.Node) {
      // Dispatch handlers registered via `on`
      thisChecker.dispatchNodeHandlers(node);

      // Dispatch handlers for named identifiers and properties
      if (ts.isIdentifier(node)) {
        thisChecker.dispatchNamedIdentifierHandlers(node);
      } else if (ts.isPropertyAccessExpression(node)) {
        thisChecker.dispatchNamedPropertyAccessHandlers(node);
      } else if (ts.isElementAccessExpression(node)) {
        thisChecker.dispatchStringLiteralElementAccessHandlers(node);
      }

      ts.forEachChild(node, run);
    }
  }

  resolveModuleName(moduleName: string, sourceFile: ts.SourceFile) {
    return ts.resolveModuleName(
        moduleName, sourceFile.fileName, this.options, this.host);
  }
}
