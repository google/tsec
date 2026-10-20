// Calls that should trigger;

// Code below creates unused variables just to test that the conformance check
// triggers.
// tslint:disable:no-unused-variable

const NUM = 1;
// @expected-diagnostic TS21228: [tsetse] [ban-worker-calls] Constructing Web
//     Workers can cause code to be loaded from an untrusted URL. See
//     go/xss-dom-sinks#ban-worker-calls for more details. Please use
//     go/tsconformance-yaqs for further questions. Suggested fix: - Replace
//     'new Worker(`random-${NUM}-script.js`)' with:
//     createWorker(trustedResourceUrl`${`random-${NUM}-script.js`}` /* FIXME:
//     Construct from literals instead of `${`random-${NUM}-script.js`}`, see
//     the corresponding entries in go/ts-dom-sink. */) - Add new import: import
//     {createWorker} from 'safevalues/dom'; - Add new import: import
//     {trustedResourceUrl} from 'safevalues';
const worker = new Worker(`random-${NUM}-script.js`);
// @expected-diagnostic TS21228: [tsetse] [ban-worker-calls] Constructing Web
//     Workers can cause code to be loaded from an untrusted URL. See
//     go/xss-dom-sinks#ban-worker-calls for more details. Please use
//     go/tsconformance-yaqs for further questions. Suggested fix: - Replace
//     'new Worker('random-script.js', {})' with:
//     createWorker(trustedResourceUrl`random-script.js`, {}) - Add new import:
//     import {createWorker} from 'safevalues/dom'; - Add new import: import
//     {trustedResourceUrl} from 'safevalues';
const workerWithOptions = new Worker('random-script.js', {});

const MY_URL = 'random-script.js';
// @expected-diagnostic TS21228: [tsetse] [ban-worker-calls] Constructing Web
//     Workers can cause code to be loaded from an untrusted URL. See
//     go/xss-dom-sinks#ban-worker-calls for more details. Please use
//     go/tsconformance-yaqs for further questions. Suggested fix: - Replace
//     'new Worker(MY_URL)' with: createWorker(trustedResourceUrl`${MY_URL}` /*
//     FIXME: Construct from literals instead of `${MY_URL}`, see the
//     corresponding entries in go/ts-dom-sink. */) - Add new import: import
//     {createWorker} from 'safevalues/dom'; - Add new import: import
//     {trustedResourceUrl} from 'safevalues';
const workerWithVariable = new Worker(MY_URL);

// @expected-diagnostic TS21228: [tsetse] [ban-worker-calls] Constructing Web
//     Workers can cause code to be loaded from an untrusted URL. See
//     go/xss-dom-sinks#ban-worker-calls for more details. Please use
//     go/tsconformance-yaqs for further questions. Suggested fix: - Replace
//     'new Worker(/*dangerous!*/ 'random-script.js')' with:
//     createWorker(trustedResourceUrl`random-script.js`) - Add new import:
//     import {createWorker} from 'safevalues/dom'; - Add new import: import
//     {trustedResourceUrl} from 'safevalues';
const workerWithComment = new Worker(/*dangerous!*/ 'random-script.js');

// accessing through globalThis doesn't work either
// @expected-diagnostic TS21228: [tsetse] [ban-worker-calls] Constructing Web
//     Workers can cause code to be loaded from an untrusted URL. See
//     go/xss-dom-sinks#ban-worker-calls for more details. Please use
//     go/tsconformance-yaqs for further questions. Suggested fix: - Replace
//     'new window.Worker('script.js')' with:
//     createWorker(trustedResourceUrl`script.js`) - Add new import: import
//     {createWorker} from 'safevalues/dom'; - Add new import: import
//     {trustedResourceUrl} from 'safevalues';
const windowWorker = new window.Worker('script.js');
// @expected-diagnostic TS21228: [tsetse] [ban-worker-calls] Constructing Web
//     Workers can cause code to be loaded from an untrusted URL. See
//     go/xss-dom-sinks#ban-worker-calls for more details. Please use
//     go/tsconformance-yaqs for further questions. Suggested fix: - Replace
//     'new window['Worker']('script.js')' with:
//     createWorker(trustedResourceUrl`script.js`) - Add new import: import
//     {createWorker} from 'safevalues/dom'; - Add new import: import
//     {trustedResourceUrl} from 'safevalues';
const windowWorker2 = new window['Worker']('script.js');

// @expected-diagnostic TS2348: Value of type '{ new (scriptURL: string | URL,
//     options?: WorkerOptions | undefined): Worker; prototype: Worker; }' is
//     not callable. Did you mean to include 'new'?
// @expected-diagnostic TS21228: [tsetse] [ban-worker-calls] Constructing Web
//     Workers can cause code to be loaded from an untrusted URL. See
//     go/xss-dom-sinks#ban-worker-calls for more details. Please use
//     go/tsconformance-yaqs for further questions.
const callingWithoutNew = window['Worker']('sss.js');

// Calls that shouldn't trigger;

/** Make sure we can refer to the type. */
export function doNothing(worker: Worker): Worker {
  const myWorker: Worker = worker;
  return myWorker;
}
