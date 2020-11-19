# tsec - Extended TypeScript compiler checking Trusted Types compatibility

**This is not an officially supported Google product.**

tsec is a wrapper for the official TypeScript compiler tsc with additional
checks on the codebase's compatibility with
[Trusted Types](https://github.com/w3c/webappsec-trusted-types).

tsec supports most compilation flags as tsc does. For code pattern patterns that
is potentially incompatible with Trusted Types, tsec emits compilation errors.

tsec is based on the open source TypeScript static analyzer
[tsetse](https://tsetse.info/).

## Supported checks

tsec perform a basket of security checks to find possible XSS issues in your
code. In particular, the checks ban using dangerous DOM sink APIs with plain
string values. Any violation of the checks can hinder Trusted Types adoption
either directly or indirectly. To fix the violations, you should construct
Trusted Types values to feed into these sinks. At the moment, tsec covers most
of the Trusted Types sinks that are enforced by the browser. See
[here](docs/supported-checks.md) for the complete list of available checks. We
will be adding the missing ones soon.

## Build and run

### Build

```
  # Clone the repository
  git clone https://github.com/googleinterns/tsec
  cd tsec

  # Install dependencies
  npm install

  # Build
  npm run build
```

### Run

To run a check for the compatibility with Trusted Types in the project
containing `tsconfig.json` use: `{PATH_TO_TSEC}/bin/tsec -p tsconfig.json` Add
`--noEmit` flag to skip emitting JS code from compilation.

## Configure exemptions

You can configure tsec to exempt certain violations. Add a
"conformanceExemptionPath" field in the `tsconfig.json` file of your project.
The value of that field is a string indicating the path to the exemption list,
relative to the path of `tsconfig.json`.

The exemption list is a JSON file of which each entry is the name of a rule. The
value of the entry is a list of files that you would like to exempt from that
rule.

Here is an example. Suppose you have a file `src/foo.ts` in your project that
triggers the following error from tsec:

```
src/foo.ts:10:5 - error TS21228: Assigning directly to Element#innerHTML can result in XSS vulnerabilities.

10     element.innerHTML = someVariable;
       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```

You can exempt it by creating an `exemption_list.json` file along side your
`tsconfig.json` with the following content:

```json
{
  "ban-element-innerhtml-assignments": ["src/foo.ts"]
}
```

Make sure you have the entry `json "conformanceExemptionPath":
"./exemption_list.json"` added in your `tsconfig.json`.

*Note that exemptions are granted at the file granularity. If you exempt a file
from a rule, all violations in that file will be exempted.*

## Trusted Type awareness in tsec rules

Using Trusted Types in TypeScript has
[a limitation](https://github.com/microsoft/TypeScript/issues/30024) and
currently you must use workarounds to TS compiler to bypass its checks. We've
implemented various patterns you can use in order to satisfy both `tsc` and
`tsec` rules.

#### Casting Trusted Type to unknown to string

For example:

```typescript
declare const trustedHTML: TrustedHTML;
// the next line will be allowed by both tsc and tsec
document.body.innerHTML = trustedHTML as unknown as string;
```

#### Using Trusted Type union with string and casting to string

For example:

```typescript
// such value can be created if application uses string as a fallback when
// Trusted Types are not enabled/supported
declare const trustedHTML: TrustedHTML | string;
// the next line will be allowed by both tsc and tsec
document.body.innerHTML = trustedHTML as string;
```

#### Using unwrapper function

The first argument to the unwrapper function must be the Trusted Type that is
required by the specific sink and must return value accepted by the sink
(string). The unwrapper function can have additional arguments or even accept TS
union of values for the first parameter.

For example:

```typescript
declare const trustedHTML: TrustedHTML;
declare const unwrapHTML: (html: TrustedHTML, ...other: any[]) => string;
// the next line will be allowed by both tsc and tsec
document.body.innerHTML = unwrapHTML(trustedHTML);
```

Note: All of these variants must be at the assignment/call of the particular
sink and not before. For example:

```typescript
declare const trustedHTML: TrustedHTML;
// cast before the actual usage in sink
const castedTrustedHTML = trustedHTML as unknown as string;
// tsec is flow insensitive and treats `castedTrustedHTML` as a regular string
document.body.innerHTML = castedTrustedHTML; // tsec violation!
```

## Language service plugin

Tsec can be integrated as a plugin to your TypeScript project allowing you to
see the violations directly in your IDE. For this to work you need to:

1.  Use workspace version of TypeScript

2.  Add the plugin via
    [plugins](https://www.typescriptlang.org/tsconfig#plugins) compiler option
    in the tsconfig. If you are using tsec as a package then the path to the
    plugin might look like this:

    ```jsonc
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

Make sure the LSP is using (requiring) the same workspace version of TS used by
the IDE.

### Debugging

Language service plugin is experimental, if it doesn't work, you can create an
issue or try to debug locally. If you are using VSCode you can do so by
following these steps:

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
