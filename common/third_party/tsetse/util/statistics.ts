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
 * @fileoverview A collection of counters and runtime information used to
 * collect statistics about Tsetse.
 */

/**
 * Counter for the number of times the property matcher's typeMatches is called.
 */
export const PROPERTY_MATCHER_TYPE_CHECK_COUNTER =
  'tsetse_property_matcher_type_check';

/**
 * Counter for the number of times the property matcher returns
 * TypeMatchConfidence.ANY_UNKNOWN.
 */
export const PROPERTY_MATCHER_ANY_UNKNOWN_COUNTER =
  'tsetse_property_matcher_any_unknown';

/**
 * A class to collect and manage statistics using named counters.
 */
class StatsCollector {
  private readonly counters = new Map<string, number>();

  /**
   * Defines a new counter. If the counter already exists, this does nothing.
   * @param name The name of the counter.
   */
  defineCounter(name: string): void {
    if (!this.counters.has(name)) {
      this.counters.set(name, 0);
    }
  }

  /**
   * Increments a counter by a given delta. If the counter is not yet defined,
   * it will be initialized to the delta value.
   * @param name The name of the counter to increment.
   * @param delta The amount to increment by (defaults to 1).
   */
  incrementCounter(name: string, delta = 1): void {
    const currentValue = this.counters.get(name) || 0;
    this.counters.set(name, currentValue + delta);
  }

  /**
   * Gets the current value of a counter. Returns 0 if the counter is not defined.
   * @param name The name of the counter.
   * @return The current value of the counter.
   */
  getCounter(name: string): number {
    return this.counters.get(name) || 0;
  }

  /**
   * Returns a Map containing all defined counters and their current values.
   * @return A Map of counter names to their values.
   */
  getAllCounters(): ReadonlyMap<string, number> {
    return new Map(this.counters);
  }

  /**
   * Resets all counters to 0.
   */
  resetCounters(): void {
    this.counters.forEach((value, key) => {
      this.counters.set(key, 0);
    });
  }
}

/**
 * The singleton instance of StatsCollector.
 */
export const statsCollector = new StatsCollector();
