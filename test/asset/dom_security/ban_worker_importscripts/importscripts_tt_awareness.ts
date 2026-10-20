const trustedScriptUrl = 'a.js' as unknown as TrustedScriptURL;
// @expected-diagnostic TS21228: [tsetse] [ban-worker-importscripts] Do not call
//     importScripts in web workers, as this can lead to XSS. See
//     go/ts-dom-sink#trustedresourceurl for more details. Please use
//     go/tsconformance-yaqs for further questions. Suggested fix: - Replace
//     'importScripts(trustedScriptUrl as unknown as string)' with:
//     workerGlobalScopeImportScripts(self,
//     trustedResourceUrl`${trustedScriptUrl as unknown as string}` /* FIXME:
//     Construct from literals instead of `${trustedScriptUrl as unknown as
//     string}`, see the corresponding entries in go/ts-dom-sink. */) - Add new
//     import: import {workerGlobalScopeImportScripts} from 'safevalues/dom'; -
//     Add new import: import {trustedResourceUrl} from 'safevalues';
importScripts(trustedScriptUrl as unknown as string);
