import * as legacyConversion from 'safevalues/unsafe/legacy';
import {legacyConversionToHtml, legacyConversionToScript, legacyConversionToScriptUrl} from 'safevalues/unsafe/legacy';

declare var unsafeValue: string;

legacyConversionToHtml(unsafeValue);
legacyConversionToScriptUrl(unsafeValue);
legacyConversionToScript(unsafeValue);

legacyConversion.legacyConversionToHtml(unsafeValue);
legacyConversion.legacyConversionToScriptUrl(unsafeValue);
legacyConversion.legacyConversionToScript(unsafeValue);
