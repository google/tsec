// Calls that should trigger an error
// @expected-diagnostic TS21228: [tsetse] [ban-function-calls] Constructing
//     functions from strings can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets for more details.
//     Please use go/tsconformance-yaqs if you have further questions.
// tslint:disable-next-line:no-unused-expression
new Function(`alert('uhoh');`);

const test = {
  custom: Function,
};
test.custom(`alert('uhoh');`);

const indirect = Function;
indirect(`alert('ouch')`);

// @expected-diagnostic TS21228: [tsetse] [ban-function-calls] Constructing
//     functions from strings can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets for more details.
//     Please use go/tsconformance-yaqs if you have further questions.
Function(`alert('ouch')`);
// @expected-diagnostic TS21228: [tsetse] [ban-function-calls] Constructing
//     functions from strings can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets for more details.
//     Please use go/tsconformance-yaqs if you have further questions.
window.Function(`alert('ouch')`);
// @expected-diagnostic TS21228: [tsetse] [ban-function-calls] Constructing
//     functions from strings can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets for more details.
//     Please use go/tsconformance-yaqs if you have further questions.
globalThis.Function.prototype.constructor(`alert('ouch')`);

// @expected-diagnostic TS21228: [tsetse] [ban-function-calls] Constructing
//     functions from strings can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets for more details.
//     Please use go/tsconformance-yaqs if you have further questions.
window['Function'](`alert('ouch')`);

const win = window;
// @expected-diagnostic TS21228: [tsetse] [ban-function-calls] Constructing
//     functions from strings can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets for more details.
//     Please use go/tsconformance-yaqs if you have further questions.
win.Function(`alert('ouch')`);

declare const workerScope: WorkerGlobalScope;
// @expected-diagnostic TS21228: [tsetse] [ban-function-calls] Constructing
//     functions from strings can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets for more details.
//     Please use go/tsconformance-yaqs if you have further questions.
workerScope.self.Function(`alert('ouch')`);
// @expected-diagnostic TS21228: [tsetse] [ban-function-calls] Constructing
//     functions from strings can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets for more details.
//     Please use go/tsconformance-yaqs if you have further questions.
workerScope.self['Function'](`alert('ouch')`);

// Calls that shouldn't trigger an error
// tslint:disable:enforce-name-casing
/** Class with a custom Function method */
export class CustomEval {
  Function(x: number): boolean {
    return false;
  }
}
const customEval = new CustomEval();
customEval.Function(1);

/** Class with a custom Function property that has its own method */
export class CustomEvalProperty {
  Function = {
    doStuff(x: number) {
      return false;
    },
  };
}
const customEvalProperty = new CustomEvalProperty();
customEvalProperty.Function.doStuff(1);

declare const fn: Function;
// tslint:disable-next-line:no-unused-variable
const fn2: Function = fn;
// tslint:disable-next-line:no-unused-variable
const isFn = fn instanceof Function;
