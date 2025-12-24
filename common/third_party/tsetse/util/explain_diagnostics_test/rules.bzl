"""Rule helper for testing tsetse's explain diagnostics feature."""

load("//javascript/typescript:build_defs.bzl", "ts_library")
load("//tools/build_defs/build_test:build_failure_golden_test.bzl", "build_failure_golden_test")
load("//tools/build_defs/build_test:build_failure_test.bzl", "BUILD_FAILURE_TAGS")

# This rule is meant to be used to test the explain diagnostics feature, and should not be used to
# check in other targets.
visibility([
    "//third_party/bazel_rules/rules_typescript/internal/tsetse/util/explain_diagnostics_test/...",
])

def _explain_diagnostics_ts_library_golden_test_rule_impl(
        name,
        srcs,
        deps,
        report_golden_file,
        visibility):  # buildifier: disable=unused-variable
    """Generate a golden test that validates tsetse's explain diagnostics report feature.

    This macro always uses the HEAD compiler.
    It never sets TESTONLY to keep conformance behavior as close to production as possible.

    Args:
      name: The name of the target.
      srcs: Source files for the ts_library target.
      deps: Dependencies for the ts_library.
      report_golden_file: A golden file to assert the build failure report against using a build_failure_golden_test.
      visibility: Ignored, but declared since its required to be consumed.
    """

    report_target_name = name + ".report"

    # This target is private and only to generate the conformance report for testing, compared to
    # the expected golden. It uses the HEAD compiler and the tsetse_explain_diagnostics tag to
    # enable the verbose tsetse report.
    ts_library(
        name = report_target_name,
        srcs = srcs,
        deps = deps,
        dts_generation_mode = "fast",
        tags = ["nobuilder", "notap", "manual"] + BUILD_FAILURE_TAGS + ["tsetse_explain_diagnostics"],
        # This target is only to be consumed by the golden test below, and
        # as this is a golden test we want to always use the HEAD compiler
        # regardless of whether the production check target is using it, so that
        # changes to the goldens must be reflected in the same CL that caused
        # the change. This does mean there is theoretically a skew window where
        # some analysis result in the golden doesn't reflect what is being
        # checked in the production checking, but we generally believe this to
        # be not particularly risky.
        compiler_from_head = True,
        # Nothing should ever depend on the report this target generates. This
        # is only for human consumption.
        # As this target is declared in a symbolic macro, setting private
        # visibility here also prevents this target from being used by other
        # targets in the same package.
        visibility = ["//visibility:private"],
        testonly = False,
    )

    build_failure_golden_test(
        name = report_target_name + "_test",
        target = ":" + report_target_name,
        mnemonic = "TypeScriptCompile",
        golden = report_golden_file.name,
        # Nothing should ever depend on the artifacts this generates. This
        # is only for human consumption.
        # As this target is declared in a symbolic macro, setting private
        # visibility here also prevents this target from being used by other
        # targets in the same package.
        visibility = ["//visibility:private"],
    )

explain_diagnostics_ts_library_golden_test = macro(
    attrs = {
        "srcs": attr.label_list(
            mandatory = True,
            allow_files = [".ts"],
            doc = "Source files for the ts_library target.",
            # configurable = False,
        ),
        "deps": attr.label_list(
            doc = "Dependencies for the TypeScript file.",
        ),
        "report_golden_file": attr.label(
            doc = "A golden file to assert the build failure report against using a build_failure_golden_test.",
            configurable = False,
            mandatory = False,
            allow_single_file = [".golden"],
        ),
    },
    implementation = _explain_diagnostics_ts_library_golden_test_rule_impl,
)
