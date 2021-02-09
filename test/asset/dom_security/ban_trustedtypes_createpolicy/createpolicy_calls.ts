// direct call banned
window.trustedTypes?.createPolicy('test', {});

// indirect use banned
// tslint:disable:enforce-name-casing
const cp = (window as unknown as {
             TrustedTypes?: TrustedTypePolicyFactory
           }).TrustedTypes?.createPolicy;
// tslint:enable:enforce-name-casing
if (cp) cp('test', {});
