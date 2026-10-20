// Writing to outerHTML causes an error.
// @expected-diagnostic TS21228: [tsetse] [ban-element-outerhtml-assignments]
//     Assigning directly to Element#outerHTML can result in XSS
//     vulnerabilities. Please either use a safe template system
//     (go/templatesystems), or create a SafeHtml value by sanitizing the HTML
//     and set the element's outerHTML property by using the DOM element's
//     setElementOuterHtml setter exported in 'safevalues/dom'. See
//     go/ts-dom-sink#safehtml for more details. Please use
//     go/tsconformance-yaqs if you have further questions. Suggested fix: -
//     Replace the full match with: setElementOuterHtml(document.body,
//     sanitizeHtmlAssertUnchanged('foo' + location.hash)) - Add new import:
//     import {setElementOuterHtml} from 'safevalues/dom'; - Add new import:
//     import {sanitizeHtmlAssertUnchanged} from 'safevalues';
document.body.outerHTML = 'foo' + location.hash;

// Reading outerHTML is okay.
const body = document.body.outerHTML;

// @expected-diagnostic TS21228: [tsetse] [ban-element-outerhtml-assignments]
//     Assigning directly to Element#outerHTML can result in XSS
//     vulnerabilities. Please either use a safe template system
//     (go/templatesystems), or create a SafeHtml value by sanitizing the HTML
//     and set the element's outerHTML property by using the DOM element's
//     setElementOuterHtml setter exported in 'safevalues/dom'. See
//     go/ts-dom-sink#safehtml for more details. Please use
//     go/tsconformance-yaqs if you have further questions. Suggested fix: -
//     Replace the full match with: setElementOuterHtml(document.body,
//     htmlEscape('constant')) - Add new import: import {setElementOuterHtml}
//     from 'safevalues/dom'; - Add new import: import {htmlEscape} from
//     'safevalues';
document.body.outerHTML = `constant`;

const PAYLOAD: string = 'str';
const customObj = {
  outerHTML: 'custom',
};
customObj.outerHTML = PAYLOAD;

// @expected-diagnostic TS21228: [tsetse] [ban-element-outerhtml-assignments]
//     Assigning directly to Element#outerHTML can result in XSS
//     vulnerabilities. Please either use a safe template system
//     (go/templatesystems), or create a SafeHtml value by sanitizing the HTML
//     and set the element's outerHTML property by using the DOM element's
//     setElementOuterHtml setter exported in 'safevalues/dom'. See
//     go/ts-dom-sink#safehtml for more details. Please use
//     go/tsconformance-yaqs if you have further questions. Suggested fix: -
//     Replace the full match with: setElementOuterHtml(document.body,
//     sanitizeHtmlAssertUnchanged(PAYLOAD)) - Add new import: import
//     {setElementOuterHtml} from 'safevalues/dom'; - Add new import: import
//     {sanitizeHtmlAssertUnchanged} from 'safevalues';
document.body.outerHTML += PAYLOAD;

// @expected-diagnostic TS21228: [tsetse] [ban-element-outerhtml-assignments]
//     Assigning directly to Element#outerHTML can result in XSS
//     vulnerabilities. Please either use a safe template system
//     (go/templatesystems), or create a SafeHtml value by sanitizing the HTML
//     and set the element's outerHTML property by using the DOM element's
//     setElementOuterHtml setter exported in 'safevalues/dom'. See
//     go/ts-dom-sink#safehtml for more details. Please use
//     go/tsconformance-yaqs if you have further questions. Suggested fix: -
//     Replace the full match with: setElementOuterHtml(document.body,
//     sanitizeHtmlAssertUnchanged(PAYLOAD)) - Add new import: import
//     {setElementOuterHtml} from 'safevalues/dom'; - Add new import: import
//     {sanitizeHtmlAssertUnchanged} from 'safevalues';
document.body['outerHTML'] = PAYLOAD;

// @expected-diagnostic TS21228: [tsetse] [ban-element-outerhtml-assignments]
//     Assigning directly to Element#outerHTML can result in XSS
//     vulnerabilities. Please either use a safe template system
//     (go/templatesystems), or create a SafeHtml value by sanitizing the HTML
//     and set the element's outerHTML property by using the DOM element's
//     setElementOuterHtml setter exported in 'safevalues/dom'. See
//     go/ts-dom-sink#safehtml for more details. Please use
//     go/tsconformance-yaqs if you have further questions. Suggested fix: -
//     Replace the full match with: setElementOuterHtml(document.body,
//     sanitizeHtmlAssertUnchanged('<span>hello</span>')) - Add new import:
//     import {setElementOuterHtml} from 'safevalues/dom'; - Add new import:
//     import {sanitizeHtmlAssertUnchanged} from 'safevalues';
document.body.outerHTML = '<span>hello</span>';
