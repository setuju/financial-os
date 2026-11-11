/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : backend/src/surplus/parser.test.ts
 * │  Purpose   : Backend: parser.test
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

import { describe, it, expect } from 'vitest';
import { parseTransaction, parseMultipleTransactions } from './parser.js';

const FIXED_NOW = new Date('2026-11-04T00:00:00.000Z');

describe('parseTransaction — amount extraction', () => {
  it('parses "20ribu" as 20000', () => {
    const r = parseTransaction('saya jajan 20ribu', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.amount).toBe(20000);
  });

  it('parses "15rb" as 15000', () => {
    const r = parseTransaction('tadi dapat 15rb', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.amount).toBe(15000);
  });

  it('parses "50k" as 50000', () => {
    const r = parseTransaction('bayar parkir 50k', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.amount).toBe(50000);
  });

  it('parses "1.5jt" as 1500000', () => {
    const r = parseTransaction('gaji 1.5jt', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.amount).toBe(1500000);
  });

  it('parses "20.5rb" as 20500 (dot = decimal when suffix present)', () => {
    const r = parseTransaction('jajan 20.5rb', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.amount).toBe(20500);
  });

  it('parses "1.250.000" as 1250000 (dots = thousand sep, no suffix)', () => {
    const r = parseTransaction('bayar listrik 1.250.000', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.amount).toBe(1250000);
  });

  it('parses plain "5000" as 5000', () => {
    const r = parseTransaction('beli kopi 5000', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.amount).toBe(5000);
  });

  it('rounds "1.5rb" to 1500', () => {
    const r = parseTransaction('beli permen 1.5rb', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.amount).toBe(1500);
  });
});

describe('parseTransaction — type detection', () => {
  it('detects income: "saya dapat bonus 500rb"', () => {
    const r = parseTransaction('saya dapat bonus 500rb', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.type).toBe('income');
  });

  it('detects expense: "saya jajan 20ribu"', () => {
    const r = parseTransaction('saya jajan 20ribu', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.type).toBe('expense');
  });

  it('defaults to expense when no verb matches', () => {
    const r = parseTransaction('20ribu', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.type).toBe('expense');
  });

  it('detects income: "gaji 8jt"', () => {
    const r = parseTransaction('gaji 8jt', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.type).toBe('income');
  });
});

describe('parseTransaction — category detection', () => {
  it('detects food: "jajan kopi 20rb"', () => {
    const r = parseTransaction('jajan kopi 20rb', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.category).toBe('food');
  });

  it('detects transport: "bensin 100rb"', () => {
    const r = parseTransaction('bensin 100rb', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.category).toBe('transport');
  });

  it('detects utilities: "bayar listrik 500rb"', () => {
    const r = parseTransaction('bayar listrik 500rb', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.category).toBe('utilities');
  });

  it('defaults to other', () => {
    const r = parseTransaction('bayar sesuatu 100rb', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.category).toBe('other');
  });
});

describe('parseTransaction — error handling', () => {
  it('rejects empty string', () => {
    const r = parseTransaction('', FIXED_NOW);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('invalid_input');
  });

  it('rejects string without amount', () => {
    const r = parseTransaction('halo apa kabar', FIXED_NOW);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('no_amount');
  });

  it('preserves rawText verbatim (ethics: transparency)', () => {
    const input = 'Saya jajan 20ribu di Warteg';
    const r = parseTransaction(input, FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.rawText).toBe(input);
  });

  it('uses provided "now" for occurredAt', () => {
    const r = parseTransaction('jajan 20rb', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.occurredAt).toEqual(FIXED_NOW);
  });
});

// ---- USD amount format (new, added Sesi 10) ----

describe('parseTransaction — USD amount format', () => {
  it('parses "250.000" as 250.00 (single dot = decimal, USD)', () => {
    const r = parseTransaction('spent 250.000', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.amount).toBe(250);
  });

  it('parses explicit "$20" as 20', () => {
    const r = parseTransaction('spent $20 on coffee', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.amount).toBe(20);
  });

  it('parses "$120.50" as 120.5', () => {
    const r = parseTransaction('paid $120.50 for utilities', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.amount).toBe(120.5);
  });

  it('parses "$1,500" as 1500 (US comma)', () => {
    const r = parseTransaction('rent $1,500', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.amount).toBe(1500);
  });

  it('parses "$ 20" (space after $) as 20', () => {
    const r = parseTransaction('coffee $ 20', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.amount).toBe(20);
  });

  it('still parses "1.250.000" as 1250000 (multi-dot = IDR thousand)', () => {
    const r = parseTransaction('bayar listrik 1.250.000', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.amount).toBe(1250000);
  });

  it('still parses "20.5rb" as 20500 (suffix decimal)', () => {
    const r = parseTransaction('jajan 20.5rb', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.amount).toBe(20500);
  });
});

// ---- Negation detection (new, added Sesi 10) ----

describe('parseTransaction — negation rejected', () => {
  it('rejects "i dont want to buy the car $250000"', () => {
    const r = parseTransaction('i dont want to buy the car $250000', FIXED_NOW);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('negated_input');
  });

  it('rejects "...i change my mind"', () => {
    const r = parseTransaction('i bought car 250000 change my mind', FIXED_NOW);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('negated_input');
  });

  it('rejects "cancel that 20 coffee"', () => {
    const r = parseTransaction('cancel that 20 coffee', FIXED_NOW);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('negated_input');
  });

  it('rejects "never mind 50 dollars"', () => {
    const r = parseTransaction('never mind 50 dollars', FIXED_NOW);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('negated_input');
  });
});

// ---- Intent/plan detection (new, added Sesi 10) ----

describe('parseTransaction — intent/plan rejected', () => {
  it('rejects "i want to buy new car 250000"', () => {
    const r = parseTransaction('i want to buy new car 250000', FIXED_NOW);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('planned_input');
  });

  it('rejects "planning to save $500"', () => {
    const r = parseTransaction('planning to save $500', FIXED_NOW);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('planned_input');
  });

  it('rejects "hopefully i can pay 1000"', () => {
    const r = parseTransaction('hopefully i can pay 1000', FIXED_NOW);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('planned_input');
  });

  it('rejects "going to buy 20 coffee tomorrow"', () => {
    const r = parseTransaction('going to buy 20 coffee tomorrow', FIXED_NOW);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('planned_input');
  });

  it('rejects "i dont want to buy the car 250000, hopefully later"', () => {
    const r = parseTransaction('i dont want to buy the car 250000, hopefully later', FIXED_NOW);
    expect(r.ok).toBe(false);
    // Negation checked first, so wins over intent
    if (!r.ok) expect(r.reason).toBe('negated_input');
  });
});

// ---- Normal transactions still work ----

describe('parseTransaction — normal flow unaffected', () => {
  it('accepts "spent 20 on coffee"', () => {
    const r = parseTransaction('spent 20 on coffee', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.amount).toBe(20);
  });

  it('accepts "received 500 bonus"', () => {
    const r = parseTransaction('received 500 bonus', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.type).toBe('income');
  });

  it('accepts "paid 120 utilities"', () => {
    const r = parseTransaction('paid 120 utilities', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.category).toBe('utilities');
  });

  it('accepts "$20 for coffee" (no verb, defaults expense)', () => {
    const r = parseTransaction('$20 for coffee', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.tx.amount).toBe(20);
      expect(r.tx.type).toBe('expense');
      expect(r.tx.category).toBe('food');
    }
  });
});

describe('parseMultipleTransactions', () => {
  it('splits multiple expenses', () => {
    const res = parseMultipleTransactions('i buy groceries 500 and pay electricity bill 200');
    expect(res.length).toBe(2);
    expect(res[0].ok && res[0].tx.type).toBe('expense');
    expect(res[1].ok && res[1].tx.type).toBe('expense');
  });

  it('inherits context (Income to Income)', () => {
    const res = parseMultipleTransactions('i get money from momma 5000 from daddy 7000');
    expect(res.length).toBe(2);
    expect(res[0].ok && res[0].tx.type).toBe('income');
    expect(res[1].ok && res[1].tx.type).toBe('income'); // Context Inheritance
  });

  it('handles mixed income and expense', () => {
    const res = parseMultipleTransactions('salary 5000 buy laptop 1200');
    expect(res.length).toBe(2);
    expect(res[0].ok && res[0].tx.type).toBe('income');
    expect(res[1].ok && res[1].tx.type).toBe('expense');
  });
});
