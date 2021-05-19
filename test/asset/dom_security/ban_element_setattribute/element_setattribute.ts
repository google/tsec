declare const elem: Element;
declare const attr: Attr;

elem.setAttribute('src', '');
elem.setAttribute('SRc', '');
elem.setAttributeNS(null, 'src', '');
elem.setAttributeNode(attr);
elem.setAttributeNodeNS(attr);

// Setting attributes that are not security sensitive is OK.
elem.setAttribute('data-custom', '');
elem.setAttribute('role', '');

// Only exempt real string literal attribute names
elem.setAttribute('src' as 'data-custom', '');
