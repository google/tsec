# tsec - Extended TypeScript compiler checking Trusted Types compatibility

**This is not an officially supported Google product.**

tsec is a wrapper for the official TypeScript compiler tsc with additional
checks on the codebase's compatibility with
[Trusted Types](https://github.com/w3c/webappsec-trusted-types).

tsec supports most compilation flags as tsc does. For code pattern patterns that
is potentially incompatible with Trusted Types, tsec emits compilation errors.

## Supported checks

tsec perform a basket of security checks to find possible XSS issues in your
code. In particular, the checks ban using dangerous DOM sink APIs with plain
string values. Any violation of the checks can hinder Trusted Types adoption
either directly or indirectly. To fix the violations, you should construct
Trusted Types values to feed into these sinks. At the moment, tsec covers most
of the Trusted Types sinks that are enforced by the browser. See
[here](docs/supported-checks.md) for the complete list of available checks. We
will be adding the missing ones soon.

## Run

First add tsec as a dev dependency of your TypeScript project.

```
  yarn add tsec --dev
```

Then choose the right configuration file to build the project with tsec and
check its Trusted Types compatibility.

```
  yarn tsec -p tsconfig.json
```

Add `--noEmit` flag to skip emitting JS code from compilation.

## Writing Trusted Type compatible code

At the moment, there is
[no official support](https://github.com/microsoft/TypeScript/issues/30024) for
Trusted Types in TypeScript, meaning it can be tricky to write code that passes
the checks of both `tsec` and the TS type checker. There are several solutions
to this problem.

#### Using the safevalues library

We have released the Trusted Types utility library
[safevalues](https://github.com/google/safevalues) to help developers write
TT-compatible code. Please refer to its documentation for details.

This is our recommended way to work with Trusted Types. All other workarounds
have some limitations, e.g., not supporting function sinks like the constructor
of `Worker`.

#### Workarounds without safevalues

##### Casting Trusted Type to unknown to string

For example:

```typescript
declare const trustedHTML: TrustedHTML;
// the next line will be allowed by both tsc and tsec
document.body.innerHTML = trustedHTML as unknown as string;
```

##### Using Trusted Type union with string and casting to string

For example:

```typescript
// such value can be created if application uses string as a fallback when
// Trusted Types are not enabled/supported
declare const trustedHTML: TrustedHTML | string;
// the next line will be allowed by both tsc and tsec
document.body.innerHTML = trustedHTML as string;
```

##### Using unwrapper function

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

##### Patching lib.dom.d.ts

We have seen some developers patching their local `lib.dom.d.ts` with Trusted
Types support. For example, you may redefine the `innerHTML` property like this
with TS 4.3 or above,

```diff
+interface TrustedHTML {}

 interface InnerHTML {
-    innerHTML: string;
+    get innerHTML(): string;
+    set innerHTML(innerHTML: string | TrustedHTML);
 }
```

With this patch, `declare const trusted: TrustedHTML; elem.innerHTML = trusted`
becomes valid code and no additional type casts are needed. In that case, *tsec
will no longer consider the previous workarounds as safe code*. Likewise, the
pattern below will be flagged by tsec since a string *may* flow into the sink:

```typescript
declare const trustedHtml: string | TrustedHTML;
elem.innerHTML = trustedHtml;
```

**Note:** We try to make tsec as smart as possible to recognize patched
`lib.dom.d.ts`, but the heuristics likely will not cover all setups. Also, your
local patch may not be compatible with official TT support from TypeScript in
the future. Therefore, we strongly discourage patching `lib.dom.d.ts`. Please
use the [safevalues](https://github.com/google/safevalues) library whenever
possible.

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
            "name": "tsec"
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

4.  Find `tsserver.log` inside the folder *(you can use `find` command line
    utility)* and open the file(s). There should be an error somewhere in the
    logs which should get you started.

## Configure exemptions

You can configure tsec to exempt certain violations. Add an "exemptionConfig"
option in the configuration for the tsec language service plugin. The value of
that field is a string indicating the path to the exemption list, relative to
the path of `tsconfig.json`. See an exemption below.

```jsonc
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "tsec",
        "exemptionConfig": "./exemption_list.json"
      }
    ]
  }
}
```

Note that although this configuration appears to be for the language service
plugin, it also works for the command line use of tsec.

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

The exemption list supports the glob syntax. For example, if you want to
completely disable a check, you can write:

```json
{
  "ban-element-innerhtml-assignments": ["**/*.ts"]
}
```

*Note that exemptions are granted at the file granularity. If you exempt a file
from a rule, all violations in that file will be exempted.*

You can exempt files from all rules by setting the exemption list for the
wildcard rule name `"*"`. This can be useful when the compiler configuration of
your project include files for testing.

```json
{
  "*": ["**/test/*.ts", "**/*.test.ts", "**/*.spec.ts"]
}
```

## Developing locally

We recommend developing using [VS Code](https://code.visualstudio.com/). We have
preconfigured the project such that debugging works out of the box. If you press
F5 *(Debug: Start debugging)* `tsec` will be freshly built and executed on the
project files *(files included in tsconfig)*. Currently, we have tests only
internally at Google, but you can create a `test.ts` file with some violationg
code anywhere in the project to get started. You can then add breakpoints in any
tsec source file.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
