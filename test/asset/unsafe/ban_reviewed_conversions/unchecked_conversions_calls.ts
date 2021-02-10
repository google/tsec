import * as uncheckedConversion from 'safevalues/unsafe/reviewed';
import {htmlFromStringKnownToSatisfyTypeContract, scriptFromStringKnownToSatisfyTypeContract, scriptUrlFromStringKnownToSatisfyTypeContract} from 'safevalues/unsafe/reviewed';

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
