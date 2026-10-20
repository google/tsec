const iframe = document.createElement('iframe');

// Writing to srcdoc causes an error.
// @expected-diagnostic TS21228: [tsetse] [ban-iframe-srcdoc-assignments]
//     Assigning directly to HTMLIFrameElement#srcdoc can result in XSS
//     vulnerabilities. go/iframe-intents should safely cover most use-cases.
//     See go/iframe-security for more information, or go/ts-dom-sink#safehtml
//     for detail on constructing a SafeHtml. If you believe your use-case is
//     secure, add your target into the allowlist at
//     javascript/typescript/security_allowlists/iframe-srcdoc-assignments.bzl
//     Please use go/tsconformance-yaqs if you have further questions. Suggested
//     fix: - Replace the full match with: setIframeSrcdocWithIntent(iframe,
//     IframeIntent.FORMATTED_HTML_CONTENT, 'foo') - Add new import: import
//     {setIframeSrcdocWithIntent, IframeIntent} from 'safevalues/dom';
iframe.srcdoc = 'foo';

const PAYLOAD: string = 'payload';
// @expected-diagnostic TS21228: [tsetse] [ban-iframe-srcdoc-assignments]
//     Assigning directly to HTMLIFrameElement#srcdoc can result in XSS
//     vulnerabilities. go/iframe-intents should safely cover most use-cases.
//     See go/iframe-security for more information, or go/ts-dom-sink#safehtml
//     for detail on constructing a SafeHtml. If you believe your use-case is
//     secure, add your target into the allowlist at
//     javascript/typescript/security_allowlists/iframe-srcdoc-assignments.bzl
//     Please use go/tsconformance-yaqs if you have further questions. Suggested
//     fix: - Replace the full match with: setIframeSrcdocWithIntent(iframe,
//     IframeIntent.FORMATTED_HTML_CONTENT, PAYLOAD) - Add new import: import
//     {setIframeSrcdocWithIntent, IframeIntent} from 'safevalues/dom';
iframe.srcdoc = PAYLOAD;
// @expected-diagnostic TS21228: [tsetse] [ban-iframe-srcdoc-assignments]
//     Assigning directly to HTMLIFrameElement#srcdoc can result in XSS
//     vulnerabilities. go/iframe-intents should safely cover most use-cases.
//     See go/iframe-security for more information, or go/ts-dom-sink#safehtml
//     for detail on constructing a SafeHtml. If you believe your use-case is
//     secure, add your target into the allowlist at
//     javascript/typescript/security_allowlists/iframe-srcdoc-assignments.bzl
//     Please use go/tsconformance-yaqs if you have further questions. Suggested
//     fix: - Replace the full match with: setIframeSrcdocWithIntent(iframe,
//     IframeIntent.FORMATTED_HTML_CONTENT, `decorated ${PAYLOAD}`) - Add new
//     import: import {setIframeSrcdocWithIntent, IframeIntent} from
//     'safevalues/dom';
iframe.srcdoc = `decorated ${PAYLOAD}`;
// @expected-diagnostic TS21228: [tsetse] [ban-iframe-srcdoc-assignments]
//     Assigning directly to HTMLIFrameElement#srcdoc can result in XSS
//     vulnerabilities. go/iframe-intents should safely cover most use-cases.
//     See go/iframe-security for more information, or go/ts-dom-sink#safehtml
//     for detail on constructing a SafeHtml. If you believe your use-case is
//     secure, add your target into the allowlist at
//     javascript/typescript/security_allowlists/iframe-srcdoc-assignments.bzl
//     Please use go/tsconformance-yaqs if you have further questions. Suggested
//     fix: - Replace the full match with: setIframeSrcdocWithIntent(iframe,
//     IframeIntent.FORMATTED_HTML_CONTENT, `decorated ${PAYLOAD}`) - Add new
//     import: import {setIframeSrcdocWithIntent, IframeIntent} from
//     'safevalues/dom';
iframe.srcdoc += `decorated ${PAYLOAD}`;
// @expected-diagnostic TS21228: [tsetse] [ban-iframe-srcdoc-assignments]
//     Assigning directly to HTMLIFrameElement#srcdoc can result in XSS
//     vulnerabilities. go/iframe-intents should safely cover most use-cases.
//     See go/iframe-security for more information, or go/ts-dom-sink#safehtml
//     for detail on constructing a SafeHtml. If you believe your use-case is
//     secure, add your target into the allowlist at
//     javascript/typescript/security_allowlists/iframe-srcdoc-assignments.bzl
//     Please use go/tsconformance-yaqs if you have further questions. Suggested
//     fix: - Replace the full match with: setIframeSrcdocWithIntent(iframe,
//     IframeIntent.FORMATTED_HTML_CONTENT, PAYLOAD) - Add new import: import
//     {setIframeSrcdocWithIntent, IframeIntent} from 'safevalues/dom';
iframe['srcdoc'] = PAYLOAD;
// @expected-diagnostic TS21228: [tsetse] [ban-iframe-srcdoc-assignments]
//     Assigning directly to HTMLIFrameElement#srcdoc can result in XSS
//     vulnerabilities. go/iframe-intents should safely cover most use-cases.
//     See go/iframe-security for more information, or go/ts-dom-sink#safehtml
//     for detail on constructing a SafeHtml. If you believe your use-case is
//     secure, add your target into the allowlist at
//     javascript/typescript/security_allowlists/iframe-srcdoc-assignments.bzl
//     Please use go/tsconformance-yaqs if you have further questions. Suggested
//     fix: - Replace the full match with: setIframeSrcdocWithIntent(iframe,
//     IframeIntent.FORMATTED_HTML_CONTENT, '<span>hello</span>') - Add new
//     import: import {setIframeSrcdocWithIntent, IframeIntent} from
//     'safevalues/dom';
iframe.srcdoc = '<span>hello</span>';

// Reading srcdoc is okay.
const srcdoc = iframe.srcdoc;
