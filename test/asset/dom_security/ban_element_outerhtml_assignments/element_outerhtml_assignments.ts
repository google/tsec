// Writing to outerHTML causes an error.
document.body.outerHTML = 'foo' + location.hash;

// Reading outerHTML is okay.
const body = document.body.outerHTML;

document.body.outerHTML = `constant`;

const PAYLOAD: string = 'str';
const customObj = {
  outerHTML: 'custom'
};
customObj.outerHTML = PAYLOAD;

document.body.outerHTML += PAYLOAD;

document.body['outerHTML'] = PAYLOAD;

document.body.outerHTML = '<span>hello</span>';
