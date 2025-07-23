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

/** Names of all Trusted Types */
export type TrustedTypes = 'TrustedHTML' | 'TrustedScript' | 'TrustedScriptURL';
/**
 * Trusted Types configuration used to match Trusted values in the assignments
 * to sinks.
 */
export interface TrustedTypesConfig {
  allowAmbientTrustedTypesDeclaration: boolean;
  /**
   * A characteristic component of the absolute path of the definition file.
   */
  modulePathMatcher: string;
  /**
   * The fully qualified name of the trusted type to allow. E.g.
   * "global.TrustedHTML".
   */
  typeName: TrustedTypes;
}

/**
 * Create `TrustedTypesConfig` for the given Trusted Type.
 */
function createDefaultTrustedTypeConfig(
  type: TrustedTypes,
): TrustedTypesConfig {
  const config = {
    allowAmbientTrustedTypesDeclaration: true,
    // the module path may look like
    // "/home/username/.../node_modules/@types/trusted-types/"
    modulePathMatcher: '/node_modules/@types/trusted-types/',
    typeName: type,
  };

  return config;
}

/**
 * Trusted Types configuration allowing usage of `TrustedHTML` for a given rule.
 */
export const TRUSTED_HTML = createDefaultTrustedTypeConfig('TrustedHTML');

/**
 * Trusted Types configuration allowing usage of `TrustedScript` for a given
 * rule.
 */
export const TRUSTED_SCRIPT = createDefaultTrustedTypeConfig('TrustedScript');

/**
 * Trusted Types configuration allowing usage of `TrustedScriptURL` for a given
 * rule.
 */
export const TRUSTED_SCRIPT_URL =
  createDefaultTrustedTypeConfig('TrustedScriptURL');
