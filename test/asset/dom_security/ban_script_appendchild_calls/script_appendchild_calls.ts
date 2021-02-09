// direct call
const script = document.createElement('script');
script.appendChild(document.createTextNode('alert("XSS!");'));

// indirect call
const ac = script.appendChild.bind(script);
ac(document.createTextNode('alert("XSS!");'));

// appendChild on other elements is OK to use
const p = document.createElement('p');
p.appendChild(document.createElement('h1'));
