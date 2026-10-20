import * as reviewed from 'safevalues/restricted/reviewed';
import {
  htmlSafeByReview,
  resourceUrlSafeByReview,
  scriptSafeByReview,
} from 'safevalues/restricted/reviewed';

declare var unsafeValue: string;

// @expected-diagnostic TS21228: [tsetse] [ban-unchecked-conversions] Use of
//     unchecked conversions to safe values requires security reviews and
//     approval. Please read go/safehtml-unchecked (Guidelines for use of
//     Unchecked Conversions of Security-Contract Types), and go/ts_safe_coding
//     for TS-specific info. Please use go/tsconformance-yaqs if you have
//     further questions.
htmlSafeByReview(unsafeValue, {justification: 'for testing'});
// @expected-diagnostic TS21228: [tsetse] [ban-unchecked-conversions] Use of
//     unchecked conversions to safe values requires security reviews and
//     approval. Please read go/safehtml-unchecked (Guidelines for use of
//     Unchecked Conversions of Security-Contract Types), and go/ts_safe_coding
//     for TS-specific info. Please use go/tsconformance-yaqs if you have
//     further questions.
resourceUrlSafeByReview(unsafeValue, {justification: 'for testing'});
// @expected-diagnostic TS21228: [tsetse] [ban-unchecked-conversions] Use of
//     unchecked conversions to safe values requires security reviews and
//     approval. Please read go/safehtml-unchecked (Guidelines for use of
//     Unchecked Conversions of Security-Contract Types), and go/ts_safe_coding
//     for TS-specific info. Please use go/tsconformance-yaqs if you have
//     further questions.
scriptSafeByReview(unsafeValue, {justification: 'for testing'});

// @expected-diagnostic TS21228: [tsetse] [ban-unchecked-conversions] Use of
//     unchecked conversions to safe values requires security reviews and
//     approval. Please read go/safehtml-unchecked (Guidelines for use of
//     Unchecked Conversions of Security-Contract Types), and go/ts_safe_coding
//     for TS-specific info. Please use go/tsconformance-yaqs if you have
//     further questions.
reviewed.htmlSafeByReview(unsafeValue, {justification: 'for testing'});
// @expected-diagnostic TS21228: [tsetse] [ban-unchecked-conversions] Use of
//     unchecked conversions to safe values requires security reviews and
//     approval. Please read go/safehtml-unchecked (Guidelines for use of
//     Unchecked Conversions of Security-Contract Types), and go/ts_safe_coding
//     for TS-specific info. Please use go/tsconformance-yaqs if you have
//     further questions.
reviewed.resourceUrlSafeByReview(unsafeValue, {justification: 'for testing'});
// @expected-diagnostic TS21228: [tsetse] [ban-unchecked-conversions] Use of
//     unchecked conversions to safe values requires security reviews and
//     approval. Please read go/safehtml-unchecked (Guidelines for use of
//     Unchecked Conversions of Security-Contract Types), and go/ts_safe_coding
//     for TS-specific info. Please use go/tsconformance-yaqs if you have
//     further questions.
reviewed.scriptSafeByReview(unsafeValue, {justification: 'for testing'});
