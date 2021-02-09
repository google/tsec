import * as legacyConversion from 'safevalues/unsafe/legacy';
import {legacyConversionToTrustedHTML, legacyConversionToTrustedScript, legacyConversionToTrustedScriptURL} from 'safevalues/unsafe/legacy';

declare var unsafeValue: string;

legacyConversionToTrustedHTML(unsafeValue);
legacyConversionToTrustedScriptURL(unsafeValue);
legacyConversionToTrustedScript(unsafeValue);

legacyConversion.legacyConversionToTrustedHTML(unsafeValue);
legacyConversion.legacyConversionToTrustedScriptURL(unsafeValue);
legacyConversion.legacyConversionToTrustedScript(unsafeValue);
