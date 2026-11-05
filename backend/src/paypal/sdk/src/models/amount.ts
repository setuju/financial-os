import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

export type Amount = {
  value: string;
  currency: string;
};

export const amountSchema: Schema<Amount> = s.object<Amount>({
  value: s.string(),
  currency: s.string(),
});
