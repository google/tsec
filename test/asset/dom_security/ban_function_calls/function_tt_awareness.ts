const tt = 'tt' as unknown as TrustedScript;
Function(tt as unknown as string);            // ban Trusted Types internally
window['Function'](tt as unknown as string);  // ban Trusted Types internally
