const sElem = document.createElement('script');

const LITERAL = 'https://example.com/script.js';
let literalLet = 'https://example.com/script.js';
const nonLiteral = 'https://example.com/' + document.location.hash;

// Assignments that should not trigger.
sElem.className = nonLiteral; // not a script#src assignment
// @expected-diagnostic TS21228: [tsetse] [ban-script-src-assignments] Do not
//     assign variables to HTMLScriptElement#src, as this can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets. Please use
//     go/tsconformance-yaqs if you have further questions. Suggested fix: -
//     Replace the full match with: setScriptSrc(sElem, trustedResourceUrl``) -
//     Add new import: import {setScriptSrc} from 'safevalues/dom'; - Add new
//     import: import {trustedResourceUrl} from 'safevalues';
sElem.src = ''; // literal
// @expected-diagnostic TS21228: [tsetse] [ban-script-src-assignments] Do not
//     assign variables to HTMLScriptElement#src, as this can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets. Please use
//     go/tsconformance-yaqs if you have further questions. Suggested fix: -
//     Replace the full match with: setScriptSrc(sElem,
//     trustedResourceUrl`${LITERAL}` /* FIXME: Construct from literals instead
//     of `${LITERAL}`, see the corresponding entries in go/ts-dom-sink. */) -
//     Add new import: import {setScriptSrc} from 'safevalues/dom'; - Add new
//     import: import {trustedResourceUrl} from 'safevalues';
sElem.src = LITERAL; // indirection is supported
// @expected-diagnostic TS21228: [tsetse] [ban-script-src-assignments] Do not
//     assign variables to HTMLScriptElement#src, as this can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets. Please use
//     go/tsconformance-yaqs if you have further questions. Suggested fix: -
//     Replace the full match with: setScriptSrc(sElem,
//     trustedResourceUrl`${`${LITERAL}?foo`}` /* FIXME: Construct from literals
//     instead of `${`${LITERAL}?foo`}`, see the corresponding entries in
//     go/ts-dom-sink. */) - Add new import: import {setScriptSrc} from
//     'safevalues/dom'; - Add new import: import {trustedResourceUrl} from
//     'safevalues';
sElem.src = `${LITERAL}?foo`; // literal
let src = sElem.src; // read, not write
src = nonLiteral; // not a script#src assignment

// Grey area of tests that don't trigger, but could
(sElem as unknown as HTMLImageElement).src = nonLiteral;

// We don't trigger on any, since it's not the right type.
const sElemAsAny: any = sElem; // tslint:disable-line:no-any We need to test.
sElemAsAny.src = nonLiteral;

// Assignments that should trigger
// @expected-diagnostic TS21228: [tsetse] [ban-script-src-assignments] Do not
//     assign variables to HTMLScriptElement#src, as this can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets. Please use
//     go/tsconformance-yaqs if you have further questions. Suggested fix: -
//     Replace the full match with: setScriptSrc(sElem,
//     trustedResourceUrl`${nonLiteral}` /* FIXME: Construct from literals
//     instead of `${nonLiteral}`, see the corresponding entries in
//     go/ts-dom-sink. */) - Add new import: import {setScriptSrc} from
//     'safevalues/dom'; - Add new import: import {trustedResourceUrl} from
//     'safevalues';
sElem.src = nonLiteral;
// @expected-diagnostic TS21228: [tsetse] [ban-script-src-assignments] Do not
//     assign variables to HTMLScriptElement#src, as this can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets. Please use
//     go/tsconformance-yaqs if you have further questions. Suggested fix: -
//     Replace the full match with: setScriptSrc(sElem,
//     trustedResourceUrl`${literalLet}` /* FIXME: Construct from literals
//     instead of `${literalLet}`, see the corresponding entries in
//     go/ts-dom-sink. */) - Add new import: import {setScriptSrc} from
//     'safevalues/dom'; - Add new import: import {trustedResourceUrl} from
//     'safevalues';
sElem.src = literalLet; // let-variables aren't seen as literal
// @expected-diagnostic TS21228: [tsetse] [ban-script-src-assignments] Do not
//     assign variables to HTMLScriptElement#src, as this can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets. Please use
//     go/tsconformance-yaqs if you have further questions. Suggested fix: -
//     Replace the full match with: setScriptSrc(sElem,
//     trustedResourceUrl`${nonLiteral as 'literal'}` /* FIXME: Construct from
//     literals instead of `${nonLiteral as 'literal'}`, see the corresponding
//     entries in go/ts-dom-sink. */) - Add new import: import {setScriptSrc}
//     from 'safevalues/dom'; - Add new import: import {trustedResourceUrl} from
//     'safevalues';
sElem.src = nonLiteral as 'literal'; // 'as' throws of literalness checks
// @expected-diagnostic TS21228: [tsetse] [ban-script-src-assignments] Do not
//     assign variables to HTMLScriptElement#src, as this can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets. Please use
//     go/tsconformance-yaqs if you have further questions. Suggested fix: -
//     Replace the full match with: setScriptSrc(sElem,
//     trustedResourceUrl`${nonLiteral}` /* FIXME: Construct from literals
//     instead of `${nonLiteral}`, see the corresponding entries in
//     go/ts-dom-sink. */) - Add new import: import {setScriptSrc} from
//     'safevalues/dom'; - Add new import: import {trustedResourceUrl} from
//     'safevalues';
if ('hello' === (sElem.src = nonLiteral) && true) {
  // in expression context
}

// @expected-diagnostic TS21228: [tsetse] [ban-script-src-assignments] Do not
//     assign variables to HTMLScriptElement#src, as this can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets. Please use
//     go/tsconformance-yaqs if you have further questions. Suggested fix: -
//     Replace the full match with: setScriptSrc(sElem,
//     trustedResourceUrl`${LITERAL}` /* FIXME: Construct from literals instead
//     of `${LITERAL}`, see the corresponding entries in go/ts-dom-sink. */) -
//     Add new import: import {setScriptSrc} from 'safevalues/dom'; - Add new
//     import: import {trustedResourceUrl} from 'safevalues';
sElem['src'] = LITERAL;
