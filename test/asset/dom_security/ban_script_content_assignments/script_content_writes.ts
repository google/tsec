const scriptElem = document.createElement('script');
scriptElem.text = `alert('XSS!');`;
scriptElem.textContent = `alert('XSS!');`;

scriptElem['text'] = `alert('XSS!');`;
scriptElem['textContent'] = `alert('XSS!');`;

const str = `${'alert'}${'("xss")'}`;
scriptElem.text = str;
scriptElem.textContent = str;


// writing text and textContent on other elements is safe.
const pElem = document.createElement('p');
pElem.textContent = 'hello world';

const aElem = document.createElement('a');
aElem.text = 'hello world';
