/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : backend/src/surplus/parser.ts
 * │  Purpose   : Backend: parser
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net
 * │  GitHub    : https://github.com/setuju
 * │  Website   : https://saturumah.net
 * │  Created   : 10-11-2026
 * │  License   : MIT
 * └────────────────────────────────────────────────────────────────────┘
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/backend
 * @license   MIT
 */

/**
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/backend
 * @license   MIT
 */

/**
 * Anti-Budget parser: natural language (EN + ID) → structured transaction.
 *
 * Pure, deterministic, no I/O. Unit-tested in parser.test.ts.
 *
 * Design notes:
 * - USD-first. Explicit $ amount wins. Suffix rules (rb/jt/k) still work
 *   for IDR backward compat. Multiple-dot pattern (1.250.000) treated as
 *   IDR thousand; single-dot (250.000) treated as USD decimal.
 * - Negation ("dont want", "change my mind", "cancel") → rejected.
 * - Intent ("want to", "plan to", "hopefully", "going to buy") → rejected.
 * - Type via verb dictionary; default expense when no verb matches.
 * - Category via keyword dictionary; default 'other'.
 * - rawText preserved verbatim (Ethics #8: transparency).
 */

export type TransactionType = 'income' | 'expense';
export type TransactionCategory =
  | 'food' | 'groceries' | 'transport' | 'utilities'
  | 'shopping' | 'health' | 'fitness' | 'subscription'
  | 'entertainment' | 'education' | 'travel' | 'other';

export interface ParsedTransaction {
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  occurredAt: Date;
  rawText: string;
  source: 'rule';
}

export type ParseErrorReason =
  | 'no_amount'
  | 'invalid_input'
  | 'zero_amount'
  | 'negated_input'
  | 'planned_input';

export interface ParseError {
  ok: false;
  reason: ParseErrorReason;
  rawText: string;
}

export type ParseResult =
  | { ok: true; tx: ParsedTransaction }
  | ParseError;

// ---- Amount extraction ----

interface AmountMatch {
  value: number;
  rawMatch: string;
}

const SUFFIX_MULTIPLIER: Record<string, number> = {
  jt: 1_000_000,
  juta: 1_000_000,
  rb: 1_000,
  ribu: 1_000,
  k: 1_000,
};

function roundToCents(n: number): number {
  return Math.round(n * 100) / 100;
}

function extractAmount(text: string): AmountMatch | null {
  // 0) Explicit USD: $20, $120.50, $1,500, $1,250,000.00
  const usdRe = /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/;
  const usdMatch = text.match(usdRe);
  if (usdMatch) {
    const num = parseFloat(usdMatch[1].replace(/,/g, ''));
    if (Number.isFinite(num) && num > 0) {
      return { value: roundToCents(num), rawMatch: usdMatch[0] };
    }
  }

  // 1) number + IDR suffix (rb/ribu/k/jt/juta): dot/comma is decimal
  const suffixRe = /(\d+(?:[.,]\d+)?)\s*(jt|juta|rb|ribu|k)\b/i;
  const suffixMatch = text.match(suffixRe);
  if (suffixMatch) {
    const num = parseFloat(suffixMatch[1].replace(',', '.'));
    if (Number.isFinite(num) && num > 0) {
      return {
        value: Math.round(num * SUFFIX_MULTIPLIER[suffixMatch[2].toLowerCase()]),
        rawMatch: suffixMatch[0],
      };
    }
  }

  // 2) IDR multiple-dot thousands: 1.250.000 (2+ groups only)
  const idrThousandRe = /\b(\d{1,3}(?:\.\d{3}){2,}(?:,\d+)?)\b/;
  const idrMatch = text.match(idrThousandRe);
  if (idrMatch) {
    const normalized = idrMatch[1].replace(/\./g, '').replace(',', '.');
    const num = parseFloat(normalized);
    if (Number.isFinite(num) && num > 0) {
      return { value: Math.round(num), rawMatch: idrMatch[0] };
    }
  }

  // 3) US comma thousands: 1,500 or 1,250,000
  const usThousandRe = /\b(\d{1,3}(?:,\d{3})+)\b/;
  const usMatch = text.match(usThousandRe);
  if (usMatch) {
    const num = parseFloat(usMatch[1].replace(/,/g, ''));
    if (Number.isFinite(num) && num > 0) {
      return { value: roundToCents(num), rawMatch: usMatch[0] };
    }
  }

  // 4) plain integer / decimal (250.000 = 250.00 in USD context)
  const plainRe = /\b(\d+(?:[.,]\d+)?)\b/;
  const plainMatch = text.match(plainRe);
  if (plainMatch) {
    const num = parseFloat(plainMatch[1].replace(',', '.'));
    if (Number.isFinite(num) && num > 0) {
      return { value: roundToCents(num), rawMatch: plainMatch[0] };
    }
    if (num === 0) return null;
  }

  return null;
}

// ---- Semantic guards ----

const NEGATION_RES: RegExp[] = [
  /\b(?:don'?t|do not|doesn'?t|does not|didn'?t|did not)\s+(?:want|need|buy|purchase|plan|get)\b/i,
  /\bnot\s+(?:buying|purchasing|going to buy|spending|getting)\b/i,
  /\b(?:cancel(?:led|ed)?|forget it|never ?mind|change my mind|scrap that|no longer|no thanks|no need)\b/i,
];

const INTENT_RES: RegExp[] = [
  /\b(?:want to|wanna|plan to|planning to|would like to|i'?d like to|hoping to|hope to)\b/i,
  /\b(?:going to|gonna|will)\s+(?:buy|purchase|pay|spend|get)\b/i,
  /\b(?:thinking (?:about|of) buying|considering buying)\b/i,
  /\b(?:hopefully|maybe i|might buy|perhaps i)\b/i,
];

function detectNegation(text: string): boolean {
  return NEGATION_RES.some((re) => re.test(text));
}
function detectIntent(text: string): boolean {
  return INTENT_RES.some((re) => re.test(text));
}

// ---- Type detection ----

const INCOME_VERBS = [
  'gave me', 'gave', 'gifted', 'won',
  'dapat', 'terima', 'menerima', 'gaji', 'bonus', 'menang',
  'income', 'earn', 'earned', 'received', 'receive', 'salary', 'refund',
];

const EXPENSE_VERBS = [
  'beli', 'membeli', 'bayar', 'membayar', 'jajan', 'makan',
  'minum', 'isi', 'keluar', 'spend', 'spent', 'pay', 'paid',
  'buy', 'bought', 'purchase', 'purchased',
];

function detectType(text: string): TransactionType {
  const lower = text.toLowerCase();
  for (const v of INCOME_VERBS) {
    if (lower.includes(v)) return 'income';
  }
  for (const v of EXPENSE_VERBS) {
    if (lower.includes(v)) return 'expense';
  }
  return 'expense';
}

// ---- Category detection ----

// Order matters — more specific categories checked first.
const CATEGORY_KEYWORDS: Record<Exclude<TransactionCategory, 'other'>, string[]> = {
  fitness: ['planet fitness', 'gym', 'yoga', 'workout', 'sport', 'fitness'],
  subscription: ['netflix', 'spotify', 'subscription', 'hulu', 'disney+'],
  travel: ['flight', 'hotel', 'airbnb', 'vacation', 'plane ticket', 'tiket pesawat'],
  groceries: ['groceries', 'grocery', 'supermarket', 'safeway', 'trader joe', 'whole foods', 'pasar', 'sayur', 'buah'],
  food: ['makan', 'jajan', 'kopi', 'warteg', 'resto', 'restoran', 'nasi', 'minum', 'food', 'coffee', 'lunch', 'dinner', 'grocer', 'restaurant', 'meal', 'drink'],
  transport: ['bensin', 'grab', 'gojek', 'parkir', 'ojek', 'taksi', 'taxi', 'bus', 'kereta', 'transport', 'fuel', 'gas', 'uber', 'ride'],
  utilities: ['listrik', 'air', 'internet', 'pulsa', 'token', 'wifi', 'utilities', 'electricity', 'water', 'utility', 'bill', 'rent'],
  shopping: ['belanja', 'shopee', 'tokopedia', 'baju', 'sepatu', 'shopping', 'clothes', 'shoes', 'shop', 'store'],
  health: ['obat', 'dokter', 'rumah sakit', 'klinik', 'health', 'medicine', 'doctor', 'pharmacy', 'hospital'],
  entertainment: ['nonton', 'bioskop', 'game', 'entertainment', 'movie', 'concert'],
  education: ['buku', 'kursus', 'sekolah', 'kuliah', 'education', 'book', 'course', 'tuition', 'school'],
};

function detectCategory(text: string): TransactionCategory {
  const lower = text.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return cat as TransactionCategory;
    }
  }
  return 'other';
}

// ---- Main parser ----

export function parseTransaction(
  rawText: string,
  now: Date = new Date(),
): ParseResult {
  if (typeof rawText !== 'string' || rawText.trim().length === 0) {
    return { ok: false, reason: 'invalid_input', rawText: String(rawText) };
  }

  const amount = extractAmount(rawText);
  if (!amount) {
    return { ok: false, reason: 'no_amount', rawText };
  }
  if (amount.value <= 0) {
    return { ok: false, reason: 'zero_amount', rawText };
  }

  // Semantic guards run AFTER amount (so error messages are more specific):
  // - "i dont want to buy X" has an amount X, but is a negation
  // - "i want to buy X" has an amount X, but is an intent (plan)
  if (detectNegation(rawText)) {
    return { ok: false, reason: 'negated_input', rawText };
  }
  if (detectIntent(rawText)) {
    return { ok: false, reason: 'planned_input', rawText };
  }

  return {
    ok: true,
    tx: {
      amount: amount.value,
      type: detectType(rawText),
      category: detectCategory(rawText),
      occurredAt: now,
      rawText,
      source: 'rule',
    },
  };
}

// ---- Multiple Parser (For complex sentences) ----
export function parseMultipleTransactions(
  rawText: string,
  now: Date = new Date(),
): ParseResult[] {
  if (typeof rawText !== 'string' || rawText.trim().length === 0) {
    return [{ ok: false, reason: 'invalid_input', rawText: String(rawText) }];
  }

  // Pisahkan berdasarkan kata hubung yang kuat atau tanda baca
  const clauses = rawText.split(/\b(?:and then|then|after that)\b|;|\.\s+/i)
    .map((c) => c.trim())
    .filter(Boolean);

  if (clauses.length <= 1) {
    return [parseTransaction(rawText, now)];
  }

  const results: ParseResult[] = [];
  for (const clause of clauses) {
    const res = parseTransaction(clause, now);
    // Jika klausa valid, ATAU jika gagal karena tidak ada angka (bukan error fatal), kita simpan
    if (res.ok || res.reason !== 'no_amount') {
      results.push(res);
    }
  }

  if (results.length === 0) {
    return [parseTransaction(rawText, now)];
  }

  return results;
}
