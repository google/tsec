// window.func is automatically resolved to the global func name,
// while window.parent.func is not. We thoroughly test both cases.
setInterval(`alsert('XSS!');`);
setTimeout(`alsert('XSS!');`);

window.setInterval(`alsert('XSS!');`);
window.setTimeout(`alsert('XSS!');`);

window.parent.setInterval(`alsert('XSS!');`);
window.parent.setTimeout(`alsert('XSS!');`);

// direct use of the functions or properties also triggers, no matter
// how it is used later.
const si = setInterval;
si(() => {});

const st = setTimeout;
st(() => {});

const wsi = window.parent.setInterval.bind(window.parent);  // NOTYPO
wsi(() => {});

const wst = window.parent.setTimeout.bind(window.parent);  // NOTYPO
wst(() => {});

window['setTimeout'](`alert('xss')`);
window[`setTimeout`](`alert('xss')`);



// Tsetse should not emit errors for code after this line.
function handler() {}

setInterval(handler);
setTimeout(handler);

window.setInterval(handler);
window.setTimeout(handler);

window.parent.setInterval(handler);
window.parent.setTimeout(handler);

setInterval();
setTimeout();

window.setInterval();
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
