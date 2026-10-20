declare const container: ServiceWorkerContainer;

// direct calls
// @expected-diagnostic TS21228: [tsetse] [ban-serviceworkercontainer-register]
//     Do not use ServiceWorkerContainer#register, as this can lead to XSS. See
//     go/ts-dom-sink#trustedresourceurl for details. Please use
//     go/tsconformance-yaqs if you have further questions. Suggested fix: -
//     Replace 'container.register('https://example.com/script.js')' with:
//     serviceWorkerContainerRegister(container,
//     trustedResourceUrl`https://example.com/script.js`) - Add new import:
//     import {serviceWorkerContainerRegister} from 'safevalues/dom'; - Add new
//     import: import {trustedResourceUrl} from 'safevalues';
container.register('https://example.com/script.js');

// indirect use
// @expected-diagnostic TS21228: [tsetse] [ban-serviceworkercontainer-register]
//     Do not use ServiceWorkerContainer#register, as this can lead to XSS. See
//     go/ts-dom-sink#trustedresourceurl for details. Please use
//     go/tsconformance-yaqs if you have further questions.
const reg = container.register.bind(container);
reg('https://evil.com/script.js');

// other tests
const KEY = 'register';
declare const url: string;
// @expected-diagnostic TS21228: [tsetse] [ban-serviceworkercontainer-register]
//     Do not use ServiceWorkerContainer#register, as this can lead to XSS. See
//     go/ts-dom-sink#trustedresourceurl for details. Please use
//     go/tsconformance-yaqs if you have further questions. Suggested fix: -
//     Replace 'container[KEY](url)' with:
//     serviceWorkerContainerRegister(container, trustedResourceUrl`${url}` /*
//     FIXME: Construct from literals instead of `${url}`, see the corresponding
//     entries in go/ts-dom-sink. */) - Add new import: import
//     {serviceWorkerContainerRegister} from 'safevalues/dom'; - Add new import:
//     import {trustedResourceUrl} from 'safevalues';
container[KEY](url);
