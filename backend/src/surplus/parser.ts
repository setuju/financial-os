/**
 * Anti-Budget parser: natural language (Bahasa Indonesia) → structured transaction.
 *
 * Pure, deterministic, no I/O. Unit-tested in parser.test.ts.
 *
 * Design notes:
 * - Amount regexes ordered most-specific first. Suffixed amounts (rb/jt) treat
 *   dot as decimal; unsuffixed with .NNN pattern treats dot as thousand sep.
 * - Type detected via verb dictionary; default expense when no verb matches.
 * - Category via keyword dictionary; default 'other'.
 * - rawText preserved verbatim for audit trail (Ethics #8 requirement).
 */

export type TransactionType = 'income' | 'expense';
export type TransactionCategory =
  | 'food' | 'transport' | 'utilities' | 'shopping'
  | 'health' | 'entertainment' | 'education' | 'other';

export interface ParsedTransaction {
  amount: number;          // positive, in IDR
  type: TransactionType;
  category: TransactionCategory;
  occurredAt: Date;
  rawText: string;         // verbatim input (ethics: transparency)
  source: 'rule';
}

export interface ParseError {
  ok: false;
  reason: 'no_amount' | 'invalid_input' | 'zero_amount';
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

function extractAmount(text: string): AmountMatch | null {
  // 1) number + suffix (rb/ribu/k/jt/juta): dot/comma is decimal
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

  // 2) Indonesian thousand separators: 1.250.000 or 1.250.000,50
  const thousandRe = /\b(\d{1,3}(?:\.\d{3})+(?:,\d+)?)\b/;
  const thousandMatch = text.match(thousandRe);
  if (thousandMatch) {
    const normalized = thousandMatch[1].replace(/\./g, '').replace(',', '.');
    const num = parseFloat(normalized);
    if (Number.isFinite(num) && num > 0) {
      return { value: Math.round(num), rawMatch: thousandMatch[0] };
    }
  }

  // 3) plain integer / decimal
  const plainRe = /\b(\d+(?:[.,]\d+)?)\b/;
  const plainMatch = text.match(plainRe);
  if (plainMatch) {
    const num = parseFloat(plainMatch[1].replace(',', '.'));
    if (Number.isFinite(num) && num > 0) {
      return { value: Math.round(num), rawMatch: plainMatch[0] };
    }
    if (num === 0) return null; // zero → invalid
  }

  return null;
}

// ---- Type detection ----

const INCOME_VERBS = [
  'dapat', 'terima', 'menerima', 'gaji', 'bonus', 'menang',
  'income', 'earn', 'earned', 'received', 'salary',
];

const EXPENSE_VERBS = [
  'beli', 'membeli', 'bayar', 'membayar', 'jajan', 'makan',
  'minum', 'isi', 'keluar', 'spend', 'spent', 'pay', 'paid', 'buy', 'bought',
];

function detectType(text: string): TransactionType {
  const lower = text.toLowerCase();
  for (const v of INCOME_VERBS) {
    if (lower.includes(v)) return 'income';
  }
  for (const v of EXPENSE_VERBS) {
    if (lower.includes(v)) return 'expense';
  }
  return 'expense'; // default
}

// ---- Category detection ----

const CATEGORY_KEYWORDS: Record<Exclude<TransactionCategory, 'other'>, string[]> = {
  food: ['makan', 'jajan', 'kopi', 'warteg', 'resto', 'restoran', 'nasi', 'minum', 'food', 'coffee', 'lunch', 'dinner'],
  transport: ['bensin', 'grab', 'gojek', 'parkir', 'ojek', 'taksi', 'taxi', 'bus', 'kereta', 'transport', 'fuel'],
  utilities: ['listrik', 'air', 'internet', 'pulsa', 'token', 'wifi', 'utilities', 'electricity', 'water'],
  shopping: ['belanja', 'shopee', 'tokopedia', 'baju', 'sepatu', 'shopping', 'clothes', 'shoes'],
  health: ['obat', 'dokter', 'rumah sakit', 'klinik', 'health', 'medicine', 'doctor'],
  entertainment: ['nonton', 'bioskop', 'netflix', 'spotify', 'game', 'entertainment', 'movie'],
  education: ['buku', 'kursus', 'sekolah', 'kuliah', 'education', 'book', 'course'],
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
