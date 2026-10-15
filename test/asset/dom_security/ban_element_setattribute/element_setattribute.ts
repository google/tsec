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

// Generic type parameter and polymorphic `this` receivers are also matched.
function setGeneric<T extends Element>(el: T, name: string, value: string) {
  el.setAttribute(name, value);
}

class CustomEl extends HTMLElement {
  set(name: string, value: string) {
    this.setAttribute(name, value);
  }
}
