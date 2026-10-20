const tt = 'tt' as unknown as TrustedScript;
// @expected-diagnostic TS21228: [tsetse] [ban-eval-calls] Do not use eval, as
//     this can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets for more details. If
//     dynamically evaluating code in the global scope is inevitable in your
//     case, consider using the globalEval function from the safevalues library.
//     Please use go/tsconformance-yaqs if you have further questions. Suggested
//     fix: - Replace 'eval(tt as unknown as string)' with:
//     globalEval(safeScript`${tt as unknown as string}` /* FIXME: Construct
//     from literals instead of `${tt as unknown as string}`, see the
//     corresponding entries in go/ts-dom-sink. */) - Add new import: import
//     {globalEval} from 'safevalues/dom'; - Add new import: import {safeScript}
//     from 'safevalues';
eval(tt as unknown as string); // ban Trusted Types internally
// @expected-diagnostic TS21228: [tsetse] [ban-eval-calls] Do not use eval, as
//     this can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets for more details. If
//     dynamically evaluating code in the global scope is inevitable in your
//     case, consider using the globalEval function from the safevalues library.
//     Please use go/tsconformance-yaqs if you have further questions. Suggested
//     fix: - Replace 'window['eval'](tt as unknown as string)' with:
//     globalEval(safeScript`${tt as unknown as string}` /* FIXME: Construct
//     from literals instead of `${tt as unknown as string}`, see the
//     corresponding entries in go/ts-dom-sink. */) - Add new import: import
//     {globalEval} from 'safevalues/dom'; - Add new import: import {safeScript}
//     from 'safevalues';
window['eval'](tt as unknown as string); // ban Trusted Types internally
