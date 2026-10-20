// direct call
const script = document.createElement('script');
// @expected-diagnostic TS21228: [tsetse] [ban-script-appendchild-calls] Do not
//     use HTMLScriptElement#appendChild because it is similar to eval and can
//     cause code-injection security vulnerabilities. See
//     go/ts-dom-sink#safescript-executable-code-snippets. Please use
//     go/tsconformance-yaqs if you have further questions.
script.appendChild(document.createTextNode('alert("XSS!");'));

// indirect call
// @expected-diagnostic TS21228: [tsetse] [ban-script-appendchild-calls] Do not
//     use HTMLScriptElement#appendChild because it is similar to eval and can
//     cause code-injection security vulnerabilities. See
//     go/ts-dom-sink#safescript-executable-code-snippets. Please use
//     go/tsconformance-yaqs if you have further questions.
const ac = script.appendChild.bind(script);
ac(document.createTextNode('alert("XSS!");'));

// appendChild on other elements is OK to use
const p = document.createElement('p');
p.appendChild(document.createElement('h1'));
