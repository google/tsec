const scriptElem = document.createElement('script');
// @expected-diagnostic TS21228: [tsetse] [ban-script-content-assignments] Do
//     not assign values to HTMLScriptElement#text or
//     HTMLScriptElement#textContent, as this can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets. Please use
//     go/tsconformance-yaqs if you have further questions. Suggested fix: -
//     Replace the full match with: setScriptTextContent(scriptElem,
//     safeScript`alert('XSS!');`) - Add new import: import
//     {setScriptTextContent} from 'safevalues/dom'; - Add new import: import
//     {safeScript} from 'safevalues';
scriptElem.text = `alert('XSS!');`;
// @expected-diagnostic TS21228: [tsetse] [ban-script-content-assignments] Do
//     not assign values to HTMLScriptElement#text or
//     HTMLScriptElement#textContent, as this can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets. Please use
//     go/tsconformance-yaqs if you have further questions. Suggested fix: -
//     Replace the full match with: setScriptTextContent(scriptElem,
//     safeScript`alert('XSS!');`) - Add new import: import
//     {setScriptTextContent} from 'safevalues/dom'; - Add new import: import
//     {safeScript} from 'safevalues';
scriptElem.textContent = `alert('XSS!');`;

// @expected-diagnostic TS21228: [tsetse] [ban-script-content-assignments] Do
//     not assign values to HTMLScriptElement#text or
//     HTMLScriptElement#textContent, as this can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets. Please use
//     go/tsconformance-yaqs if you have further questions. Suggested fix: -
//     Replace the full match with: setScriptTextContent(scriptElem,
//     safeScript`alert('XSS!');`) - Add new import: import
//     {setScriptTextContent} from 'safevalues/dom'; - Add new import: import
//     {safeScript} from 'safevalues';
scriptElem['text'] = `alert('XSS!');`;
// @expected-diagnostic TS21228: [tsetse] [ban-script-content-assignments] Do
//     not assign values to HTMLScriptElement#text or
//     HTMLScriptElement#textContent, as this can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets. Please use
//     go/tsconformance-yaqs if you have further questions. Suggested fix: -
//     Replace the full match with: setScriptTextContent(scriptElem,
//     safeScript`alert('XSS!');`) - Add new import: import
//     {setScriptTextContent} from 'safevalues/dom'; - Add new import: import
//     {safeScript} from 'safevalues';
scriptElem['textContent'] = `alert('XSS!');`;

const str = `${'alert'}${'("xss")'}`;
// @expected-diagnostic TS21228: [tsetse] [ban-script-content-assignments] Do
//     not assign values to HTMLScriptElement#text or
//     HTMLScriptElement#textContent, as this can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets. Please use
//     go/tsconformance-yaqs if you have further questions. Suggested fix: -
//     Replace the full match with: setScriptTextContent(scriptElem,
//     safeScript`${str}` /* FIXME: Construct from literals instead of `${str}`,
//     see the corresponding entries in go/ts-dom-sink. */) - Add new import:
//     import {setScriptTextContent} from 'safevalues/dom'; - Add new import:
//     import {safeScript} from 'safevalues';
scriptElem.text = str;
// @expected-diagnostic TS21228: [tsetse] [ban-script-content-assignments] Do
//     not assign values to HTMLScriptElement#text or
//     HTMLScriptElement#textContent, as this can lead to XSS. See
//     go/ts-dom-sink#safescript-executable-code-snippets. Please use
//     go/tsconformance-yaqs if you have further questions. Suggested fix: -
//     Replace the full match with: setScriptTextContent(scriptElem,
//     safeScript`${str}` /* FIXME: Construct from literals instead of `${str}`,
//     see the corresponding entries in go/ts-dom-sink. */) - Add new import:
//     import {setScriptTextContent} from 'safevalues/dom'; - Add new import:
//     import {safeScript} from 'safevalues';
scriptElem.textContent = str;

// writing text and textContent on other elements is safe.
const pElem = document.createElement('p');
pElem.textContent = 'hello world';

const aElem = document.createElement('a');
aElem.text = 'hello world';
