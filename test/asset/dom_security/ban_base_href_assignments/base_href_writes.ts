const base = document.createElement('base');
base.href = 'https://example.com';

base['href'] = 'https://evil.com';

const CONST_HREF = 'href';
base[CONST_HREF] = 'https://evil.com';

const STR_HREF: keyof HTMLBaseElement = 'href';
base[STR_HREF] = 'https://evil.com';

base[STR_HREF] += 'https://evil.com';

// Read is fine
const href = base.href;
