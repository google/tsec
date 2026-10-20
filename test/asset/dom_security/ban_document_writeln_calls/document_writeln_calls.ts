// direct calls
// @expected-diagnostic TS21228: [tsetse] [ban-document-writeln-calls] Do not
//     use Document#writeln, as this can lead to XSS. See
//     go/ts-dom-sink#safehtml for details. Please use go/tsconformance-yaqs if
//     you have further questions.
document.writeln('<h1>hello world again</h1>', '<p>ipsum</p>');

// indirect use
// @expected-diagnostic TS21228: [tsetse] [ban-document-writeln-calls] Do not
//     use Document#writeln, as this can lead to XSS. See
//     go/ts-dom-sink#safehtml for details. Please use go/tsconformance-yaqs if
//     you have further questions.
const writeln = document.writeln.bind(document);
writeln('<p></p>');

// other tests
const NARROWED_WRITE: 'write' | 'writeln' = 'writeln';

// `NARROWED_WRITE` is narrowed by TS and has type `write` so
// this results in a violation
// @expected-diagnostic TS21228: [tsetse] [ban-document-writeln-calls] Do not
//     use Document#writeln, as this can lead to XSS. See
//     go/ts-dom-sink#safehtml for details. Please use go/tsconformance-yaqs if
//     you have further questions.
document[NARROWED_WRITE]('<p></p>');

// @expected-diagnostic TS21228: [tsetse] [ban-document-writeln-calls] Do not
//     use Document#writeln, as this can lead to XSS. See
//     go/ts-dom-sink#safehtml for details. Please use go/tsconformance-yaqs if
//     you have further questions.
document['writeln']('<p></p>');

// @expected-diagnostic TS21228: [tsetse] [ban-document-writeln-calls] Do not
//     use Document#writeln, as this can lead to XSS. See
//     go/ts-dom-sink#safehtml for details. Please use go/tsconformance-yaqs if
//     you have further questions.
document['writeln']('basic text without html');
