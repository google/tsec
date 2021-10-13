import * as legacyConversion from 'safevalues/unsafe/legacy';
import {legacyConversionToHtml, legacyConversionToScript, legacyConversionToScriptUrl} from 'safevalues/unsafe/legacy';
import * as legacyConversion2 from 'safevalues/restricted/legacy';
import {legacyConversionToHtml as legacyConversionToHtml2, legacyConversionToScript as legacyConversionToScript2, legacyConversionToScriptUrl as legacyConversionToScriptUrl2} from 'safevalues/restricted/legacy';

declare var unsafeValue: string;

legacyConversionToHtml(unsafeValue);
legacyConversionToScriptUrl(unsafeValue);
legacyConversionToScript(unsafeValue);

legacyConversion.legacyConversionToHtml(unsafeValue);
legacyConversion.legacyConversionToScriptUrl(unsafeValue);
legacyConversion.legacyConversionToScript(unsafeValue);

legacyConversionToHtml2(unsafeValue);
legacyConversionToScriptUrl2(unsafeValue);
legacyConversionToScript2(unsafeValue);

legacyConversion2.legacyConversionToHtml(unsafeValue);
legacyConversion2.legacyConversionToScriptUrl(unsafeValue);
legacyConversion2.legacyConversionToScript(unsafeValue);

