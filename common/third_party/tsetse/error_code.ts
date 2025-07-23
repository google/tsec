// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Error codes for tsetse checks.
 *
 * Start with 21222 and increase linearly.
 * The intent is for these codes to be fixed, so that tsetse users can
 * search for them in user forums and other media.
 */
export enum ErrorCode {
  CHECK_RETURN_VALUE = 21222,
  EQUALS_NAN = 21223,
  BAN_EXPECT_TRUTHY_PROMISE = 21224,
  MUST_USE_PROMISES = 21225,
  BAN_PROMISE_AS_CONDITION = 21226,
  PROPERTY_RENAMING_SAFE = 21227,
  CONFORMANCE_PATTERN = 21228,
  BAN_MUTABLE_EXPORTS = 21229,
  BAN_STRING_INITIALIZED_SETS = 21230,
  BAD_SIDE_EFFECT_IMPORT = 21232,
  BAN_AT_INTERNAL = 21233,
  ISOLATED_DECORATOR_METADATA = 21234,
}
