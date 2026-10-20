// direct calls
// @expected-diagnostic TS21228: [tsetse] [ban-document-write-calls] Do not use
//     Document#write, as this can lead to XSS. See go/ts-dom-sink#safehtml for
//     details. Please use go/tsconformance-yaqs if you have further questions.
//     Suggested fix: - Replace 'document.write('<h1>hello world</h1>')' with:
//     documentWrite(document, sanitizeHtmlAssertUnchanged('<h1>hello
//     world</h1>')) - Add new import: import {documentWrite} from
//     'safevalues/dom'; - Add new import: import {sanitizeHtmlAssertUnchanged}
//     from 'safevalues';
document.write('<h1>hello world</h1>');

// indirect use
// @expected-diagnostic TS21228: [tsetse] [ban-document-write-calls] Do not use
//     Document#write, as this can lead to XSS. See go/ts-dom-sink#safehtml for
//     details. Please use go/tsconformance-yaqs if you have further questions.
const write = document.write.bind(document);
write('<p></p>');

// other tests
const WRITE = 'write' as 'write' | 'writeln';
const NARROWED_WRITE: 'write' | 'writeln' = 'write';

// no violation, this is a limitation of TS conformance. We
// only check string literal element access. See b/171170880.
document[WRITE]('<p></p>');

// `NARROWED_WRITE` is narrowed by TS and has type `write` so
// this results in a violation
// @expected-diagnostic TS21228: [tsetse] [ban-document-write-calls] Do not use
//     Document#write, as this can lead to XSS. See go/ts-dom-sink#safehtml for
//     details. Please use go/tsconformance-yaqs if you have further questions.
//     Suggested fix: - Replace 'document[NARROWED_WRITE]('<p></p>')' with:
//     documentWrite(document, sanitizeHtmlAssertUnchanged('<p></p>')) - Add new
//     import: import {documentWrite} from 'safevalues/dom'; - Add new import:
//     import {sanitizeHtmlAssertUnchanged} from 'safevalues';
document[NARROWED_WRITE]('<p></p>');

// @expected-diagnostic TS21228: [tsetse] [ban-document-write-calls] Do not use
//     Document#write, as this can lead to XSS. See go/ts-dom-sink#safehtml for
//     details. Please use go/tsconformance-yaqs if you have further questions.
//     Suggested fix: - Replace 'document['write']('<p></p>')' with:
//     documentWrite(document, sanitizeHtmlAssertUnchanged('<p></p>')) - Add new
//     import: import {documentWrite} from 'safevalues/dom'; - Add new import:
//     import {sanitizeHtmlAssertUnchanged} from 'safevalues';
document['write']('<p></p>');

// @expected-diagnostic TS21228: [tsetse] [ban-document-write-calls] Do not use
//     Document#write, as this can lead to XSS. See go/ts-dom-sink#safehtml for
//     details. Please use go/tsconformance-yaqs if you have further questions.
//     Suggested fix: - Replace 'document['write']('basic text without html')'
//     with: documentWrite(document, htmlEscape('basic text without html')) -
//     Add new import: import {documentWrite} from 'safevalues/dom'; - Add new
//     import: import {htmlEscape} from 'safevalues';
document['write']('basic text without html');
