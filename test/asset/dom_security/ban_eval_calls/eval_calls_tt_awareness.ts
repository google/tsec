const tt = 'tt' as unknown as TrustedScript;
eval(tt as unknown as string);            // ban Trusted Types internally
window['eval'](tt as unknown as string);  // ban Trusted Types internally
