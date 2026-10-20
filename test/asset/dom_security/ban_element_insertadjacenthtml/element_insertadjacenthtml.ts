declare const element: Element;

// direct calls
// @expected-diagnostic TS21228: [tsetse] [ban-element-insertadjacenthtml] Do
//     not use Element#insertAdjacentHTML, as this can lead to XSS. See
//     go/ts-dom-sink#safehtml for details. Please use go/tsconformance-yaqs if
//     you have further questions. Suggested fix: - Replace
//     'element.insertAdjacentHTML('afterend', '<h1>hello world</h1>')' with:
//     elementInsertAdjacentHtml(element, 'afterend',
//     sanitizeHtmlAssertUnchanged('<h1>hello world</h1>')) - Add new import:
//     import {elementInsertAdjacentHtml} from 'safevalues/dom'; - Add new
//     import: import {sanitizeHtmlAssertUnchanged} from 'safevalues';
element.insertAdjacentHTML('afterend', '<h1>hello world</h1>');

// indirect use
// @expected-diagnostic TS21228: [tsetse] [ban-element-insertadjacenthtml] Do
//     not use Element#insertAdjacentHTML, as this can lead to XSS. See
//     go/ts-dom-sink#safehtml for details. Please use go/tsconformance-yaqs if
//     you have further questions.
const insertAdjacentHTML = element.insertAdjacentHTML.bind(element);
insertAdjacentHTML('afterbegin', '<p></p>');

// other tests
const KEY = 'insertAdjacentHTML';
// @expected-diagnostic TS21228: [tsetse] [ban-element-insertadjacenthtml] Do
//     not use Element#insertAdjacentHTML, as this can lead to XSS. See
//     go/ts-dom-sink#safehtml for details. Please use go/tsconformance-yaqs if
//     you have further questions. Suggested fix: - Replace
//     'element[KEY]('afterbegin', '<p></p>')' with:
//     elementInsertAdjacentHtml(element, 'afterbegin',
//     sanitizeHtmlAssertUnchanged('<p></p>')) - Add new import: import
//     {elementInsertAdjacentHtml} from 'safevalues/dom'; - Add new import:
//     import {sanitizeHtmlAssertUnchanged} from 'safevalues';
element[KEY]('afterbegin', '<p></p>');

// @expected-diagnostic TS21228: [tsetse] [ban-element-insertadjacenthtml] Do
//     not use Element#insertAdjacentHTML, as this can lead to XSS. See
//     go/ts-dom-sink#safehtml for details. Please use go/tsconformance-yaqs if
//     you have further questions. Suggested fix: - Replace
//     'element['insertAdjacentHTML']('beforebegin', '<p></p>')' with:
//     elementInsertAdjacentHtml(element, 'beforebegin',
//     sanitizeHtmlAssertUnchanged('<p></p>')) - Add new import: import
//     {elementInsertAdjacentHtml} from 'safevalues/dom'; - Add new import:
//     import {sanitizeHtmlAssertUnchanged} from 'safevalues';
element['insertAdjacentHTML']('beforebegin', '<p></p>');

// @expected-diagnostic TS21228: [tsetse] [ban-element-insertadjacenthtml] Do
//     not use Element#insertAdjacentHTML, as this can lead to XSS. See
//     go/ts-dom-sink#safehtml for details. Please use go/tsconformance-yaqs if
//     you have further questions. Suggested fix: - Replace
//     'element['insertAdjacentHTML']('beforeend', 'basic text without html')'
//     with: elementInsertAdjacentHtml(element, 'beforeend', htmlEscape('basic
//     text without html')) - Add new import: import {elementInsertAdjacentHtml}
//     from 'safevalues/dom'; - Add new import: import {htmlEscape} from
//     'safevalues';
element['insertAdjacentHTML']('beforeend', 'basic text without html');
