# tsec - Extended TypeScript compiler checking Trusted Types compatibility

**This is not an officially supported Google product.**

tsec is a wrapper for the official TypeScript compiler tsc with additional
checks on the codebase's compatibility with
[Trusted Types](https://github.com/w3c/webappsec-trusted-types).

tsec supports most compilation flags as tsc does. For code pattern patterns that
is potentially incompatible with Trusted Types, tsec emits compilation errors.

tsec is based on the open source TypeScript static analyzer
[Tsetse](https://tsetse.info/).

## Build and run

### Build
```
  # Clone the repository
  git clone https://github.com/googleinterns/tsec
  cd tsec
  
  # Install gulp
  npm install gulp
  
  # Install dependencies
  npm install
  
  # Run a compile based on tsconfig.json
  node_modules/typescript/bin/tsc 
  
```

### Run

To run a check for the compatibility with Trusted Types in the project containing `tsconfig.json` use:
```
  {PATH_TO_TSEC}/bin/tsec -p tsconfig.json
```
Add `--no-Emit` flag to skip the output from compilation.
