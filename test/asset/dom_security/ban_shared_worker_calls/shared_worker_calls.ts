// Calls that should trigger;

// Code below creates unused variables just to test that the conformance check
// triggers.
// tslint:disable:no-unused-variable

const NUM = 1;
const worker = new SharedWorker(`random-${NUM}-script.js`);
const workerWithOptions = new SharedWorker('random-script.js', {});

const MY_URL = 'random-script.js';
const workerWithVariable = new SharedWorker(MY_URL);

const workerWithComment = new SharedWorker(/*dangerous!*/ 'random-script.js');

// accessing through globalThis doesn't work either
const windowWorker = new window.SharedWorker('script.js');
const windowWorker2 = new window['SharedWorker']('script.js');

const callingWithoutNew = window['SharedWorker']('sss.js');

// Calls that shouldn't trigger;

/** Make sure we can refer to the type. */
export function doNothing(worker: SharedWorker): SharedWorker {
  const myWorker: SharedWorker = worker;
  return myWorker;
}
