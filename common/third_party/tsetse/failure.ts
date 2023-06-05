import * as ts from 'typescript';

/**
 * A Tsetse check Failure is almost identical to a Diagnostic from TypeScript
 * except that:
 * (1) The error code is defined by each individual Tsetse rule.
 * (2) The optional `source` property is set to `Tsetse` so the host (VS Code
 * for instance) would use that to indicate where the error comes from.
 * (3) There's an optional suggestedFixes field.
 */
export class Failure {
  constructor(
      private readonly sourceFile: ts.SourceFile,
      private readonly start: number, private readonly end: number,
      private readonly failureText: string, private readonly code: number,
      /**
       * The origin of the failure, e.g., the name of the rule reporting the
       * failure. Can be empty.
       */
      private readonly failureSource: string|undefined,
      private readonly suggestedFixes: Fix[] = [],
      private readonly relatedInformation?: ts.DiagnosticRelatedInformation[]) {
  }

  /**
   * This returns a structure compatible with ts.Diagnostic, but with added
   * fields, for convenience and to support suggested fixes.
   */
  toDiagnostic(): DiagnosticWithFixes {
    return {
      file: this.sourceFile,
      start: this.start,
      end: this.end,  // Not in ts.Diagnostic, but always useful for
                      // start-end-using systems.
      length: this.end - this.start,
      // Emebed `failureSource` into the error message so that we can show
      // people which check they are violating. This makes it easier for
      // developers to configure exemptions.
      messageText: this.failureSource ?
          `[${this.failureSource}] ${this.failureText}` :
          this.failureText,
      category: ts.DiagnosticCategory.Error,
      code: this.code,
      // Other tools like TSLint can use this field to decide the subcategory of
      // the diagnostic.
      source: this.failureSource,
      fixes: this.suggestedFixes,
      relatedInformation: this.relatedInformation,
    };
  }

  /**
   * Same as toDiagnostic, but include the fix in the message, so that systems
   * that don't support displaying suggested fixes can still surface that
   * information. This assumes the diagnostic message is going to be presented
   * within the context of the problematic code.
   */
  toDiagnosticWithStringifiedFixes(): DiagnosticWithFixes {
    const diagnostic = this.toDiagnostic();
    if (this.suggestedFixes.length) {
      // Add a space between the violation text and fix message.
      diagnostic.messageText += ' ' + this.mapFixesToReadableString();
    }
    return diagnostic;
  }

  toString(): string {
    return `{ sourceFile:${
        this.sourceFile ? this.sourceFile.fileName : 'unknown'}, start:${
        this.start}, end:${this.end}, source:${this.failureSource}, fixes:${
        JSON.stringify(this.suggestedFixes.map(fix => fixToString(fix)))} }`;
  }

  /***
   * Stringifies an array of `suggestedFixes` for this failure. This is just a
   * heuristic and should be used in systems which do not support fixers
   * integration (e.g. CLI tools).
   */
  mapFixesToReadableString(): string {
    const stringifiedFixes =
        this.suggestedFixes.map(fix => this.fixToReadableString(fix))
            .join('\nOR\n');

    if (!stringifiedFixes) return '';
    else if (this.suggestedFixes.length === 1) {
      return 'Suggested fix:\n' + stringifiedFixes;
    } else {
      return 'Suggested fixes:\n' + stringifiedFixes;
    }
  }

  /**
   * Stringifies a `Fix`, in a way that makes sense when presented alongside the
   * finding. This is a heuristic, obviously.
   */
  fixToReadableString(f: Fix) {
    let fixText = '';

    for (const c of f.changes) {
      // Remove leading/trailing whitespace from the stringified suggestions:
      // since we add line breaks after each line of stringified suggestion, and
      // since users will manually apply the fix, there is no need to show
      // trailing whitespace. This is however just for stringification of the
      // fixes: the suggested fix itself still keeps trailing whitespace.
      const printableReplacement = c.replacement.trim();

      // Insertion.
      if (c.start === c.end) {
        // Try to see if that's an import.
        if (c.replacement.indexOf('import') !== -1) {
          fixText += `- Add new import: ${printableReplacement}\n`;
        } else {
          // Insertion that's not a full import. This should rarely happen in
          // our context, and we don't have a great message for these.
          // For instance, this could be the addition of a new symbol in an
          // existing import (`import {foo}` becoming `import {foo, bar}`).
          fixText += `- Insert ${this.readableRange(c.start, c.end)}: ${
              printableReplacement}\n`;
        }
      } else if (c.start === this.start && c.end === this.end) {
        // We assume the replacement is the main part of the fix, so put that
        // individual change first in `fixText`.
        if (printableReplacement === '') {
          fixText = `- Delete the full match\n` + fixText;
        } else {
          fixText = `- Replace the full match with: ${printableReplacement}\n` +
              fixText;
        }
      } else {
        if (printableReplacement === '') {
          fixText =
              `- Delete ${this.readableRange(c.start, c.end)}\n` + fixText;
        } else {
          fixText = `- Replace ${this.readableRange(c.start, c.end)} with: ` +
              `${printableReplacement}\n${fixText}`;
        }
      }
    }

    return fixText.trim();
  }

  /**
   * Turns the range to a human readable format to be used by fixers.
   *
   * If the length of the range is non zero it returns the source file text
   * representing the range. Otherwise returns the stringified representation of
   * the source file position.
   */
  readableRange(from: number, to: number) {
    const lcf = this.sourceFile.getLineAndCharacterOfPosition(from);
    const lct = this.sourceFile.getLineAndCharacterOfPosition(to);
    if (lcf.line === lct.line && lcf.character === lct.character) {
      return `at line ${lcf.line + 1}, char ${lcf.character + 1}`;
    } else {
      return `'${
          this.sourceFile.text.substring(from, to).replace(/\n/g, '\\n')}'`;
    }
  }
}

/**
 * A `Fix` is a potential repair to the associated `Failure`.
 */
export interface Fix {
  /**
   * The individual text replacements composing that fix.
   */
  changes: IndividualChange[];
}

/** Creates a fix that replaces the given node with the new text. */
export function replaceNode(node: ts.Node, replacement: string): Fix {
  return {
    changes: [{
      sourceFile: node.getSourceFile(),
      start: node.getStart(),
      end: node.getEnd(),
      replacement,
    }],
  };
}

/** Creates a fix that inserts new text in front of the given node. */
export function insertBeforeNode(node: ts.Node, insertion: string): Fix {
  return {
    changes: [{
      sourceFile: node.getSourceFile(),
      start: node.getStart(),
      end: node.getStart(),
      replacement: insertion,
    }],
  };
}

/**
 * An individual text replacement/insertion in a source file. Used as part of a
 * `Fix`.
 */
export interface IndividualChange {
  sourceFile: ts.SourceFile;
  start: number;
  end: number;
  replacement: string;
}

/**
 * A ts.Diagnostic that might include fixes, and with an added `end`
 * field for convenience.
 */
export interface DiagnosticWithFixes extends ts.Diagnostic {
  end: number;
  /**
   * An array of fixes for a given diagnostic.
   *
   * Each element (fix) of the array provides a different alternative on how to
   * fix the diagnostic. Every fix is self contained and indepedent to other
   * fixes in the array.
   *
   * These fixes can be integrated into IDEs and presented to the users who can
   * choose the most suitable fix.
   */
  fixes: Fix[];
}

/**
 * Stringifies a `Fix`, replacing the `ts.SourceFile` with the matching
 * filename.
 */
export function fixToString(f?: Fix) {
  if (!f) return 'undefined';
  return '{' + JSON.stringify(f.changes.map(ic => {
    return {
      start: ic.start,
      end: ic.end,
      replacement: ic.replacement,
      fileName: ic.sourceFile.fileName
    };
  })) +
      '}';
}
