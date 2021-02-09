import * as legacyConversion from 'safevalues/unsafe/legacy';
import {legacyConversionToSafeStyle, legacyConversionToSafeStyleSheet, legacyConversionToSafeUrl} from 'safevalues/unsafe/legacy';

declare var unsafeValue: string;

legacyConversionToSafeUrl(unsafeValue);
legacyConversionToSafeStyle(unsafeValue);
legacyConversionToSafeStyleSheet(unsafeValue);

legacyConversion.legacyConversionToSafeStyle(unsafeValue);
legacyConversion.legacyConversionToSafeStyleSheet(unsafeValue);
legacyConversion.legacyConversionToSafeUrl(unsafeValue);
