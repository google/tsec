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
import {getLineColumn} from './util/ast_tools';
import {Confidence} from './util/confidence';

type SilenceReason =
  | 'EXEMPTED' // For Failures that have been exempted through an allowlist
  | 'LESS_CONFIDENT_DUPLICATE' // For Failures that have same source location but one is has a lower confidence
  | 'DUPLICATE_MESSAGE' // For Failures that have same source location and message
  | 'CONFIDENCE_TOO_LOW'; // For Failures that have a confidence under the configured Checker's threshold

interface SilenceInformation {
  reason: SilenceReason;
}

/**
 * A Tsetse check Failure is almost identical to a Diagnostic from TypeScript
 * except that:
 * (1) The error code is defined by each individual Tsetse rule.
 * (2) The optional `source` property is set to `Tsetse` so the host (VS Code
 * for instance) would use that to indicate where the error comes from.
 * (3) There's an optional suggestedFixes field.
 * (4) There's an optional relatedInformation field.
 * (5) There's an optional silenceInformation field.
 * (6) There's an optional confidence field.
 */
export class Failure {
  private readonly suggestedFixes: Fix[];
  private readonly relatedInformation?: ts.DiagnosticRelatedInformation[];
  // `undefined` if the failure is not silenced. If the failure is silenced, it
  // will have at least one silence reason.
  private silenceInformation: SilenceInformation[] | undefined;
  private readonly confidence: Confidence;
  constructor(
    private readonly sourceFile: ts.SourceFile,
    private readonly start: number,
    private readonly end: number,
    private readonly failureText: string,
    private readonly code: number,
    /**
     * The origin of the failure, e.g., the name of the rule reporting the
     * failure. Can be empty.
     */
    private readonly failureSource: string | undefined,
    options: {
      suggestedFixes?: Fix[];
      relatedInformation?: ts.DiagnosticRelatedInformation[];
      silenceInformation?: SilenceInformation[] | undefined;
      confidence?: Confidence;
    } = {},
  ) {
    this.suggestedFixes = options?.suggestedFixes ?? [];
    this.relatedInformation = options?.relatedInformation;
    if (options?.relatedInformation) {
      this.relatedInformation = options.relatedInformation;
    }
    this.silenceInformation = options?.silenceInformation;
    this.confidence = options?.confidence || Confidence.NA_CONFIDENCE;
  }

  /**
   * This returns a structure compatible with ts.Diagnostic, but with added
   * fields, for convenience and to support suggested fixes.
   */
  toDiagnostic(): DiagnosticWithFixes {
    return {
      file: this.sourceFile,
      start: this.start,
      end: this.end, // Not in ts.Diagnostic, but always useful for
      // start-end-using systems.
      length: this.end - this.start,
      // Emebed `failureSource` into the error message so that we can show
      // people which check they are violating. This makes it easier for
      // developers to configure exemptions.
      messageText: this.failureSource
        ? `[${this.failureSource}] ${this.failureText}`
        : this.failureText,
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

  toKey(): string {
    return `${this.sourceFile ? this.sourceFile.fileName : 'unknown'}:${this.start}:${this.end}:${this.failureSource}:${this.failureText}`;
  }

  addSilenceInformation(info: SilenceInformation): void {
    if (this.silenceInformation === undefined) {
      this.silenceInformation = [info];
      return;
    }
    this.silenceInformation.push(info);
  }

  isSilenced(): boolean {
    return this.silenceInformation !== undefined;
  }

  getSilenceReasons(): SilenceInformation[] | undefined {
    return this.silenceInformation;
  }

  /**
   * Returns a key that represents the source location for this failure.
   */
  getLocationKey(): string {
    return `${this.sourceFile.fileName}:${this.start}:${this.end}`;
  }

  /**
   * Returns a human readable string with the location of this failure.
   */
  getReadableLocation(): string {
    const {line, column} = getLineColumn(this.start, this.sourceFile);
    return `${this.sourceFile.fileName}:${line}:${column}`;
  }

  getConfidence(): Confidence {
    return this.confidence;
  }

  getFailureSource(): string | undefined {
    return this.failureSource;
  }

  /***
   * Stringifies an array of `suggestedFixes` for this failure. This is just a
   * heuristic and should be used in systems which do not support fixers
   * integration (e.g. CLI tools).
   */
  mapFixesToReadableString(): string {
    const stringifiedFixes = this.suggestedFixes
      .map((fix) => this.fixToReadableString(fix))
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
          fixText += `- Insert ${this.readableRange(c.start, c.end)}: ${printableReplacement}\n`;
        }
      } else if (c.start === this.start && c.end === this.end) {
        // We assume the replacement is the main part of the fix, so put that
        // individual change first in `fixText`.
        if (printableReplacement === '') {
          fixText = `- Delete the full match\n` + fixText;
        } else {
          fixText =
            `- Replace the full match with: ${printableReplacement}\n` +
            fixText;
        }
      } else {
        if (printableReplacement === '') {
          fixText =
            `- Delete ${this.readableRange(c.start, c.end)}\n` + fixText;
        } else {
          fixText =
            `- Replace ${this.readableRange(c.start, c.end)} with: ` +
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
      return `'${this.sourceFile.text
        .substring(from, to)
        .replace(/\n/g, '\\n')}'`;
    }
  }

  // TODO: b/422727866 - This can be better implemented if exempted is a
  // separate field from the silenceInformation array.
  /**
   * Returns true if the failure is silenced only because it is exempted, but
   * not because it's a duplicate or is too low confidence.
   */
  isSilencedJustBecauseExempted(): boolean {
    return (
      this.silenceInformation !== undefined &&
      this.silenceInformation.every((s) => s.reason === 'EXEMPTED')
    );
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
    changes: [
      {
        sourceFile: node.getSourceFile(),
        start: node.getStart(),
        end: node.getEnd(),
        replacement,
      },
    ],
  };
}

/** Creates a fix that inserts new text in front of the given node. */
export function insertBeforeNode(node: ts.Node, insertion: string): Fix {
  return {
    changes: [
      {
        sourceFile: node.getSourceFile(),
        start: node.getStart(),
        end: node.getStart(),
        replacement: insertion,
      },
    ],
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
  return (
    '{' +
    JSON.stringify(
      f.changes.map((ic) => {
        return {
          start: ic.start,
          end: ic.end,
          replacement: ic.replacement,
          fileName: ic.sourceFile.fileName,
        };
      }),
    ) +
    '}'
  );
}

/**
 * Find Failures that are duplicates for the same location and mark the less
 * confident ones as silenced.
 * Failures are grouped by location, represented by their file name, start and
 * end offsets.
 * For each location, if several failures are present, the following logic is
 * applied:
 * - Failures with no confidence information take precedence.
 * - Failures are sorted by confidence level, from highest to lowest. The ones
 *   with the highest confidence level are kept.
 */
export function silenceLessConfidentDuplicates(failures: Failure[]): Failure[] {
  const newlySilencedFailures: Failure[] = [];
  const byLocation = new Map<
    string,
    {confidence: Confidence; failures: Failure[]}
  >();
  // First pass to get the most accurate confidence for each location.
  for (const f of failures) {
    const locationKey = f.getLocationKey();

    const atLocation = byLocation.get(locationKey);
    const confidence = f.getConfidence();
    if (atLocation === undefined) {
      byLocation.set(locationKey, {confidence, failures: [f]});
    } else {
      if (confidence > atLocation.confidence) {
        // Mark all previous less confident failures at this location as
        // silenced.
        for (const f of atLocation.failures) {
          f.addSilenceInformation({reason: 'LESS_CONFIDENT_DUPLICATE'});
          newlySilencedFailures.push(f);
        }
        byLocation.set(locationKey, {confidence, failures: [f]});
      } else if (confidence === atLocation.confidence) {
        atLocation.failures.push(f);
      } else {
        f.addSilenceInformation({reason: 'LESS_CONFIDENT_DUPLICATE'});
        newlySilencedFailures.push(f);
      }
    }
  }
  const allFailures: Failure[] = [];
  for (const failureAtLocation of byLocation.values()) {
    failureAtLocation.failures.forEach((f) => {
      allFailures.push(f);
    });
  }
  allFailures.push(...newlySilencedFailures);
  return allFailures;
}

/**
 * Finds Failures that have the same message and marks them as silenced.
 */
export function silenceDuplicateFailureMessages(
  failures: Failure[],
): Failure[] {
  const seen = new Set<string>();
  for (const f of failures) {
    const failureKey = f.toKey();
    if (!seen.has(failureKey)) {
      seen.add(failureKey);
    } else {
      f.addSilenceInformation({reason: 'DUPLICATE_MESSAGE'});
    }
  }
  return failures;
}
