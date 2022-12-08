import * as legacy from 'safevalues/restricted/legacy';
import {legacyUnsafeHtml, legacyUnsafeResourceUrl, legacyUnsafeScript} from 'safevalues/restricted/legacy';

declare var unsafeValue: string;

legacyUnsafeHtml(unsafeValue);
legacyUnsafeResourceUrl(unsafeValue);
legacyUnsafeScript(unsafeValue);

legacy.legacyUnsafeHtml(unsafeValue);
legacy.legacyUnsafeResourceUrl(unsafeValue);
legacy.legacyUnsafeScript(unsafeValue);