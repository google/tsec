# Supported checks

<!-- mdformat off(compatibility with GitHub) -->

Rule Name                         | Checks Against
--------------------------------- | --------------
ban-base-href-assignments         | Assignments to `.href` on <base>
ban-document-write-calls          | Calls to `document.write`
ban-document-writeln-calls        | Calls to `document.writeln`
ban-eval-calls                    | Calls to `eval`
ban-element-innerhtml-assignments | Assignments to `.innerHTML` on any element
ban-element-outerhtml-assignments | Assignments to `.outerHTML` on any element
ban-element-srcdoc-assignments    | Assignments to `.srcdoc` on <iframe>
ban-script-appendchild-calls      | Calls to `.appendChild` on <script>
ban-script-content-assignments    | Assignments to `.text` and .textContent on <script>
ban-script-src-assignments        | Assignments to `.src` on <script>
ban-worker-calls                  | Calls to the constructor of `Worker`
ban-window-stringfunctiondef      | Calls to `setInternal` and `setTimeout` with strings as the first argument
ban-trustedtypes-createpolicy     | Calls to `TrustedTypePolicyFactory.createPolicy`

<!-- mdformat on -->
