// Writing to innerHTML causes an error.
// @expected-diagnostic TS21228: [tsetse] [ban-element-innerhtml-assignments]
//     Assigning directly to Element#innerHTML can result in XSS
//     vulnerabilities. If the assigned value does not contain HTML, assign it
//     to the DOM element's textContent property. Otherwise, please either use a
//     safe template system (go/templatesystems), or create a SafeHtml value by
//     sanitizing the HTML and set the element's innerHTML property by using the
//     DOM element's setInnerHtml setter exported in 'safevalues/dom'. See
//     go/ts-dom-sink#safehtml for more details. Please use
//     go/tsconformance-yaqs if you have further questions. Suggested fix: -
//     Replace the full match with: setElementInnerHtml(document.body,
//     sanitizeHtmlAssertUnchanged('foo' + location.hash)) - Add new import:
//     import {setElementInnerHtml} from 'safevalues/dom'; - Add new import:
//     import {sanitizeHtmlAssertUnchanged} from 'safevalues';
document.body.innerHTML = 'foo' + location.hash;

// Reading innerHTML is okay.
const body = document.body.innerHTML;

// @expected-diagnostic TS21228: [tsetse] [ban-element-innerhtml-assignments]
//     Assigning directly to Element#innerHTML can result in XSS
//     vulnerabilities. If the assigned value does not contain HTML, assign it
//     to the DOM element's textContent property. Otherwise, please either use a
//     safe template system (go/templatesystems), or create a SafeHtml value by
//     sanitizing the HTML and set the element's innerHTML property by using the
//     DOM element's setInnerHtml setter exported in 'safevalues/dom'. See
//     go/ts-dom-sink#safehtml for more details. Please use
//     go/tsconformance-yaqs if you have further questions. Suggested fix: -
//     Replace the full match with: document.body.textContent = `constant`
document.body.innerHTML = `constant`;

const PAYLOAD: string = 'str';
const customObj = {
  innerHTML: 'custom',
};
customObj.innerHTML = PAYLOAD;

// @expected-diagnostic TS21228: [tsetse] [ban-element-innerhtml-assignments]
//     Assigning directly to Element#innerHTML can result in XSS
//     vulnerabilities. If the assigned value does not contain HTML, assign it
//     to the DOM element's textContent property. Otherwise, please either use a
//     safe template system (go/templatesystems), or create a SafeHtml value by
//     sanitizing the HTML and set the element's innerHTML property by using the
//     DOM element's setInnerHtml setter exported in 'safevalues/dom'. See
//     go/ts-dom-sink#safehtml for more details. Please use
//     go/tsconformance-yaqs if you have further questions. Suggested fix: -
//     Replace the full match with: setElementInnerHtml(document.body,
//     sanitizeHtmlAssertUnchanged(PAYLOAD)) - Add new import: import
//     {setElementInnerHtml} from 'safevalues/dom'; - Add new import: import
//     {sanitizeHtmlAssertUnchanged} from 'safevalues';
document.body.innerHTML += PAYLOAD;

// @expected-diagnostic TS21228: [tsetse] [ban-element-innerhtml-assignments]
//     Assigning directly to Element#innerHTML can result in XSS
//     vulnerabilities. If the assigned value does not contain HTML, assign it
//     to the DOM element's textContent property. Otherwise, please either use a
//     safe template system (go/templatesystems), or create a SafeHtml value by
//     sanitizing the HTML and set the element's innerHTML property by using the
//     DOM element's setInnerHtml setter exported in 'safevalues/dom'. See
//     go/ts-dom-sink#safehtml for more details. Please use
//     go/tsconformance-yaqs if you have further questions. Suggested fix: -
//     Replace the full match with: setElementInnerHtml(document.body,
//     sanitizeHtmlAssertUnchanged(PAYLOAD)) - Add new import: import
//     {setElementInnerHtml} from 'safevalues/dom'; - Add new import: import
//     {sanitizeHtmlAssertUnchanged} from 'safevalues';
document.body['innerHTML'] = PAYLOAD;

// @expected-diagnostic TS21228: [tsetse] [ban-element-innerhtml-assignments]
//     Assigning directly to Element#innerHTML can result in XSS
//     vulnerabilities. If the assigned value does not contain HTML, assign it
//     to the DOM element's textContent property. Otherwise, please either use a
//     safe template system (go/templatesystems), or create a SafeHtml value by
//     sanitizing the HTML and set the element's innerHTML property by using the
//     DOM element's setInnerHtml setter exported in 'safevalues/dom'. See
//     go/ts-dom-sink#safehtml for more details. Please use
//     go/tsconformance-yaqs if you have further questions. Suggested fix: -
//     Replace the full match with: setElementInnerHtml(document.body,
//     sanitizeHtmlAssertUnchanged('<span>hello</span>')) - Add new import:
//     import {setElementInnerHtml} from 'safevalues/dom'; - Add new import:
//     import {sanitizeHtmlAssertUnchanged} from 'safevalues';
document.body.innerHTML = '<span>hello</span>';

// @expected-diagnostic TS21228: [tsetse] [ban-element-innerhtml-assignments]
//     Assigning directly to Element#innerHTML can result in XSS
//     vulnerabilities. If the assigned value does not contain HTML, assign it
//     to the DOM element's textContent property. Otherwise, please either use a
//     safe template system (go/templatesystems), or create a SafeHtml value by
//     sanitizing the HTML and set the element's innerHTML property by using the
//     DOM element's setInnerHtml setter exported in 'safevalues/dom'. See
//     go/ts-dom-sink#safehtml for more details. Please use
//     go/tsconformance-yaqs if you have further questions. Suggested fix: -
//     Replace the full match with:
//     setElementInnerHtml(document.body.shadowRoot!,
//     sanitizeHtmlAssertUnchanged(PAYLOAD)) - Add new import: import
//     {setElementInnerHtml} from 'safevalues/dom'; - Add new import: import
//     {sanitizeHtmlAssertUnchanged} from 'safevalues';
document.body.shadowRoot!.innerHTML = PAYLOAD;
