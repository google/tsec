import * as uncheckedConversion from 'safevalues/unsafe/reviewed';
import {htmlFromStringKnownToSatisfyTypeContract, scriptFromStringKnownToSatisfyTypeContract, scriptUrlFromStringKnownToSatisfyTypeContract} from 'safevalues/unsafe/reviewed';
import * as uncheckedConversion2 from 'safevalues/restricted/reviewed';
import {htmlFromStringKnownToSatisfyTypeContract as htmlFromStringKnownToSatisfyTypeContract2, scriptFromStringKnownToSatisfyTypeContract as scriptFromStringKnownToSatisfyTypeContract2, scriptUrlFromStringKnownToSatisfyTypeContract as scriptUrlFromStringKnownToSatisfyTypeContract2} from 'safevalues/restricted/reviewed';

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

uncheckedConversion2.htmlFromStringKnownToSatisfyTypeContract(
    unsafeValue, 'for testing');
uncheckedConversion2.scriptUrlFromStringKnownToSatisfyTypeContract(
    unsafeValue, 'for testing');
uncheckedConversion2.scriptFromStringKnownToSatisfyTypeContract(
    unsafeValue, 'for testing');
