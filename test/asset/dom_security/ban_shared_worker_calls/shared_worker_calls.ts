// Calls that should trigger;

// Code below creates unused variables just to test that the conformance check
// triggers.
// tslint:disable:no-unused-variable

const NUM = 1;
// @expected-diagnostic TS21228: [tsetse] [ban-shared-worker-calls] Constructing
//     shared Web Workers can cause code to be loaded from an untrusted URL. See
//     go/ts-dom-sink#safe-worker for more details. Please use
//     go/tsconformance-yaqs for further questions. Suggested fix: - Replace
//     'new SharedWorker(`random-${NUM}-script.js`)' with:
//     createSharedWorker(trustedResourceUrl`${`random-${NUM}-script.js`}` /*
//     FIXME: Construct from literals instead of `${`random-${NUM}-script.js`}`,
//     see the corresponding entries in go/ts-dom-sink. */) - Add new import:
//     import {createSharedWorker} from 'safevalues/dom'; - Add new import:
//     import {trustedResourceUrl} from 'safevalues';
const worker = new SharedWorker(`random-${NUM}-script.js`);
// @expected-diagnostic TS21228: [tsetse] [ban-shared-worker-calls] Constructing
//     shared Web Workers can cause code to be loaded from an untrusted URL. See
//     go/ts-dom-sink#safe-worker for more details. Please use
//     go/tsconformance-yaqs for further questions. Suggested fix: - Replace
//     'new SharedWorker('random-script.js', {})' with:
//     createSharedWorker(trustedResourceUrl`random-script.js`, {}) - Add new
//     import: import {createSharedWorker} from 'safevalues/dom'; - Add new
//     import: import {trustedResourceUrl} from 'safevalues';
const workerWithOptions = new SharedWorker('random-script.js', {});

const MY_URL = 'random-script.js';
// @expected-diagnostic TS21228: [tsetse] [ban-shared-worker-calls] Constructing
//     shared Web Workers can cause code to be loaded from an untrusted URL. See
//     go/ts-dom-sink#safe-worker for more details. Please use
//     go/tsconformance-yaqs for further questions. Suggested fix: - Replace
//     'new SharedWorker(MY_URL)' with:
//     createSharedWorker(trustedResourceUrl`${MY_URL}` /* FIXME: Construct from
//     literals instead of `${MY_URL}`, see the corresponding entries in
//     go/ts-dom-sink. */) - Add new import: import {createSharedWorker} from
//     'safevalues/dom'; - Add new import: import {trustedResourceUrl} from
//     'safevalues';
const workerWithVariable = new SharedWorker(MY_URL);

// @expected-diagnostic TS21228: [tsetse] [ban-shared-worker-calls] Constructing
//     shared Web Workers can cause code to be loaded from an untrusted URL. See
//     go/ts-dom-sink#safe-worker for more details. Please use
//     go/tsconformance-yaqs for further questions. Suggested fix: - Replace
//     'new SharedWorker(/*dangerous!*/ 'random-script.js')' with:
//     createSharedWorker(trustedResourceUrl`random-script.js`) - Add new
//     import: import {createSharedWorker} from 'safevalues/dom'; - Add new
//     import: import {trustedResourceUrl} from 'safevalues';
const workerWithComment = new SharedWorker(/*dangerous!*/ 'random-script.js');

// accessing through globalThis doesn't work either
// @expected-diagnostic TS21228: [tsetse] [ban-shared-worker-calls] Constructing
//     shared Web Workers can cause code to be loaded from an untrusted URL. See
//     go/ts-dom-sink#safe-worker for more details. Please use
//     go/tsconformance-yaqs for further questions. Suggested fix: - Replace
//     'new window.SharedWorker('script.js')' with:
//     createSharedWorker(trustedResourceUrl`script.js`) - Add new import:
//     import {createSharedWorker} from 'safevalues/dom'; - Add new import:
//     import {trustedResourceUrl} from 'safevalues';
const windowWorker = new window.SharedWorker('script.js');
// @expected-diagnostic TS21228: [tsetse] [ban-shared-worker-calls] Constructing
//     shared Web Workers can cause code to be loaded from an untrusted URL. See
//     go/ts-dom-sink#safe-worker for more details. Please use
//     go/tsconformance-yaqs for further questions. Suggested fix: - Replace
//     'new window['SharedWorker']('script.js')' with:
//     createSharedWorker(trustedResourceUrl`script.js`) - Add new import:
//     import {createSharedWorker} from 'safevalues/dom'; - Add new import:
//     import {trustedResourceUrl} from 'safevalues';
const windowWorker2 = new window['SharedWorker']('script.js');

// @expected-diagnostic TS2348: Value of type '{ new (scriptURL: string | URL,
//     options?: string | WorkerOptions | undefined): SharedWorker; prototype:
//     SharedWorker; }' is not callable. Did you mean to include 'new'?
// @expected-diagnostic TS21228: [tsetse] [ban-shared-worker-calls] Constructing
//     shared Web Workers can cause code to be loaded from an untrusted URL. See
//     go/ts-dom-sink#safe-worker for more details. Please use
//     go/tsconformance-yaqs for further questions.
const callingWithoutNew = window['SharedWorker']('sss.js');

// Calls that shouldn't trigger;

/** Make sure we can refer to the type. */
export function doNothing(worker: SharedWorker): SharedWorker {
  const myWorker: SharedWorker = worker;
  return myWorker;
}
