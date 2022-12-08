import * as reviewed from 'safevalues/restricted/reviewed';
import {htmlSafeByReview, resourceUrlSafeByReview, scriptSafeByReview} from 'safevalues/restricted/reviewed';

declare var unsafeValue: string;

htmlSafeByReview(unsafeValue, 'for testing');
resourceUrlSafeByReview(unsafeValue, 'for testing');
scriptSafeByReview(unsafeValue, 'for testing');

reviewed.htmlSafeByReview(unsafeValue, 'for testing');
reviewed.resourceUrlSafeByReview(unsafeValue, 'for testing');
reviewed.scriptSafeByReview(unsafeValue, 'for testing');
