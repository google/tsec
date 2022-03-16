import * as uncheckedConversion from 'safevalues/unsafe/reviewed';
import {htmlFromStringKnownToSatisfyTypeContract, scriptFromStringKnownToSatisfyTypeContract, scriptUrlFromStringKnownToSatisfyTypeContract} from 'safevalues/unsafe/reviewed';
import * as uncheckedConversion2 from 'safevalues/restricted/reviewed';
import {htmlSafeByReview as htmlFromStringKnownToSatisfyTypeContract2, resourceUrlSafeByReview as scriptUrlFromStringKnownToSatisfyTypeContract2, scriptSafeByReview as scriptFromStringKnownToSatisfyTypeContract2} from 'safevalues/restricted/reviewed';

declare var unsafeValue: string;

htmlFromStringKnownToSatisfyTypeContract(unsafeValue, 'for testing');
scriptUrlFromStringKnownToSatisfyTypeContract(
    unsafeValue, 'for testing');
scriptFromStringKnownToSatisfyTypeContract(unsafeValue, 'for testing');

uncheckedConversion.htmlFromStringKnownToSatisfyTypeContract(
    unsafeValue, 'for testing');
uncheckedConversion.scriptUrlFromStringKnownToSatisfyTypeContract(
    unsafeValue, 'for testing');
uncheckedConversion.scriptFromStringKnownToSatisfyTypeContract(
    unsafeValue, 'for testing');

htmlFromStringKnownToSatisfyTypeContract2(unsafeValue, 'for testing');
scriptUrlFromStringKnownToSatisfyTypeContract2(
    unsafeValue, 'for testing');
scriptFromStringKnownToSatisfyTypeContract2(unsafeValue, 'for testing');

uncheckedConversion2.htmlSafeByReview(unsafeValue, 'for testing');
uncheckedConversion2.resourceUrlSafeByReview(unsafeValue, 'for testing');
uncheckedConversion2.scriptSafeByReview(unsafeValue, 'for testing');
