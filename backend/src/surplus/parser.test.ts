/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : backend/src/surplus/parser.test.ts
 * │  Purpose   : Tests for English-only parser and family logic
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

import { describe, it, expect } from 'vitest';
import { parseTransaction } from './parser.js';

const FIXED_NOW = new Date('2026-11-04T00:00:00.000Z');

describe('parseTransaction — amount extraction', () => {
  it('parses "$20"', () => {
    const r = parseTransaction('spent $20', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.amount).toBe(20);
  });

  it('parses "$120.50"', () => {
    const r = parseTransaction('paid $120.50', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.amount).toBe(120.5);
  });

  it('parses "$1,500"', () => {
    const r = parseTransaction('rent $1,500', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.amount).toBe(1500);
  });

  it('parses plain "5000"', () => {
    const r = parseTransaction('spent 5000', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.amount).toBe(5000);
  });

  it('rejects IDR format "1.250.000"', () => {
    const r = parseTransaction('spent 1.250.000', FIXED_NOW);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('idr_not_supported');
  });

  it('rejects IDR format "20rb"', () => {
    const r = parseTransaction('spent 20rb', FIXED_NOW);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('idr_not_supported');
  });
});

describe('parseTransaction — type detection', () => {
  it('detects income', () => {
    const r = parseTransaction('received 500 bonus', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.type).toBe('income');
  });

  it('detects expense', () => {
    const r = parseTransaction('spent 20 on coffee', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.type).toBe('expense');
  });
});

describe('parseTransaction — category detection', () => {
  it('detects food', () => {
    const r = parseTransaction('spent 20 on coffee', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.category).toBe('food');
  });

  it('detects transport', () => {
    const r = parseTransaction('paid 100 for gas', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.category).toBe('transport');
  });

  it('defaults to other', () => {
    const r = parseTransaction('paid something 100', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.category).toBe('other');
  });
});

describe('parseTransaction — family members logic', () => {
  it('sets income from mom to pocket_money', () => {
    const r = parseTransaction('got 100 from mom', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.category).toBe('pocket_money');
  });

  it('sets expense to brother to gift', () => {
    const r = parseTransaction('give to brother 100', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.category).toBe('gift');
  });

  it('sets income from nephew to pocket_money', () => {
    const r = parseTransaction('received 100 from my nephew', FIXED_NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tx.category).toBe('pocket_money');
  });
});

describe('parseTransaction — error handling', () => {
  it('rejects empty string', () => {
    const r = parseTransaction('', FIXED_NOW);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('invalid_input');
  });

  it('rejects string without amount', () => {
    const r = parseTransaction('hello how are you', FIXED_NOW);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('no_amount');
  });
});
