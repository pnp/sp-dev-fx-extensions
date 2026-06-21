/**
 * External classification result with reason for debugging and advanced view.
 *
 * Semantics of `value`:
 * - `true`: Principal is external-looking based on available heuristics.
 * - `false`: Principal was checked and appears internal.
 * - `undefined`: Principal could not be classified because required metadata
 *   is missing or inconclusive. Must not be treated as internal.
 */
export type ExternalClassification =
  | {
      value: true;
      reason: "extLoginPattern" | "spoGuestLoginPattern";
    }
  | {
      value: false;
      reason: "noExternalIndicatorsFound";
    }
  | {
      value: undefined;
      reason: "missingLoginName" | "inconclusive";
    };
