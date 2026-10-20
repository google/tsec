// @expected-diagnostic TS21228: [tsetse] [ban-worker-importscripts] Do not call
//     importScripts in web workers, as this can lead to XSS. See
//     go/ts-dom-sink#trustedresourceurl for more details. Please use
//     go/tsconformance-yaqs for further questions. Suggested fix: - Replace
//     'importScripts('a.js')' with: workerGlobalScopeImportScripts(self,
//     trustedResourceUrl`a.js`) - Add new import: import
//     {workerGlobalScopeImportScripts} from 'safevalues/dom'; - Add new import:
//     import {trustedResourceUrl} from 'safevalues';
importScripts('a.js');
// @expected-diagnostic TS21228: [tsetse] [ban-worker-importscripts] Do not call
//     importScripts in web workers, as this can lead to XSS. See
//     go/ts-dom-sink#trustedresourceurl for more details. Please use
//     go/tsconformance-yaqs for further questions. Suggested fix: - Replace
//     'self.importScripts('a.js', 'b.js')' with:
//     workerGlobalScopeImportScripts(self, trustedResourceUrl`a.js`,
//     trustedResourceUrl`b.js`) - Add new import: import
//     {workerGlobalScopeImportScripts} from 'safevalues/dom'; - Add new import:
//     import {trustedResourceUrl} from 'safevalues';
self.importScripts('a.js', 'b.js');
