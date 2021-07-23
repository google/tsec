// Writing to innerHTML causes an error.
document.body.innerHTML = 'foo' + location.hash;

// Reading innerHTML is okay.
const body = document.body.innerHTML;

document.body.innerHTML = `constant`;

const PAYLOAD: string = 'str';
const customObj = {
  innerHTML: 'custom'
};
customObj.innerHTML = PAYLOAD;

document.body.innerHTML += PAYLOAD;

document.body['innerHTML'] = PAYLOAD;

document.body.innerHTML = '<span>hello</span>';

document.body.shadowRoot!.innerHTML = PAYLOAD;
