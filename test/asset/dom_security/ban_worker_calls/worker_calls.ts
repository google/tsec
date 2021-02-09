// Calls that should trigger;

// Code below creates unused variables just to test that the conformance check
// triggers.
// tslint:disable:no-unused-variable

const NUM = 1;
const worker = new Worker(`random-${NUM}-script.js`);
const workerWithOptions = new Worker('random-script.js', {});

const MY_URL = 'random-script.js';
const workerWithVariable = new Worker(MY_URL);

const workerWithComment = new Worker(/*dangerous!*/ 'random-script.js');

// accessing through globalThis doesn't work either
const windowWorker = new window.Worker('script.js');
const windowWorker2 = new window['Worker']('script.js');

const callingWithoutNew = window['Worker']('sss.js');

// Calls that shouldn't trigger;

/** Make sure we can refer to the type. */
export function doNothing(worker: Worker): Worker {
  const myWorker: Worker = worker;
  return myWorker;
}
