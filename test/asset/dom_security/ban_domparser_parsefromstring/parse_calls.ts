// Calls to parseFromString that should trigger the check.
// tslint:disable:no-unused-variable

const HTML = '<script>alert(\'XSS\');</script>';
const parser = new DOMParser();
const doc1 = parser.parseFromString(HTML, 'text/html');

const doc2 = new DOMParser()['parseFromString'](HTML, 'text/html');

const parseFun = parser.parseFromString;
const doc3 = parseFun(HTML, 'text/html');
