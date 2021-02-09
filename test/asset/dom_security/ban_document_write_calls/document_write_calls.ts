// direct calls
document.write('<h1>hello world</h1>');

// indirect use
const write = document.write.bind(document);
write('<p></p>');

// other tests
const WRITE = 'write' as 'write' | 'writeln';
const NARROWED_WRITE: 'write'|'writeln' = 'write';

// no violation, this is a limitation of TS conformance. We
// only check string literal element access. See b/171170880.
document[WRITE]('<p></p>');

// `NARROWED_WRITE` is narrowed by TS and has type `write` so
// this results in a violation
document[NARROWED_WRITE]('<p></p>');

document['write']('<p></p>');

document['write']('basic text without html');
