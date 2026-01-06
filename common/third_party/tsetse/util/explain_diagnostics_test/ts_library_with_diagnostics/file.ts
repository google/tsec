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
 * A custom type that has common properties with HTMLScriptElement, and
 * additionally a non-standard property.
 */
class FooIntersection {
  src = '';
  innerHTML = '';
  nonStandardProperty = '';
}

/**
 * A custom type that has a subset of the properties of HTMLScriptElement.
 */
class FooSubset {
  src = '';
  innerHTML = '';
}

/**
 * A custom type that has no properties in common with HTMLScriptElement.
 */
class FooUnrelated {
  myProperty = '';
}

const div = document.createElement('div');
// Setting innerText on a div should not trigger a violation, but should
// evaluate the HTMLStyleElement and HTMLScriptElement#TextContent rules.
div.innerText = 'hello';

// Setting innerHTML on a div should trigger a violation.
div.innerHTML = 'hello';

// Setting innerHTML on a div as a more generic type should trigger a
// violation.
(div as HTMLElement).innerHTML = 'hello';

// Setting innerHTML on a union type that includes HTMLElement should trigger a
// violation.
(div as HTMLElement | Foo).innerHTML = 'hello';

// Setting innerHTML on a div cast to any should trigger a type match
// ANY_UNKNOWN. In google3, these matches fall under the confidence
// threshold, so they are silenced.
// tslint:disable-next-line:no-any
(div as any).innerHTML = 'hello';

// Setting src on a div cast to a custom type with a non-standard property
// should trigger a type match UNRELATED. In google3, these matches fall under
// the confidence threshold, so they are silenced.
// tslint:disable-next-line:no-any
(div as any as Foo).src = 'hello';
