// direct calls
document.writeln('<h1>hello world again</h1>', '<p>ipsum</p>');

// indirect use
const writeln = document.writeln.bind(document);
writeln('<p></p>');

// other tests
const NARROWED_WRITE: 'write'|'writeln' = 'writeln';

// `NARROWED_WRITE` is narrowed by TS and has type `write` so
// this results in a violation
document[NARROWED_WRITE]('<p></p>');

document['writeln']('<p></p>');

document['writeln']('basic text without html');
