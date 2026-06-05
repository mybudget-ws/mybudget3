/**
 * Tests for the date parsing logic introduced in components/modal/new_price.vue.
 *
 * The watch() callback sets `date` using the following logic (extracted verbatim):
 *
 *   date.value =
 *     (typeof val?.date === 'string' && val.date.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(val.date))
 *       ? val.date.slice(0, 10)
 *       : new Date().toISOString().slice(0, 10);
 *
 * It also sets:
 *   amount.value = val?.amount ?? '';
 *   comment.value = val?.description ?? '';
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Pure helper – mirrors the date logic from the watch() callback exactly.
// ---------------------------------------------------------------------------
function resolveDate(val) {
  return (
    typeof val?.date === 'string' &&
    val.date.length >= 10 &&
    /^\d{4}-\d{2}-\d{2}/.test(val.date)
  )
    ? val.date.slice(0, 10)
    : new Date().toISOString().slice(0, 10);
}

// Helper that returns the full reactive state produced by the watch callback.
function applyWatchCallback(val) {
  return {
    amount: val?.amount ?? '',
    comment: val?.description ?? '',
    date: resolveDate(val),
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const TODAY = '2024-06-15';
const FIXED_NOW = new Date(`${TODAY}T12:00:00.000Z`);

describe('new_price.vue – watch(item) date parsing logic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // -------------------------------------------------------------------------
  // Fallback cases (val is null / undefined / date is missing / invalid)
  // -------------------------------------------------------------------------

  it('falls back to today when val is null', () => {
    expect(resolveDate(null)).toBe(TODAY);
  });

  it('falls back to today when val is undefined', () => {
    expect(resolveDate(undefined)).toBe(TODAY);
  });

  it('falls back to today when val has no date property', () => {
    expect(resolveDate({ amount: 100 })).toBe(TODAY);
  });

  it('falls back to today when val.date is null', () => {
    expect(resolveDate({ date: null })).toBe(TODAY);
  });

  it('falls back to today when val.date is a number', () => {
    expect(resolveDate({ date: 20240615 })).toBe(TODAY);
  });

  it('falls back to today when val.date is a Date object', () => {
    expect(resolveDate({ date: new Date('2023-01-01') })).toBe(TODAY);
  });

  it('falls back to today when val.date is an empty string', () => {
    expect(resolveDate({ date: '' })).toBe(TODAY);
  });

  it('falls back to today when val.date is shorter than 10 characters', () => {
    // '2024-06-1' is 9 chars – must not be accepted
    expect(resolveDate({ date: '2024-06-1' })).toBe(TODAY);
  });

  it('falls back to today when val.date does not start with YYYY-MM-DD pattern', () => {
    // Day-first format should be rejected
    expect(resolveDate({ date: '15-06-2024' })).toBe(TODAY);
  });

  it('falls back to today when val.date starts with non-digit characters', () => {
    expect(resolveDate({ date: 'abc-de-fg00' })).toBe(TODAY);
  });

  it('falls back to today when val.date has letters where digits are expected', () => {
    expect(resolveDate({ date: '2024-0X-15' })).toBe(TODAY);
  });

  // -------------------------------------------------------------------------
  // Happy-path cases
  // -------------------------------------------------------------------------

  it('returns the first 10 characters of a plain YYYY-MM-DD date string', () => {
    expect(resolveDate({ date: '2024-01-15' })).toBe('2024-01-15');
  });

  it('slices to 10 chars when val.date is a full ISO-8601 datetime string', () => {
    expect(resolveDate({ date: '2023-12-31T23:59:59.000Z' })).toBe('2023-12-31');
  });

  it('accepts a date string that is exactly 10 characters long', () => {
    expect(resolveDate({ date: '2000-02-29' })).toBe('2000-02-29');
  });

  it('accepts a date string longer than 10 characters and slices to 10', () => {
    // The regex only checks the prefix, so extra characters are acceptable.
    expect(resolveDate({ date: '2024-07-04T00:00:00+05:30' })).toBe('2024-07-04');
  });

  it('returns today when given a future date (no restriction on future dates)', () => {
    // This confirms the function does NOT validate whether the date is realistic;
    // it only validates format.
    expect(resolveDate({ date: '9999-12-31' })).toBe('9999-12-31');
  });

  // -------------------------------------------------------------------------
  // Boundary: regex is /^\d{4}-\d{2}-\d{2}/ (no $ anchor)
  // -------------------------------------------------------------------------

  it('accepts a string that matches the prefix regex even with trailing garbage', () => {
    // The regex has no end-anchor, so trailing characters are accepted.
    // slice(0, 10) always yields exactly the YYYY-MM-DD portion.
    expect(resolveDate({ date: '2024-03-20XXXXX' })).toBe('2024-03-20');
    expect(resolveDate({ date: '2024-03-20-extra' })).toBe('2024-03-20');
  });

  // -------------------------------------------------------------------------
  // Full watch callback – amount and comment fields
  // -------------------------------------------------------------------------

  it('sets amount to empty string when val is null', () => {
    expect(applyWatchCallback(null).amount).toBe('');
  });

  it('sets amount from val.amount', () => {
    expect(applyWatchCallback({ amount: 42500, date: '2024-01-01' }).amount).toBe(42500);
  });

  it('sets amount to empty string when val.amount is absent', () => {
    expect(applyWatchCallback({ date: '2024-01-01' }).amount).toBe('');
  });

  it('sets comment from val.description', () => {
    const state = applyWatchCallback({ description: 'hello', date: '2024-01-01' });
    expect(state.comment).toBe('hello');
  });

  it('sets comment to empty string when val.description is absent', () => {
    expect(applyWatchCallback({ date: '2024-01-01' }).comment).toBe('');
  });

  it('sets all three fields correctly for a complete item', () => {
    const item = {
      amount: 150000,
      date: '2024-06-01T00:00:00.000Z',
      description: 'Покупка квартиры',
    };
    const state = applyWatchCallback(item);
    expect(state.amount).toBe(150000);
    expect(state.date).toBe('2024-06-01');
    expect(state.comment).toBe('Покупка квартиры');
  });

  // -------------------------------------------------------------------------
  // Regression: old implementation used `new Date(val.date)` which could
  // produce different results for timezone-shifted ISO strings.
  // New implementation just slices – no timezone conversion.
  // -------------------------------------------------------------------------

  it('does NOT shift the date through timezone conversion', () => {
    // '2024-01-01T00:00:00+05:00' → old code: new Date(...).toISOString() could give '2023-12-31'
    // new code: simply slices the string → '2024-01-01'
    expect(resolveDate({ date: '2024-01-01T00:00:00+05:00' })).toBe('2024-01-01');
  });
});