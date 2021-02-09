import * as uncheckedConversion from 'safevalues/unsafe/reviewed';
import {safeHtmlFromStringKnownToSatisfyTypeContract, trustedScriptFromStringKnownToSatisfyTypeContract, trustedScriptURLFromStringKnownToSatisfyTypeContract} from 'safevalues/unsafe/reviewed';

declare var unsafeValue: string;

safeHtmlFromStringKnownToSatisfyTypeContract(unsafeValue, 'for testing');
trustedScriptURLFromStringKnownToSatisfyTypeContract(
    unsafeValue, 'for testing');
trustedScriptFromStringKnownToSatisfyTypeContract(unsafeValue, 'for testing');

uncheckedConversion.safeHtmlFromStringKnownToSatisfyTypeContract(
    unsafeValue, 'for testing');
uncheckedConversion.trustedScriptURLFromStringKnownToSatisfyTypeContract(
    unsafeValue, 'for testing');
uncheckedConversion.trustedScriptFromStringKnownToSatisfyTypeContract(
    unsafeValue, 'for testing');
