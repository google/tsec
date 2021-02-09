const trustedHTML = 'html' as unknown as TrustedHTML;
// For now, even Trusted Type assignment are banned. We prefer safe dom setters
// internally. This test verifies that we haven't enabled TT awareness
// internally (at least for this rule).
document.body.innerHTML = trustedHTML as unknown as string;
