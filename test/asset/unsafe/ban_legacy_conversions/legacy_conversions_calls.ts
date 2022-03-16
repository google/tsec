import * as legacyConversion from 'safevalues/unsafe/legacy';
import {legacyConversionToHtml, legacyConversionToScript, legacyConversionToScriptUrl} from 'safevalues/unsafe/legacy';
import * as legacyConversion2 from 'safevalues/restricted/legacy';
import {legacyUnsafeHtml as legacyConversionToHtml2, legacyUnsafeResourceUrl as legacyConversionToScriptUrl2, legacyUnsafeScript as legacyConversionToScript2} from 'safevalues/restricted/legacy';

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

legacyConversion2.legacyUnsafeHtml(unsafeValue);
legacyConversion2.legacyUnsafeResourceUrl(unsafeValue);
legacyConversion2.legacyUnsafeScript(unsafeValue);

