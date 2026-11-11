/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : backend/src/surplus/parser.ts
 * │  Purpose   : Rule-based English parser for transactions
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

export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'food' | 'groceries' | 'transport' | 'utilities' | 'shopping'
  | 'health' | 'fitness' | 'subscription' | 'entertainment' | 'education'
  | 'travel' | 'investment' | 'debt' | 'gift' | 'income' | 'donation'
  | 'freelance' | 'bonus' | 'pocket_money' | 'other';

export interface ParsedTransaction {
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  occurredAt: Date;
  rawText: string;
  source: string;
}

export type ParseResult =
  | { ok: true; tx: ParsedTransaction }
  | { ok: false; reason: string; rawText: string };

interface AmountMatch { value: number; rawMatch: string; }

function roundToCents(n: number): number { return Math.round(n * 100) / 100; }

const FAMILY_MEMBERS = [
  'mom', 'dad', 'mother', 'father', 'sister', 'brother', 'aunt', 'uncle',
  'niece', 'nephew', 'cousin', 'wife', 'husband', 'son', 'daughter',
  'grandma', 'grandpa', 'grandmother', 'grandfather'
];

function extractAmount(text: string): AmountMatch | null {
  const usdRe = /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/;
  const usdMatch = text.match(usdRe);
  if (usdMatch) { const num = parseFloat(usdMatch[1].replace(/,/g, '')); if (Number.isFinite(num) && num > 0) return { value: roundToCents(num), rawMatch: usdMatch[0] }; }

  const usThousandRe = /\b(\d{1,3}(?:,\d{3})+)\b/;
  const usMatch = text.match(usThousandRe);
  if (usMatch) { const num = parseFloat(usMatch[1].replace(/,/g, '')); if (Number.isFinite(num) && num > 0) return { value: roundToCents(num), rawMatch: usMatch[0] }; }

  const plainRe = /\b(\d+(?:\.\d{1,2})?)\b/;
  const plainMatch = text.match(plainRe);
  if (plainMatch) { const num = parseFloat(plainMatch[1]); if (Number.isFinite(num) && num > 0) return { value: roundToCents(num), rawMatch: plainMatch[0] }; }
  return null;
}

const NEGATION_RES: RegExp[] = [
  /\b(?:cancel(?:led|ed)?|forget it|never ?mind|change my mind|scrap that|no longer|no thanks|no need|dont|don't|do not|didn't|did not)\b/i,
];
const INTENT_RES: RegExp[] = [
  /\b(?:want to|wanna|plan to|planning to|would like to|i'?d like to|hoping to|hope to|going to|gonna)\b/i,
  /\b(?:hopefully|maybe i|might buy|perhaps i)\b/i,
];

function detectNegation(text: string): boolean { return NEGATION_RES.some((re) => re.test(text)); }
function detectIntent(text: string): boolean { return INTENT_RES.some((re) => re.test(text)); }

const INCOME_VERBS = ['gave me', 'gave', 'gifted', 'won', 'got', 'received', 'earned', 'deposited', 'salary', 'wage', 'paycheck', 'profit', 'dividend', 'interest', 'rent', 'royalty', 'grant', 'subsidy', 'allowance', 'bonus', 'cashback', 'refund', 'income', 'revenue', 'get'];
const EXPENSE_VERBS = ['give to', 'give','spent', 'paid', 'bought', 'buy', 'purchase', 'purchased', 'cost', 'expense', 'outcome', 'bills', 'fee', 'tax', 'debt', 'loan', 'fine', 'premium', 'installment', 'pay'];

function detectType(text: string): TransactionType {
  const lower = text.toLowerCase();
  let minIncomeIdx = Infinity;
  for (const v of INCOME_VERBS) { const idx = lower.indexOf(v); if (idx !== -1 && idx < minIncomeIdx) minIncomeIdx = idx; }
  let minExpenseIdx = Infinity;
  for (const v of EXPENSE_VERBS) { const idx = lower.indexOf(v); if (idx !== -1 && idx < minExpenseIdx) minExpenseIdx = idx; }

  if (minIncomeIdx === Infinity && minExpenseIdx === Infinity) return 'expense';
  if (minIncomeIdx < minExpenseIdx) return 'income';
  return 'expense';
}

const CATEGORY_KEYWORDS: Record<Exclude<TransactionCategory, 'other' | 'pocket_money'>, string[]> = {
  income: ['paycheck', 'salary', 'wage', 'deposit', 'paypal'],
  freelance: ['freelance', 'design', 'project', 'contract', 'client'],
  bonus: ['bonus', 'incentive'],
  gift: ['gift', 'present'],
  investment: ['dividend', 'interest', 'profit', 'stock', 'invest', 'crypto', 'capital gain', 'yield'],
  debt: ['loan', 'debt', 'tax', 'fine', 'premium', 'installment'],
  donation: ['donation', 'donate', 'charity', 'unicef', 'redcross', 'relief'],
  groceries: ['groceries', 'grocery', 'supermarket', 'safeway', 'trader joe', 'whole foods'],
  food: ['food', 'coffee', 'lunch', 'dinner', 'restaurant', 'meal', 'drink', 'cafe'],
  utilities: ['utilities', 'electricity', 'water', 'utility', 'bill', 'rent', 'internet'],
  shopping: ['shopping', 'clothes', 'shoes', 'shop', 'store', 'amazon', 'target', 'buy'],
  transport: ['taxi', 'bus', 'transport', 'fuel', 'gas', 'uber', 'ride', 'commute'],
  travel: ['flight', 'hotel', 'airbnb', 'vacation', 'plane ticket'],
  fitness: ['planet fitness', 'gym', 'yoga', 'workout', 'sport', 'fitness'],
  health: ['health', 'medicine', 'doctor', 'pharmacy', 'hospital', 'dental'],
  entertainment: ['cinema', 'game', 'entertainment', 'movie', 'concert', 'netflix', 'spotify'],
  subscription: ['subscription', 'hulu', 'disney+', 'icloud'],
  education: ['education', 'book', 'course', 'tuition', 'school', 'university']
};

function detectCategory(text: string, type: TransactionType): TransactionCategory {
  const lower = text.toLowerCase();

  // Family Members Logic (pocket_money / gift)
  if (FAMILY_MEMBERS.some(f => new RegExp(`\\b${f}\\b`, 'i').test(lower))) {
    if (type === 'income') return 'pocket_money';
    if (type === 'expense') return 'gift';
  }

  // Prioritas kategori untuk INCOME
  if (type === 'income') {
    const incomeKeys = ['freelance', 'bonus', 'gift', 'investment', 'income'];
    for (const key of incomeKeys) {
      if (CATEGORY_KEYWORDS[key as keyof typeof CATEGORY_KEYWORDS]?.some(kw => lower.includes(kw))) {
        return key as TransactionCategory;
      }
    }
    return 'income';
  }

  // Prioritas kategori untuk EXPENSE
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (cat === 'income' || cat === 'freelance' || cat === 'bonus' || cat === 'gift' || cat === 'investment') continue;
    for (const kw of keywords) {
      if (lower.includes(kw)) return cat as TransactionCategory;
    }
  }
  return 'other';
}

export function parseTransaction(rawText: string, now: Date = new Date()): ParseResult {
  if (typeof rawText !== 'string' || rawText.trim().length === 0) return { ok: false, reason: 'invalid_input', rawText: String(rawText) };
  
  // Strict English / USD only (Reject IDR)
  if (/(\d+)\s*(rb|ribu|jt|juta|k)\b/i.test(rawText) || /\b\d{1,3}(?:\.\d{3})+\b/.test(rawText)) {
    return { ok: false, reason: 'idr_not_supported', rawText };
  }

  const amount = extractAmount(rawText);
  if (!amount) return { ok: false, reason: 'no_amount', rawText };
  if (amount.value <= 0) return { ok: false, reason: 'zero_amount', rawText };
  if (detectNegation(rawText)) return { ok: false, reason: 'negated_input', rawText };
  if (detectIntent(rawText)) return { ok: false, reason: 'planned_input', rawText };

  const txType = detectType(rawText);
  const txCat = detectCategory(rawText, txType);

  return { ok: true, tx: { amount: amount.value, type: txType, category: txCat, occurredAt: now, rawText, source: 'rule' } };
}

export function parseMultipleTransactions(rawText: string, now: Date = new Date()): ParseResult[] {
  if (typeof rawText !== 'string' || rawText.trim().length === 0) return [{ ok: false, reason: 'invalid_input', rawText: String(rawText) }];
  const words = rawText.split(/\s+/);
  const chunks: string[] = [];
  let currentChunk: string[] = [];

  for (const word of words) {
    currentChunk.push(word);
    if (/\d/.test(word)) { chunks.push(currentChunk.join(' ')); currentChunk = []; }
  }
  if (currentChunk.length > 0) {
    if (chunks.length > 0) chunks[chunks.length - 1] += ' ' + currentChunk.join(' ');
    else chunks.push(currentChunk.join(' '));
  }
  if (chunks.length <= 1) return [parseTransaction(rawText, now)];

  const results: ParseResult[] = [];
  let lastType: TransactionType = 'expense';
  let lastCategory: TransactionCategory = 'other';

  for (const chunk of chunks) {
    const res = parseTransaction(chunk, now);
    if (res.ok) {
      const lower = chunk.toLowerCase();
      const hasVerb = [...INCOME_VERBS, ...EXPENSE_VERBS].some(v => lower.includes(v));

      if (!hasVerb && results.length > 0) {
        res.tx.type = lastType;
        res.tx.category = lastCategory;
      } else {
        lastType = res.tx.type;
        lastCategory = res.tx.category;
      }

      if (res.tx.type === 'income' && res.tx.category === 'other') res.tx.category = 'income';
      results.push(res);
    }
  }
  return results.length > 0 ? results : [parseTransaction(rawText, now)];
}
