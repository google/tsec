const tt = 'tt' as unknown as TrustedScript;
// @expected-diagnostic TS21228: [tsetse] [ban-window-stringfunctiondef] Do not
//     use setTimeout, as calling it with a string argument can cause
//     code-injection security vulnerabilities. See
//     go/ts-dom-sink#safescript-executable-code-snippets. Please use
//     go/tsconformance-yaqs for further questions.
setTimeout(tt as unknown as string); // ban Trusted Types internally
