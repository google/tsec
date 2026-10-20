// direct call banned
// @expected-diagnostic TS21228: [tsetse] [ban-trustedtypes-createpolicy]
//     Creating a Trusted Types policy requires a security review. See
//     go/restricted-apis#trusted-types-policies. Please use
//     go/tsconformance-yaqs if you have further questions.
window.trustedTypes?.createPolicy('test', {});

// indirect use banned
// tslint:disable:enforce-name-casing
// @expected-diagnostic TS21228: [tsetse] [ban-trustedtypes-createpolicy]
//     Creating a Trusted Types policy requires a security review. See
//     go/restricted-apis#trusted-types-policies. Please use
//     go/tsconformance-yaqs if you have further questions.
const cp = (
  window as unknown as {
    TrustedTypes?: TrustedTypePolicyFactory;
  }
).TrustedTypes?.createPolicy;
// tslint:enable:enforce-name-casing
if (cp) cp('test', {});
