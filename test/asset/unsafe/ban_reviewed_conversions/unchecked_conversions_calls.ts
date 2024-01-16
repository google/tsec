import * as reviewed from 'safevalues/restricted/reviewed';
import {
  htmlSafeByReview,
  resourceUrlSafeByReview,
  scriptSafeByReview,
} from 'safevalues/restricted/reviewed';

declare var unsafeValue: string;

htmlSafeByReview(unsafeValue, {justification: 'for testing'});
resourceUrlSafeByReview(unsafeValue, {justification: 'for testing'});
scriptSafeByReview(unsafeValue, {justification: 'for testing'});

reviewed.htmlSafeByReview(unsafeValue, {justification: 'for testing'});
reviewed.resourceUrlSafeByReview(unsafeValue, {justification: 'for testing'});
reviewed.scriptSafeByReview(unsafeValue, {justification: 'for testing'});
