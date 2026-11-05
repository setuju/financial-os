import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

export type ErrorError = {
  name?: string;
  message?: string;
  debugId?: string;
  details?: Record<string, unknown>[];
};

export const errorErrorSchema: Schema<ErrorError> = s.object<ErrorError>({
  name: s.optional(s.string()),
  message: s.optional(s.string()),
  debugId: s.optional(s.string()),
  details: s.optional(s.array(s.record(s.string(), s.unknown()))),
  _keysMap: {
    debugId: "debug_id",
  },
});
