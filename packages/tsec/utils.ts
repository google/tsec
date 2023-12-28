// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * The proxy design pattern, allowing us to customize behavior of the delegate
 * object.
 * This creates a property-by-property copy of the functions of the object, so
 * it can be mutated without affecting other users of the original object. See
 * https://en.wikipedia.org/wiki/Proxy_pattern
 */
export function createProxy<T extends {}>(delegate: T): T {
  const proxy = Object.create(null);
  for (const [key, value] of Object.entries(delegate)) {
    if (typeof value === 'function') {
      proxy[key] = (...args: unknown[]) => value.apply(delegate, args);
    }
  }
  return proxy;
}
