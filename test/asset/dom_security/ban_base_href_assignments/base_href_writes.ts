const base = document.createElement('base');
// @expected-diagnostic TS21228: [tsetse] [ban-base-href-assignments] Do not
//     modify HTMLBaseElement#href elements, as this can compromise all other
//     efforts to sanitize unsafe URLs and lead to XSS. See
//     go/htmlcontract#base-blacklist for information. Please use
//     go/tsconformance-yaqs if you have further questions.
base.href = 'https://example.com';

// @expected-diagnostic TS21228: [tsetse] [ban-base-href-assignments] Do not
//     modify HTMLBaseElement#href elements, as this can compromise all other
//     efforts to sanitize unsafe URLs and lead to XSS. See
//     go/htmlcontract#base-blacklist for information. Please use
//     go/tsconformance-yaqs if you have further questions.
base['href'] = 'https://evil.com';

const CONST_HREF = 'href';
// @expected-diagnostic TS21228: [tsetse] [ban-base-href-assignments] Do not
//     modify HTMLBaseElement#href elements, as this can compromise all other
//     efforts to sanitize unsafe URLs and lead to XSS. See
//     go/htmlcontract#base-blacklist for information. Please use
//     go/tsconformance-yaqs if you have further questions.
base[CONST_HREF] = 'https://evil.com';

const STR_HREF: keyof HTMLBaseElement = 'href';
// @expected-diagnostic TS21228: [tsetse] [ban-base-href-assignments] Do not
//     modify HTMLBaseElement#href elements, as this can compromise all other
//     efforts to sanitize unsafe URLs and lead to XSS. See
//     go/htmlcontract#base-blacklist for information. Please use
//     go/tsconformance-yaqs if you have further questions.
base[STR_HREF] = 'https://evil.com';

// @expected-diagnostic TS21228: [tsetse] [ban-base-href-assignments] Do not
//     modify HTMLBaseElement#href elements, as this can compromise all other
//     efforts to sanitize unsafe URLs and lead to XSS. See
//     go/htmlcontract#base-blacklist for information. Please use
//     go/tsconformance-yaqs if you have further questions.
base[STR_HREF] += 'https://evil.com';

// Read is fine
const href = base.href;
