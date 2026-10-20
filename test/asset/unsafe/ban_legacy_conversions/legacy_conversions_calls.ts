import * as legacy from 'safevalues/restricted/legacy';
import {
  legacyUnsafeHtml,
  legacyUnsafeResourceUrl,
  legacyUnsafeScript,
} from 'safevalues/restricted/legacy';

declare var unsafeValue: string;

// @expected-diagnostic TS21228: [tsetse] [ban-legacy-conversions] Use of legacy
//     conversions to safe values requires security reviews and approval. Please
//     read go/safehtml-unchecked (Guidelines for use of Unchecked Conversions
//     of Security-Contract Types), and go/ts-dom-sink#ban-legacyconversions for
//     TS-specific info. Please use go/tsconformance-yaqs if you have further
//     questions.
legacyUnsafeHtml(unsafeValue);
// @expected-diagnostic TS21228: [tsetse] [ban-legacy-conversions] Use of legacy
//     conversions to safe values requires security reviews and approval. Please
//     read go/safehtml-unchecked (Guidelines for use of Unchecked Conversions
//     of Security-Contract Types), and go/ts-dom-sink#ban-legacyconversions for
//     TS-specific info. Please use go/tsconformance-yaqs if you have further
//     questions.
legacyUnsafeResourceUrl(unsafeValue);
// @expected-diagnostic TS21228: [tsetse] [ban-legacy-conversions] Use of legacy
//     conversions to safe values requires security reviews and approval. Please
//     read go/safehtml-unchecked (Guidelines for use of Unchecked Conversions
//     of Security-Contract Types), and go/ts-dom-sink#ban-legacyconversions for
//     TS-specific info. Please use go/tsconformance-yaqs if you have further
//     questions.
legacyUnsafeScript(unsafeValue);
// @expected-diagnostic TS21228: [tsetse] [ban-legacy-conversions] Use of legacy
//     conversions to safe values requires security reviews and approval. Please
//     read go/safehtml-unchecked (Guidelines for use of Unchecked Conversions
//     of Security-Contract Types), and go/ts-dom-sink#ban-legacyconversions for
//     TS-specific info. Please use go/tsconformance-yaqs if you have further
//     questions.

// @expected-diagnostic TS21228: [tsetse] [ban-legacy-conversions] Use of legacy
//     conversions to safe values requires security reviews and approval. Please
//     read go/safehtml-unchecked (Guidelines for use of Unchecked Conversions
//     of Security-Contract Types), and go/ts-dom-sink#ban-legacyconversions for
//     TS-specific info. Please use go/tsconformance-yaqs if you have further
//     questions.
legacy.legacyUnsafeHtml(unsafeValue);
// @expected-diagnostic TS21228: [tsetse] [ban-legacy-conversions] Use of legacy
//     conversions to safe values requires security reviews and approval. Please
//     read go/safehtml-unchecked (Guidelines for use of Unchecked Conversions
//     of Security-Contract Types), and go/ts-dom-sink#ban-legacyconversions for
//     TS-specific info. Please use go/tsconformance-yaqs if you have further
//     questions.
legacy.legacyUnsafeResourceUrl(unsafeValue);
// @expected-diagnostic TS21228: [tsetse] [ban-legacy-conversions] Use of legacy
//     conversions to safe values requires security reviews and approval. Please
//     read go/safehtml-unchecked (Guidelines for use of Unchecked Conversions
//     of Security-Contract Types), and go/ts-dom-sink#ban-legacyconversions for
//     TS-specific info. Please use go/tsconformance-yaqs if you have further
//     questions.
legacy.legacyUnsafeScript(unsafeValue);
// @expected-diagnostic TS21228: [tsetse] [ban-legacy-conversions] Use of legacy
//     conversions to safe values requires security reviews and approval. Please
//     read go/safehtml-unchecked (Guidelines for use of Unchecked Conversions
//     of Security-Contract Types), and go/ts-dom-sink#ban-legacyconversions for
//     TS-specific info. Please use go/tsconformance-yaqs if you have further
//     questions.
