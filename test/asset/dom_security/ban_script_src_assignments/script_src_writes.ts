const sElem = document.createElement('script');

const LITERAL = 'https://example.com/script.js';
let literalLet = 'https://example.com/script.js';
const nonLiteral = 'https://example.com/' + document.location.hash;

// Assignments that should not trigger.
sElem.className = nonLiteral;  // not a script#src assignment
sElem.src = '';                // literal
sElem.src = LITERAL;           // indirection is supported
sElem.src = `${LITERAL}?foo`;  // literal
let src = sElem.src;           // read, not write
src = nonLiteral;              // not a script#src assignment

// Grey area of tests that don't trigger, but could
(sElem as unknown as HTMLImageElement).src = nonLiteral;

// We don't trigger on any, since it's not the right type.
const sElemAsAny: any = sElem;  // tslint:disable-line:no-any We need to test.
sElemAsAny.src = nonLiteral;

// Assignments that should trigger
sElem.src = nonLiteral;
sElem.src = literalLet;               // let-variables aren't seen as literal
sElem.src = nonLiteral as 'literal';  // 'as' throws of literalness checks
if ('hello' === (sElem.src = nonLiteral) && true) {  // in expression context
}

sElem['src'] = LITERAL;
