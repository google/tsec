declare const elem: Element;
declare const attr: Attr;

// @expected-diagnostic TS21228: [tsetse] [ban-element-setattribute] Do not use
//     Element#setAttribute or similar APIs, as this can lead to XSS or cause
//     Trusted Types violations. Use the safevalues or dataset APIs to set the
//     properties. See go/ts-dom-sink#setattribute for details. Please use
//     go/tsconformance-yaqs if you have further questions.
elem.setAttribute('src', '');
// @expected-diagnostic TS21228: [tsetse] [ban-element-setattribute] Do not use
//     Element#setAttribute or similar APIs, as this can lead to XSS or cause
//     Trusted Types violations. Use the safevalues or dataset APIs to set the
//     properties. See go/ts-dom-sink#setattribute for details. Please use
//     go/tsconformance-yaqs if you have further questions.
elem.setAttribute('SRc', '');
// @expected-diagnostic TS21228: [tsetse] [ban-element-setattribute] Do not use
//     Element#setAttribute or similar APIs, as this can lead to XSS or cause
//     Trusted Types violations. Use the safevalues or dataset APIs to set the
//     properties. See go/ts-dom-sink#setattribute for details. Please use
//     go/tsconformance-yaqs if you have further questions.
elem.setAttributeNS(null, 'src', '');
// @expected-diagnostic TS21228: [tsetse] [ban-element-setattribute] Do not use
//     Element#setAttribute or similar APIs, as this can lead to XSS or cause
//     Trusted Types violations. Use the safevalues or dataset APIs to set the
//     properties. See go/ts-dom-sink#setattribute for details. Please use
//     go/tsconformance-yaqs if you have further questions.
elem.setAttributeNode(attr);
// @expected-diagnostic TS21228: [tsetse] [ban-element-setattribute] Do not use
//     Element#setAttribute or similar APIs, as this can lead to XSS or cause
//     Trusted Types violations. Use the safevalues or dataset APIs to set the
//     properties. See go/ts-dom-sink#setattribute for details. Please use
//     go/tsconformance-yaqs if you have further questions.
elem.setAttributeNodeNS(attr);

// Setting attributes that are not TT related is OK.
elem.setAttribute('data-custom', '');
elem.setAttribute('aria-label', '');
elem.setAttributeNS(null, 'data-custom', '');
elem.setAttributeNS(null, 'role', '');

// Only exempt real string literal attribute names.
// @expected-diagnostic TS21228: [tsetse] [ban-element-setattribute] Do not use
//     Element#setAttribute or similar APIs, as this can lead to XSS or cause
//     Trusted Types violations. Use the safevalues or dataset APIs to set the
//     properties. See go/ts-dom-sink#setattribute for details. Please use
//     go/tsconformance-yaqs if you have further questions.
elem.setAttribute('src' as 'data-custom', '');

// Renaming it is not allowed.
// @expected-diagnostic TS21228: [tsetse] [ban-element-setattribute] Do not use
//     Element#setAttribute or similar APIs, as this can lead to XSS or cause
//     Trusted Types violations. Use the safevalues or dataset APIs to set the
//     properties. See go/ts-dom-sink#setattribute for details. Please use
//     go/tsconformance-yaqs if you have further questions.
let renamed = elem.setAttribute;
renamed.call(elem, 'src', '');

// Renaming it is not allowed.
// @expected-diagnostic TS21228: [tsetse] [ban-element-setattribute] Do not use
//     Element#setAttribute or similar APIs, as this can lead to XSS or cause
//     Trusted Types violations. Use the safevalues or dataset APIs to set the
//     properties. See go/ts-dom-sink#setattribute for details. Please use
//     go/tsconformance-yaqs if you have further questions.
renamed = elem.setAttribute.bind(elem);
renamed('src', '');

// Renaming it is not allowed.
function grabMyRef(ref: Function) {
  return ref;
}
// @expected-diagnostic TS21228: [tsetse] [ban-element-setattribute] Do not use
//     Element#setAttribute or similar APIs, as this can lead to XSS or cause
//     Trusted Types violations. Use the safevalues or dataset APIs to set the
//     properties. See go/ts-dom-sink#setattribute for details. Please use
//     go/tsconformance-yaqs if you have further questions.
let renamedRef = grabMyRef(elem.setAttribute);
renamedRef.call(elem, 'src', '');

// Generic type parameter and polymorphic `this` receivers are also matched.
function setGeneric<T extends Element>(el: T, name: string, value: string) {
  // @expected-diagnostic TS21228: [tsetse] [ban-element-setattribute] Do not
  //     use Element#setAttribute or similar APIs, as this can lead to XSS or
  //     cause Trusted Types violations. Use the safevalues or dataset APIs to
  //     set the properties. See go/ts-dom-sink#setattribute for details. Please
  //     use go/tsconformance-yaqs if you have further questions.
  el.setAttribute(name, value);
}

class CustomEl extends HTMLElement {
  set(name: string, value: string) {
    // @expected-diagnostic TS21228: [tsetse] [ban-element-setattribute] Do not
    //     use Element#setAttribute or similar APIs, as this can lead to XSS or
    //     cause Trusted Types violations. Use the safevalues or dataset APIs to
    //     set the properties. See go/ts-dom-sink#setattribute for details.
    //     Please use go/tsconformance-yaqs if you have further questions.
    this.setAttribute(name, value);
  }
}
