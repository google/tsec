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

import {Checker} from './checker';

/**
 * Tsetse rules should extend AbstractRule and provide a `register` function.
 * Rules are instantiated once per compilation operation and used across many
 * files.
 */
export abstract class AbstractRule {
  /**
   * A lower-dashed-case name for that rule. This is not used by Tsetse itself,
   * but the integrators might (such as the TypeScript Bazel rules, for
   * instance).
   */
  abstract readonly ruleName: string;
  abstract readonly code: number;

  /**
   * Registers handler functions on nodes in Checker.
   */
  abstract register(checker: Checker): void;
}
