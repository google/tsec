const tt = 'tt' as unknown as TrustedScript;
setTimeout(tt as unknown as string);  // ban Trusted Types internally
