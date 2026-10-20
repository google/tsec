// Calls to parseFromString that should trigger the check.
// tslint:disable:no-unused-variable

const HTML = "<script>alert('XSS');</script>";
const parser = new DOMParser();
// @expected-diagnostic TS21228: [tsetse] [ban-domparser-parsefromstring] Using
//     DOMParser#parseFromString to parse untrusted input into DOM elements can
//     lead to XSS. Please create SafeHtml from go/safehtmltypes and pass it to
//     goog.dom.safe.parseFromString instead. See go/js-dom-sink#safehtml.
//     Please use go/tsconformance-yaqs for further questions.
const doc1 = parser.parseFromString(HTML, 'text/html');

// @expected-diagnostic TS21228: [tsetse] [ban-domparser-parsefromstring] Using
//     DOMParser#parseFromString to parse untrusted input into DOM elements can
//     lead to XSS. Please create SafeHtml from go/safehtmltypes and pass it to
//     goog.dom.safe.parseFromString instead. See go/js-dom-sink#safehtml.
//     Please use go/tsconformance-yaqs for further questions.
const doc2 = new DOMParser()['parseFromString'](HTML, 'text/html');

// @expected-diagnostic TS21228: [tsetse] [ban-domparser-parsefromstring] Using
//     DOMParser#parseFromString to parse untrusted input into DOM elements can
//     lead to XSS. Please create SafeHtml from go/safehtmltypes and pass it to
//     goog.dom.safe.parseFromString instead. See go/js-dom-sink#safehtml.
//     Please use go/tsconformance-yaqs for further questions.
const parseFun = parser.parseFromString;
const doc3 = parseFun(HTML, 'text/html');
