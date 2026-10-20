const tt = 'tt' as unknown as TrustedScript;
// @expected-diagnostic TS21228: [tsetse] [ban-function-calls] Constructing
//     functions from strings can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets for more details.
//     Please use go/tsconformance-yaqs if you have further questions.
Function(tt as unknown as string); // ban Trusted Types internally
// @expected-diagnostic TS21228: [tsetse] [ban-function-calls] Constructing
//     functions from strings can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets for more details.
//     Please use go/tsconformance-yaqs if you have further questions.
window['Function'](tt as unknown as string); // ban Trusted Types internally
