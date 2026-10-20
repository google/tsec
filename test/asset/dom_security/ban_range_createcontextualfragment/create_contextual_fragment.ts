// Calling Range#createContextualFragment
let range = document.createRange();
// @expected-diagnostic TS21228: [tsetse] [ban-range-createcontextualfragment]
//     Do not use Range#createContextualFragment, as this can lead to XSS. See
//     go/ts-dom-sink#safehtml for details. Please use go/tsconformance-yaqs if
//     you have further questions. Suggested fix: - Replace
//     'range.createContextualFragment('<p></p>')' with:
//     rangeCreateContextualFragment(range, '<p></p>') - Add new import: import
//     {rangeCreateContextualFragment} from 'safevalues/dom';
range.createContextualFragment('<p></p>');
