// Calls that should trigger an error
// @expected-diagnostic TS21228: [tsetse] [ban-eval-calls] Do not use eval, as
//     this can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets for more details. If
//     dynamically evaluating code in the global scope is inevitable in your
//     case, consider using the globalEval function from the safevalues library.
//     Please use go/tsconformance-yaqs if you have further questions. Suggested
//     fix: - Replace 'eval(`alert('uhoh');`)' with:
//     globalEval(safeScript`alert('uhoh');`) - Add new import: import
//     {globalEval} from 'safevalues/dom'; - Add new import: import {safeScript}
//     from 'safevalues';
eval(`alert('uhoh');`);
// @expected-diagnostic TS21228: [tsetse] [ban-eval-calls] Do not use eval, as
//     this can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets for more details. If
//     dynamically evaluating code in the global scope is inevitable in your
//     case, consider using the globalEval function from the safevalues library.
//     Please use go/tsconformance-yaqs if you have further questions. Suggested
//     fix: - Replace 'window.eval(`alert('uhoh');`)' with:
//     globalEval(safeScript`alert('uhoh');`) - Add new import: import
//     {globalEval} from 'safevalues/dom'; - Add new import: import {safeScript}
//     from 'safevalues';
window.eval(`alert('uhoh');`);

const test = {
  // @expected-diagnostic TS21228: [tsetse] [ban-eval-calls] Do not use eval, as
  //     this can lead to XSS. See
  //     go/ts-dom-sink#safescript-executable-code-snippets for more details. If
  //     dynamically evaluating code in the global scope is inevitable in your
  //     case, consider using the globalEval function from the safevalues
  //     library. Please use go/tsconformance-yaqs if you have further
  //     questions.
  custom: eval,
};
test.custom(`alert('uhoh');`);

// @expected-diagnostic TS21228: [tsetse] [ban-eval-calls] Do not use eval, as
//     this can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets for more details. If
//     dynamically evaluating code in the global scope is inevitable in your
//     case, consider using the globalEval function from the safevalues library.
//     Please use go/tsconformance-yaqs if you have further questions.
const indirect = eval;
indirect(`alert('ouch')`);

// @expected-diagnostic TS21228: [tsetse] [ban-eval-calls] Do not use eval, as
//     this can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets for more details. If
//     dynamically evaluating code in the global scope is inevitable in your
//     case, consider using the globalEval function from the safevalues library.
//     Please use go/tsconformance-yaqs if you have further questions.
(0, eval)(`alert('ouch')`);
// @expected-diagnostic TS21228: [tsetse] [ban-eval-calls] Do not use eval, as
//     this can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets for more details. If
//     dynamically evaluating code in the global scope is inevitable in your
//     case, consider using the globalEval function from the safevalues library.
//     Please use go/tsconformance-yaqs if you have further questions. Suggested
//     fix: - Replace 'window.eval(`alert('ouch')`)' with:
//     globalEval(safeScript`alert('ouch')`) - Add new import: import
//     {globalEval} from 'safevalues/dom'; - Add new import: import {safeScript}
//     from 'safevalues';
window.eval(`alert('ouch')`);
// @expected-diagnostic TS21228: [tsetse] [ban-eval-calls] Do not use eval, as
//     this can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets for more details. If
//     dynamically evaluating code in the global scope is inevitable in your
//     case, consider using the globalEval function from the safevalues library.
//     Please use go/tsconformance-yaqs if you have further questions. Suggested
//     fix: - Replace 'globalThis.eval(`alert('ouch')`)' with:
//     globalEval(safeScript`alert('ouch')`) - Add new import: import
//     {globalEval} from 'safevalues/dom'; - Add new import: import {safeScript}
//     from 'safevalues';
globalThis.eval(`alert('ouch')`);

// @expected-diagnostic TS21228: [tsetse] [ban-eval-calls] Do not use eval, as
//     this can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets for more details. If
//     dynamically evaluating code in the global scope is inevitable in your
//     case, consider using the globalEval function from the safevalues library.
//     Please use go/tsconformance-yaqs if you have further questions. Suggested
//     fix: - Replace 'window['eval'](`alert('ouch')`)' with:
//     globalEval(safeScript`alert('ouch')`) - Add new import: import
//     {globalEval} from 'safevalues/dom'; - Add new import: import {safeScript}
//     from 'safevalues';
window['eval'](`alert('ouch')`);

const win = window;
// @expected-diagnostic TS21228: [tsetse] [ban-eval-calls] Do not use eval, as
//     this can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets for more details. If
//     dynamically evaluating code in the global scope is inevitable in your
//     case, consider using the globalEval function from the safevalues library.
//     Please use go/tsconformance-yaqs if you have further questions. Suggested
//     fix: - Replace 'win.eval(`alert('ouch')`)' with:
//     globalEval(safeScript`alert('ouch')`) - Add new import: import
//     {globalEval} from 'safevalues/dom'; - Add new import: import {safeScript}
//     from 'safevalues';
win.eval(`alert('ouch')`);

declare const workerScope: WorkerGlobalScope;
// @expected-diagnostic TS21228: [tsetse] [ban-eval-calls] Do not use eval, as
//     this can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets for more details. If
//     dynamically evaluating code in the global scope is inevitable in your
//     case, consider using the globalEval function from the safevalues library.
//     Please use go/tsconformance-yaqs if you have further questions. Suggested
//     fix: - Replace 'workerScope.self.eval(`alert('ouch')`)' with:
//     globalEval(safeScript`alert('ouch')`) - Add new import: import
//     {globalEval} from 'safevalues/dom'; - Add new import: import {safeScript}
//     from 'safevalues';
workerScope.self.eval(`alert('ouch')`);
// @expected-diagnostic TS21228: [tsetse] [ban-eval-calls] Do not use eval, as
//     this can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets for more details. If
//     dynamically evaluating code in the global scope is inevitable in your
//     case, consider using the globalEval function from the safevalues library.
//     Please use go/tsconformance-yaqs if you have further questions. Suggested
//     fix: - Replace 'workerScope.self['eval'](`alert('ouch')`)' with:
//     globalEval(safeScript`alert('ouch')`) - Add new import: import
//     {globalEval} from 'safevalues/dom'; - Add new import: import {safeScript}
//     from 'safevalues';
workerScope.self['eval'](`alert('ouch')`);

// Calls that shouldn't trigger an error

/** Class with a custom eval method */
export class CustomEval {
  eval(x: number): boolean {
    return false;
  }
}
const customEval = new CustomEval();
customEval.eval(1);

/** Class with a custom eval property that has its own method */
export class CustomEvalProperty {
  eval = {
    doStuff(x: number) {
      return false;
    },
  };
}
const customEvalProperty = new CustomEvalProperty();
customEvalProperty.eval.doStuff(1);
