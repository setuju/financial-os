import { describe, it, expect } from 'vitest';
import { parseTransaction } from './parser.js';

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
