export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'food' | 'groceries' | 'transport' | 'utilities' | 'shopping'
  | 'health' | 'fitness' | 'subscription' | 'entertainment' | 'education'
  | 'travel' | 'investment' | 'debt' | 'gift' | 'income' | 'donation' 
  | 'freelance' | 'bonus' | 'other';

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

const SUFFIX_MULTIPLIER: Record<string, number> = { jt: 1_000_000, juta: 1_000_000, rb: 1_000, ribu: 1_000, k: 1_000 };

function roundToCents(n: number): number { return Math.round(n * 100) / 100; }

function extractAmount(text: string): AmountMatch | null {
  const usdRe = /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/;
  const usdMatch = text.match(usdRe);
  if (usdMatch) { const num = parseFloat(usdMatch[1].replace(/,/g, '')); if (Number.isFinite(num) && num > 0) return { value: roundToCents(num), rawMatch: usdMatch[0] }; }

  const suffixRe = /(\d+(?:[.,]\d+)?)\s*(jt|juta|rb|ribu|k)\b/i;
  const suffixMatch = text.match(suffixRe);
  if (suffixMatch) { const num = parseFloat(suffixMatch[1].replace(',', '.')); if (Number.isFinite(num) && num > 0) return { value: Math.round(num * SUFFIX_MULTIPLIER[suffixMatch[2].toLowerCase()]), rawMatch: suffixMatch[0] }; }

  const idrThousandRe = /\b(\d{1,3}(?:\.\d{3}){2,}(?:,\d+)?)\b/;
  const idrMatch = text.match(idrThousandRe);
  if (idrMatch) { const num = parseFloat(idrMatch[1].replace(/\./g, '').replace(',', '.')); if (Number.isFinite(num) && num > 0) return { value: Math.round(num), rawMatch: idrMatch[0] }; }

  const usThousandRe = /\b(\d{1,3}(?:,\d{3})+)\b/;
  const usMatch = text.match(usThousandRe);
  if (usMatch) { const num = parseFloat(usMatch[1].replace(/,/g, '')); if (Number.isFinite(num) && num > 0) return { value: roundToCents(num), rawMatch: usMatch[0] }; }

  const plainRe = /\b(\d+(?:[.,]\d+)?)\b/;
  const plainMatch = text.match(plainRe);
  if (plainMatch) { const num = parseFloat(plainMatch[1].replace(',', '.')); if (Number.isFinite(num) && num > 0) return { value: roundToCents(num), rawMatch: plainMatch[0] }; }
  return null;
}

const NEGATION_RES: RegExp[] = [/\b(?:cancel(?:led|ed)?|forget it|never ?mind|change my mind|scrap that|no longer|no thanks|no need)\b/i];
const INTENT_RES: RegExp[] = [/\b(?:want to|wanna|plan to|planning to|would like to|i'?d like to|hoping to|hope to)\b/i, /\b(?:hopefully|maybe i|might buy|perhaps i)\b/i];

function detectNegation(text: string): boolean { return NEGATION_RES.some((re) => re.test(text)); }
function detectIntent(text: string): boolean { return INTENT_RES.some((re) => re.test(text)); }

const INCOME_VERBS = ['gave me', 'gave', 'gifted', 'won', 'got', 'received', 'earned', 'deposited', 'salary', 'wage', 'paycheck', 'profit', 'dividend', 'interest', 'rent', 'royalty', 'grant', 'subsidy', 'allowance', 'bonus', 'cashback', 'refund', 'dapat', 'dikasih', 'gaji', 'menang', 'terima', 'income', 'revenue', 'get'];
const EXPENSE_VERBS = [
  'give to', 'give','spent', 'paid', 'bought', 'buy', 'purchase', 'purchased', 'cost', 'expense', 'outcome', 'bills', 'fee', 'tax', 'debt', 'loan', 'fine', 'premium', 'installment', 'pay', 'beli', 'bayar', 'jajan', 'keluar'];

function detectType(text: string): TransactionType {
  const lower = text.toLowerCase();
  let minIncomeIdx = Infinity;
  for (const v of INCOME_VERBS) { const idx = lower.indexOf(v); if (idx !== -1 && idx < minIncomeIdx) minIncomeIdx = idx; }
  let minExpenseIdx = Infinity;
  for (const v of EXPENSE_VERBS) { const idx = lower.indexOf(v); if (idx !== -1 && idx < minExpenseIdx) minExpenseIdx = idx; }

  // Prioritas: Jika ada kata kerja eksplisit, gunakan itu.
  // Jika tidak ada sama sekali, default ke expense.
  if (minIncomeIdx === Infinity && minExpenseIdx === Infinity) return 'expense';
  if (minIncomeIdx < minExpenseIdx) return 'income';
  return 'expense';
}

const CATEGORY_KEYWORDS: Record<Exclude<TransactionCategory, 'other'>, string[]> = {
  income: ['paycheck', 'salary', 'wage', 'deposit', 'gaji', 'upah', 'pendapatan', 'paypal'],
  freelance: ['freelance', 'design', 'project', 'contract', 'client'],
  bonus: ['bonus', 'thr', 'incentive', 'hadiah'],
  gift: ['gift', 'hadiah'],
  investment: ['dividend', 'interest', 'profit', 'stock', 'invest', 'saham', 'bunga', 'crypto', 'capital gain', 'yield'],
  debt: ['loan', 'debt', 'tax', 'fine', 'premium', 'installment', 'utang', 'pajak', 'denda', 'tagihan'],
  donation: ['donation', 'donate', 'charity', 'unicef', 'redcross', 'relief', 'donasi'],
  groceries: ['groceries', 'grocery', 'supermarket', 'safeway', 'trader joe', 'whole foods', 'pasar', 'sayur', 'buah', 'sembako'],
  food: ['makan', 'jajan', 'kopi', 'warteg', 'resto', 'restoran', 'nasi', 'minum', 'food', 'coffee', 'lunch', 'dinner', 'restaurant', 'meal', 'drink', 'cafe'],
  utilities: ['listrik', 'air', 'internet', 'pulsa', 'token', 'wifi', 'utilities', 'electricity', 'water', 'utility', 'bill', 'rent', 'sewa', 'pajak bumi'],
  shopping: ['belanja', 'shopee', 'tokopedia', 'baju', 'sepatu', 'bike', 'motor', 'mobil', 'shopping', 'clothes', 'shoes', 'shop', 'store', 'amazon', 'target', 'buy'],
  transport: ['bensin', 'grab', 'gojek', 'parkir', 'ojek', 'taksi', 'taxi', 'bus', 'kereta', 'transport', 'fuel', 'gas', 'uber', 'ride', 'commute'],
  travel: ['flight', 'hotel', 'airbnb', 'vacation', 'plane ticket', 'tiket pesawat', 'liburan', 'penerbangan'],
  fitness: ['planet fitness', 'gym', 'yoga', 'workout', 'sport', 'fitness'],
  health: ['obat', 'dokter', 'rumah sakit', 'klinik', 'health', 'medicine', 'doctor', 'pharmacy', 'hospital', 'dental'],
  entertainment: ['nonton', 'bioskop', 'cinema', 'game', 'entertainment', 'movie', 'concert', 'konser', 'netflix', 'spotify'],
  subscription: ['netflix', 'spotify', 'subscription', 'hulu', 'disney+', 'icloud', 'langganan'],
  education: ['buku', 'kursus', 'sekolah', 'kuliah', 'education', 'book', 'course', 'tuition', 'school', 'university']
};

function detectCategory(text: string, type: TransactionType): TransactionCategory {
  const lower = text.toLowerCase();
  
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

  // Prioritas kategori untuk EXPENSE (menghindari misklasifikasi)
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
