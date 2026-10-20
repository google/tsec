const oElem = document.createElement('object');

const LITERAL = 'https://example.com/script.js';
const nonLiteral = 'https://example.com/' + document.location.hash;

// @expected-diagnostic TS21228: [tsetse] [ban-object-data-assignments] Do not
//     assign variables to HTMLObjectElement#data, as this can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets. Please use
//     go/tsconformance-yaqs if you have further questions. Suggested fix: -
//     Replace the full match with: setObjectData(oElem, trustedResourceUrl``) -
//     Add new import: import {setObjectData} from 'safevalues/dom'; - Add new
//     import: import {trustedResourceUrl} from 'safevalues';
oElem.data = ''; // literal
// @expected-diagnostic TS21228: [tsetse] [ban-object-data-assignments] Do not
//     assign variables to HTMLObjectElement#data, as this can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets. Please use
//     go/tsconformance-yaqs if you have further questions. Suggested fix: -
//     Replace the full match with: setObjectData(oElem,
//     trustedResourceUrl`${LITERAL}` /* FIXME: Construct from literals instead
//     of `${LITERAL}`, see the corresponding entries in go/ts-dom-sink. */) -
//     Add new import: import {setObjectData} from 'safevalues/dom'; - Add new
//     import: import {trustedResourceUrl} from 'safevalues';
oElem.data = LITERAL; // indirection is supported
// @expected-diagnostic TS21228: [tsetse] [ban-object-data-assignments] Do not
//     assign variables to HTMLObjectElement#data, as this can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets. Please use
//     go/tsconformance-yaqs if you have further questions. Suggested fix: -
//     Replace the full match with: setObjectData(oElem,
//     trustedResourceUrl`${nonLiteral}` /* FIXME: Construct from literals
//     instead of `${nonLiteral}`, see the corresponding entries in
//     go/ts-dom-sink. */) - Add new import: import {setObjectData} from
//     'safevalues/dom'; - Add new import: import {trustedResourceUrl} from
//     'safevalues';
oElem.data = nonLiteral;
// @expected-diagnostic TS21228: [tsetse] [ban-object-data-assignments] Do not
//     assign variables to HTMLObjectElement#data, as this can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets. Please use
//     go/tsconformance-yaqs if you have further questions. Suggested fix: -
//     Replace the full match with: setObjectData(oElem, trustedResourceUrl``) -
//     Add new import: import {setObjectData} from 'safevalues/dom'; - Add new
//     import: import {trustedResourceUrl} from 'safevalues';
oElem['data'] = '';
