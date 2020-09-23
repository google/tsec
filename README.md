# tsec - Extended TypeScript compiler checking Trusted Types compatibility

**This is not an officially supported Google product.**

tsec is a wrapper for the official TypeScript compiler tsc with additional
checks on the codebase's compatibility with
[Trusted Types](https://github.com/w3c/webappsec-trusted-types).

tsec supports most compilation flags as tsc does. For code pattern patterns that
is potentially incompatible with Trusted Types, tsec emits compilation errors.

tsec is based on the open source TypeScript static analyzer
[Tsetse](https://tsetse.info/).

## Language service plugin

Tsec can be integrated as a plugin to your TypeScript project allowing you to
see the violations directly in your IDE. For this to work you need to:

1.  Use workspace version of TypeScript

2.  Add the plugin via
    [plugins](https://www.typescriptlang.org/tsconfig#plugins) compiler option
    in the tsconfig. If you are using tsec as a package then the path to the
    plugin might look like this:

    ```json
    {
      "compilerOptions": {
        "plugins": [
          {
            // the path is relative to TS server, "../../" points to the root dir
            "name": "../../node_modules/tsec/lib/tsec_lib/language_service_plugin.js"
          }
        ]
      }
    }
    ```

3.  Restart the editor to reload TS initialization features.

### Debugging

If you do not see the violations in the IDE you can try debugging the issue
locally. If you are using VSCode follow these steps:

1.  Turn on `verbose` tsserver logging in the settings.

2.  Restart the IDE. You can use `Developer: Reload Window` command for this.

3.  Use `Developer: Open Logs Folder` to open the log folder

4.  Find `tsserver.log` inside the folder _(you can use `find` command line
    utility)_ and open the file(s). There should be an error somewhere in the
    logs which should get you started.

## Developing locally

We recommend developing using [VS Code](https://code.visualstudio.com/). We have
preconfigured the project such that debugging works out of the box. If you press
F5 _(Debug: Start debugging)_ `tsec` will be freshly built and executed on the
project files _(files included in tsconfig)_. Currently, we have tests only
internally at Google, but you can create a `test.ts` file with some violationg
code anywhere in the project to get started. You can then add breakpoints in any
tsec source file.

## Contributing

See
[CONTRIBUTING.md](https://github.com/googleinterns/tsec/blob/master/CONTRIBUTING.md).
