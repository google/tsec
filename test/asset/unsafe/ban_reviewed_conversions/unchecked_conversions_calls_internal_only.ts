import * as uncheckedConversion from 'safevalues/unsafe/reviewed';

declare var unsafeValue: string;

safeStyleFromStringKnownToSatisfyTypeContract(unsafeValue, 'for testing');
safeStyleSheetFromStringKnownToSatisfyTypeContract(unsafeValue, 'for testing');
safeUrlFromStringKnownToSatisfyTypeContract(unsafeValue, 'for testing');

uncheckedConversion.safeStyleFromStringKnownToSatisfyTypeContract(
    unsafeValue, 'for testing');
uncheckedConversion.safeStyleSheetFromStringKnownToSatisfyTypeContract(
    unsafeValue, 'for testing');
uncheckedConversion.safeUrlFromStringKnownToSatisfyTypeContract(
    unsafeValue, 'for testing');
