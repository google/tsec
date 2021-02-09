const iframe = document.createElement('iframe');

// Writing to srcdoc causes an error.
iframe.srcdoc = 'foo';

const PAYLOAD: string = 'payload';
iframe.srcdoc = PAYLOAD;
iframe.srcdoc = `decorated ${PAYLOAD}`;
iframe.srcdoc += `decorated ${PAYLOAD}`;
iframe['srcdoc'] = PAYLOAD;
iframe.srcdoc = '<span>hello</span>';

// Reading srcdoc is okay.
const srcdoc = iframe.srcdoc;
