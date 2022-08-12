# Checks for detecting Trusted Types violations

<!-- mdformat off(compatibility with GitHub) -->

Rule Name                           | Checks Against
----------------------------------- | --------------
ban-base-href-assignments           | Assignments to `.href` on <base>
ban-document-execcommand            | Calls to `document.execCommand('insertHTML')`
ban-document-write-calls            | Calls to `document.write`
ban-document-writeln-calls          | Calls to `document.writeln`
ban-domparser-parsefromstring       | Calls to `DOMParser.parseFromString`
ban-eval-calls                      | Calls to `eval`
ban-element-innerhtml-assignments   | Assignments to `.innerHTML` on any element
ban-element-outerhtml-assignments   | Assignments to `.outerHTML` on any element
ban-element-insertadjacenthtml      | Calls to `.insertAdjacentHTML` on any element
ban-element-setattribute            | Calls to `.setAttribute` on any element with dangerous attribute names
ban-iframe-srcdoc-assignments       | Assignments to `.srcdoc` on <iframe>
ban-object-data-assignments         | Assignments to `.data` on <object>
ban-script-appendchild-calls        | Calls to `.appendChild` on <script>
ban-script-content-assignments      | Assignments to `.text` and `.textContent` on <script>
ban-script-src-assignments          | Assignments to `.src` on <script>
ban-shared-worker-calls             | Calls to the constructor of `SharedWorker`
ban-worker-calls                    | Calls to the constructor of `Worker`
ban-window-stringfunctiondef        | Calls to `setInternal` and `setTimeout` with strings as the first argument
ban-trustedtypes-createpolicy       | Calls to `TrustedTypePolicyFactory.createPolicy`
ban-range-createcontextualfragment  | Calls to `Range.createContextualFragment`
ban-serviceworkercontainer-register | Calls to `ServiceWorkerContainer.register`

<!-- mdformat on -->

# Support for the safevalues library

The [safevalues](https://github.com/google/safevalues) library offers a set of
APIs to construct Trusted Types. There are legitimate cases where these APIs are
not expressive enough or the migration is blocked by legacy issues. The library
offer some "unsafe" APIs to make exceptions for these cases, but uses of unsafe
APIs should be closely monitored and documented, which can be achieved by two
additional rules offered by tsec: "ban-legacy-conversions" and
"ban-reviewed-conversions".

Please see the safevalues
[documentations](https://github.com/google/safevalues#reviewed-and-legacy-conversions)
for details.
