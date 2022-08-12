const oElem = document.createElement('object');

const LITERAL = 'https://example.com/script.js';
const nonLiteral = 'https://example.com/' + document.location.hash;

oElem.data = '';       // literal
oElem.data = LITERAL;  // indirection is supported
oElem.data = nonLiteral;
oElem['data'] = '';
