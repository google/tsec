// window.func is automatically resolved to the global func name,
// while window.parent.func is not. We thoroughly test both cases.
// @expected-diagnostic TS21228: [tsetse] [ban-window-stringfunctiondef] Do not
//     use setInterval, as calling it with a string argument can cause
//     code-injection security vulnerabilities. See
//     go/ts-dom-sink#safescript-executable-code-snippets. Please use
//     go/tsconformance-yaqs for further questions.
setInterval(`alsert('XSS!');`);
// @expected-diagnostic TS21228: [tsetse] [ban-window-stringfunctiondef] Do not
//     use setTimeout, as calling it with a string argument can cause
//     code-injection security vulnerabilities. See
//     go/ts-dom-sink#safescript-executable-code-snippets. Please use
//     go/tsconformance-yaqs for further questions.
setTimeout(`alsert('XSS!');`);

// @expected-diagnostic TS21228: [tsetse] [ban-window-stringfunctiondef] Do not
//     use Window#setInterval, as calling it with a string argument can cause
//     code-injection security vulnerabilities. See
//     go/ts-dom-sink#safescript-executable-code-snippets. Please use
//     go/tsconformance-yaqs for further questions.
window.setInterval(`alsert('XSS!');`);
// @expected-diagnostic TS21228: [tsetse] [ban-window-stringfunctiondef] Do not
//     use Window#setTimeout, as calling it with a string argument can cause
//     code-injection security vulnerabilities. See
//     go/ts-dom-sink#safescript-executable-code-snippets. Please use
//     go/tsconformance-yaqs for further questions.
window.setTimeout(`alsert('XSS!');`);

// @expected-diagnostic TS21228: [tsetse] [ban-window-stringfunctiondef] Do not
//     use Window#setInterval, as calling it with a string argument can cause
//     code-injection security vulnerabilities. See
//     go/ts-dom-sink#safescript-executable-code-snippets. Please use
//     go/tsconformance-yaqs for further questions.
window.parent.setInterval(`alsert('XSS!');`);
// @expected-diagnostic TS21228: [tsetse] [ban-window-stringfunctiondef] Do not
//     use Window#setTimeout, as calling it with a string argument can cause
//     code-injection security vulnerabilities. See
//     go/ts-dom-sink#safescript-executable-code-snippets. Please use
//     go/tsconformance-yaqs for further questions.
window.parent.setTimeout(`alsert('XSS!');`);

// Direct use of the functions or properties no longer triggers. Rely on TT to
// capture bypasses.
const si = setInterval;
si(() => {});

const st = setTimeout;
st(() => {});

const wsi = window.parent.setInterval.bind(window.parent); // NOTYPO
wsi(() => {});

const wst = window.parent.setTimeout.bind(window.parent); // NOTYPO
wst(() => {});

// @expected-diagnostic TS21228: [tsetse] [ban-window-stringfunctiondef] Do not
//     use Window#setTimeout, as calling it with a string argument can cause
//     code-injection security vulnerabilities. See
//     go/ts-dom-sink#safescript-executable-code-snippets. Please use
//     go/tsconformance-yaqs for further questions.
window['setTimeout'](`alert('xss')`);
// @expected-diagnostic TS21228: [tsetse] [ban-window-stringfunctiondef] Do not
//     use Window#setTimeout, as calling it with a string argument can cause
//     code-injection security vulnerabilities. See
//     go/ts-dom-sink#safescript-executable-code-snippets. Please use
//     go/tsconformance-yaqs for further questions.
window[`setTimeout`](`alert('xss')`);

// Tsetse should not emit errors for code after this line.
function handler() {}

setInterval(handler);
setTimeout(handler);

window.setInterval(handler);
window.setTimeout(handler);

window.parent.setInterval(handler);
window.parent.setTimeout(handler);

// @expected-diagnostic TS2555: Expected at least 1 arguments, but got 0.
setInterval();
// @expected-diagnostic TS2555: Expected at least 1 arguments, but got 0.
setTimeout();

// @expected-diagnostic TS2555: Expected at least 1 arguments, but got 0.
window.setInterval();
// @expected-diagnostic TS2555: Expected at least 1 arguments, but got 0.
window.setTimeout();

setInterval(handler, 123);
setTimeout(handler, 123);

window.setInterval(handler, 123);
window.setTimeout(handler, 123);

window.parent.setInterval(handler, 123);
window.parent.setTimeout(handler, 123);

type A = typeof setInterval;
type B = typeof setTimeout;
type C = typeof window.setInterval;
type D = typeof window.setTimeout;
type E = typeof window.parent.setInterval;
type F = typeof window.parent.setTimeout;
