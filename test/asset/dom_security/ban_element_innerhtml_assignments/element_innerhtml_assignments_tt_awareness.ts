const trustedHTML = 'html' as unknown as TrustedHTML;
// For now, even Trusted Type assignment are banned. We prefer safe dom setters
// internally. This test verifies that we haven't enabled TT awareness
// internally (at least for this rule).
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
//     sanitizeHtmlAssertUnchanged(trustedHTML as unknown as string)) - Add new
//     import: import {setElementInnerHtml} from 'safevalues/dom'; - Add new
//     import: import {sanitizeHtmlAssertUnchanged} from 'safevalues';
document.body.innerHTML = trustedHTML as unknown as string;
