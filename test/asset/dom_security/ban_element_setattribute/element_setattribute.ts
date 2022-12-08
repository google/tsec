declare const elem: Element;
declare const attr: Attr;

elem.setAttribute('src', '');
elem.setAttribute('SRc', '');
elem.setAttributeNS(null, 'src', '');
elem.setAttributeNode(attr);
elem.setAttributeNodeNS(attr);

// Setting attributes that are not TT related is OK.
elem.setAttribute('data-custom', '');
elem.setAttribute('aria-label', '');
elem.setAttributeNS(null, 'data-custom', '');
elem.setAttributeNS(null, 'role', '');

// Only exempt real string literal attribute names.
elem.setAttribute('src' as 'data-custom', '');

// Renaming it is not allowed.
let renamed = elem.setAttribute;
renamed.call(elem, 'src', '');

// Renaming it is not allowed.
renamed = elem.setAttribute.bind(elem);
renamed('src', '');

// Renaming it is not allowed.
function grabMyRef(ref: Function) {
  return ref;
}
let renamedRef = grabMyRef(elem.setAttribute);
renamedRef.call(elem, 'src', '');
