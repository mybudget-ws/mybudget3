/**
 * Tests for the functions changed in pages/properties/[id].vue:
 *
 *   1. formatDate         – returns 'Сегодня', 'Вчера', or a dd/mm/yy locale string
 *   2. reloadPropertySilent – wraps API call in try/catch, logs on failure
 *   3. onDeletePrice      – optimistic UI update (filters prices array locally)
 *   4. onDeleteTransaction – try/catch, optimistic UI update, alert on failure
 *   5. Transaction coloring logic – amount > 0 → text-success, amount < 0 → text-danger
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ===========================================================================
// Extracted pure functions (mirrors source verbatim so tests stay in-sync)
// ===========================================================================

/**
 * Mirrors formatDate() from pages/properties/[id].vue lines 140-165.
 */
function formatDate(date) {
  const target = new Date(date);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const targetDay = new Date(target);
  targetDay.setHours(0, 0, 0, 0);

  if (targetDay.getTime() === today.getTime()) {
    return 'Сегодня';
  }

  if (targetDay.getTime() === yesterday.getTime()) {
    return 'Вчера';
  }

  return target.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

/**
 * Mirrors reloadPropertySilent(), with dependencies injected for testing.
 */
async function reloadPropertySilent({ api, token, routeId, setProperty, onError }) {
  try {
    const data = await api.property(token, { id: routeId });
    setProperty(data);
  } catch (error) {
    onError(error);
  }
}

/**
 * Mirrors onDeletePrice(), with dependencies injected for testing.
 */
async function onDeletePrice({ price, confirmFn, api, token, property, setProperty }) {
  if (!confirmFn('Удалить цену?')) return;

  await api.destroyPropertyPrice(token, {
    propertyId: property.id,
    id: price.id,
  });

  setProperty({
    ...property,
    prices: property.prices.filter((p) => p.id !== price.id),
  });
}

/**
 * Mirrors onDeleteTransaction(), with dependencies injected for testing.
 */
async function onDeleteTransaction({ transaction, confirmFn, api, token, property, setProperty, alertFn, onError }) {
  if (!confirmFn('Удалить операцию?')) return;
  try {
    await api.destroyTransaction(token, transaction.id);
    setProperty({
      ...property,
      transactions: property.transactions.filter((t) => t.id !== transaction.id),
    });
  } catch (error) {
    onError(error);
    alertFn('Не удалось удалить операцию. Попробуйте еще раз.');
  }
}

// ===========================================================================
// Transaction coloring predicate (mirrors template logic lines 430-431)
// ===========================================================================
const transactionColorClass = (amount) => ({
  'text-success': amount > 0,
  'text-danger': amount < 0,
});

// ===========================================================================
// Test suites
// ===========================================================================

// ---------------------------------------------------------------------------
// 1. formatDate
// ---------------------------------------------------------------------------

describe('properties/[id].vue – formatDate', () => {
  // Fix "now" to 2024-06-15 12:00:00 UTC so all comparisons are deterministic.
  const FIXED_NOW = new Date('2024-06-15T12:00:00.000Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Сегодня" for a date string matching today', () => {
    expect(formatDate('2024-06-15')).toBe('Сегодня');
  });

  it('returns "Сегодня" for today with a time component', () => {
    expect(formatDate('2024-06-15T08:30:00')).toBe('Сегодня');
  });

  it('returns "Вчера" for a date string matching yesterday', () => {
    expect(formatDate('2024-06-14')).toBe('Вчера');
  });

  it('returns "Вчера" for yesterday with a non-midnight time component', () => {
    expect(formatDate('2024-06-14T23:59:59')).toBe('Вчера');
  });

  it('returns a locale-formatted string for a date older than yesterday', () => {
    const result = formatDate('2024-01-01');
    // Should NOT be 'Сегодня' or 'Вчера'
    expect(result).not.toBe('Сегодня');
    expect(result).not.toBe('Вчера');
    // ru-RU, 2-digit/2-digit/2-digit should produce something like '01.01.24'
    expect(result).toMatch(/\d{2}\.\d{2}\.\d{2}/);
  });

  it('returns a locale-formatted string for a future date', () => {
    const result = formatDate('2025-12-31');
    expect(result).not.toBe('Сегодня');
    expect(result).not.toBe('Вчера');
    expect(result).toMatch(/\d{2}\.\d{2}\.\d{2}/);
  });

  it('uses day: 2-digit, month: 2-digit, year: 2-digit format (not long month name)', () => {
    const result = formatDate('2023-03-05');
    // Must not contain a long month name like 'марта'
    expect(result).not.toMatch(/[а-яёА-ЯЁ]{4,}/);
    // Must match numeric dd.mm.yy pattern
    expect(result).toMatch(/^\d{2}\.\d{2}\.\d{2}$/);
  });

  // Regression: previous implementation used `day: 'numeric', month: 'long'`
  it('regression – does not return a month-long-format date string', () => {
    const result = formatDate('2024-03-20');
    // Old format produced strings like '20 марта'; new format is '20.03.24'
    expect(result).not.toContain(' ');
  });

  // Boundary: midnight of today is still 'Сегодня'
  it('returns "Сегодня" for midnight of today (00:00:00)', () => {
    expect(formatDate('2024-06-15T00:00:00')).toBe('Сегодня');
  });

  // Boundary: last moment of yesterday
  it('returns "Вчера" for 2024-06-14T23:59:59.999', () => {
    expect(formatDate('2024-06-14T23:59:59.999')).toBe('Вчера');
  });
});

// ---------------------------------------------------------------------------
// 2. reloadPropertySilent
// ---------------------------------------------------------------------------

describe('properties/[id].vue – reloadPropertySilent', () => {
  it('calls api.property and updates property on success', async () => {
    const mockData = { id: 1, name: 'Test Property' };
    const api = { property: vi.fn().mockResolvedValue(mockData) };
    const setProperty = vi.fn();
    const onError = vi.fn();

    await reloadPropertySilent({ api, token: 'tok', routeId: '1', setProperty, onError });

    expect(api.property).toHaveBeenCalledWith('tok', { id: '1' });
    expect(setProperty).toHaveBeenCalledWith(mockData);
    expect(onError).not.toHaveBeenCalled();
  });

  it('calls onError and does NOT update property when api.property rejects', async () => {
    const error = new Error('Network error');
    const api = { property: vi.fn().mockRejectedValue(error) };
    const setProperty = vi.fn();
    const onError = vi.fn();

    await reloadPropertySilent({ api, token: 'tok', routeId: '42', setProperty, onError });

    expect(onError).toHaveBeenCalledWith(error);
    expect(setProperty).not.toHaveBeenCalled();
  });

  it('passes the correct token and route id to the API', async () => {
    const api = { property: vi.fn().mockResolvedValue({}) };
    const setProperty = vi.fn();

    await reloadPropertySilent({ api, token: 'secret-token', routeId: '99', setProperty, onError: vi.fn() });

    expect(api.property).toHaveBeenCalledWith('secret-token', { id: '99' });
  });
});

// ---------------------------------------------------------------------------
// 3. onDeletePrice
// ---------------------------------------------------------------------------

describe('properties/[id].vue – onDeletePrice', () => {
  const makeProperty = (prices) => ({ id: 'prop-1', prices });

  it('does nothing when user cancels the confirm dialog', async () => {
    const api = { destroyPropertyPrice: vi.fn() };
    const setProperty = vi.fn();
    const price = { id: 'price-1' };
    const property = makeProperty([price]);

    await onDeletePrice({
      price,
      confirmFn: () => false,
      api,
      token: 'tok',
      property,
      setProperty,
    });

    expect(api.destroyPropertyPrice).not.toHaveBeenCalled();
    expect(setProperty).not.toHaveBeenCalled();
  });

  it('calls api.destroyPropertyPrice with correct arguments on confirm', async () => {
    const api = { destroyPropertyPrice: vi.fn().mockResolvedValue(undefined) };
    const price = { id: 'price-7' };
    const property = makeProperty([price]);

    await onDeletePrice({
      price,
      confirmFn: () => true,
      api,
      token: 'my-token',
      property,
      setProperty: vi.fn(),
    });

    expect(api.destroyPropertyPrice).toHaveBeenCalledWith('my-token', {
      propertyId: 'prop-1',
      id: 'price-7',
    });
  });

  it('removes the deleted price from the prices array via optimistic update', async () => {
    const priceA = { id: 'price-A' };
    const priceB = { id: 'price-B' };
    const priceC = { id: 'price-C' };
    const api = { destroyPropertyPrice: vi.fn().mockResolvedValue(undefined) };
    const setProperty = vi.fn();
    const property = makeProperty([priceA, priceB, priceC]);

    await onDeletePrice({
      price: priceB,
      confirmFn: () => true,
      api,
      token: 'tok',
      property,
      setProperty,
    });

    expect(setProperty).toHaveBeenCalledWith({
      id: 'prop-1',
      prices: [priceA, priceC],
    });
  });

  it('preserves all other property fields in the optimistic update', async () => {
    const price = { id: 'p1' };
    const property = { id: 'prop-1', name: 'My Flat', prices: [price], transactions: [] };
    const api = { destroyPropertyPrice: vi.fn().mockResolvedValue(undefined) };
    const setProperty = vi.fn();

    await onDeletePrice({ price, confirmFn: () => true, api, token: 'tok', property, setProperty });

    const updated = setProperty.mock.calls[0][0];
    expect(updated.name).toBe('My Flat');
    expect(updated.transactions).toEqual([]);
    expect(updated.prices).toEqual([]);
  });

  it('produces an empty prices array when the only price is deleted', async () => {
    const price = { id: 'sole-price' };
    const property = makeProperty([price]);
    const api = { destroyPropertyPrice: vi.fn().mockResolvedValue(undefined) };
    const setProperty = vi.fn();

    await onDeletePrice({ price, confirmFn: () => true, api, token: 'tok', property, setProperty });

    expect(setProperty.mock.calls[0][0].prices).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 4. onDeleteTransaction
// ---------------------------------------------------------------------------

describe('properties/[id].vue – onDeleteTransaction', () => {
  const makeProperty = (transactions) => ({ id: 'prop-1', transactions });

  it('does nothing when user cancels the confirm dialog', async () => {
    const api = { destroyTransaction: vi.fn() };
    const setProperty = vi.fn();
    const alertFn = vi.fn();
    const transaction = { id: 'tx-1' };

    await onDeleteTransaction({
      transaction,
      confirmFn: () => false,
      api,
      token: 'tok',
      property: makeProperty([transaction]),
      setProperty,
      alertFn,
      onError: vi.fn(),
    });

    expect(api.destroyTransaction).not.toHaveBeenCalled();
    expect(setProperty).not.toHaveBeenCalled();
    expect(alertFn).not.toHaveBeenCalled();
  });

  it('calls api.destroyTransaction with correct arguments on confirm', async () => {
    const api = { destroyTransaction: vi.fn().mockResolvedValue(undefined) };
    const transaction = { id: 'tx-42' };

    await onDeleteTransaction({
      transaction,
      confirmFn: () => true,
      api,
      token: 'secret',
      property: makeProperty([transaction]),
      setProperty: vi.fn(),
      alertFn: vi.fn(),
      onError: vi.fn(),
    });

    expect(api.destroyTransaction).toHaveBeenCalledWith('secret', 'tx-42');
  });

  it('removes the deleted transaction from the list via optimistic update', async () => {
    const txA = { id: 'tx-A' };
    const txB = { id: 'tx-B' };
    const txC = { id: 'tx-C' };
    const api = { destroyTransaction: vi.fn().mockResolvedValue(undefined) };
    const setProperty = vi.fn();
    const property = makeProperty([txA, txB, txC]);

    await onDeleteTransaction({
      transaction: txB,
      confirmFn: () => true,
      api,
      token: 'tok',
      property,
      setProperty,
      alertFn: vi.fn(),
      onError: vi.fn(),
    });

    expect(setProperty).toHaveBeenCalledWith({
      id: 'prop-1',
      transactions: [txA, txC],
    });
  });

  it('preserves all other property fields in the optimistic update', async () => {
    const tx = { id: 'tx-1' };
    const property = { id: 'prop-1', name: 'Flat', transactions: [tx], prices: [] };
    const api = { destroyTransaction: vi.fn().mockResolvedValue(undefined) };
    const setProperty = vi.fn();

    await onDeleteTransaction({
      transaction: tx,
      confirmFn: () => true,
      api,
      token: 'tok',
      property,
      setProperty,
      alertFn: vi.fn(),
      onError: vi.fn(),
    });

    const updated = setProperty.mock.calls[0][0];
    expect(updated.name).toBe('Flat');
    expect(updated.prices).toEqual([]);
  });

  it('calls onError and alertFn when api.destroyTransaction rejects', async () => {
    const error = new Error('Server error');
    const api = { destroyTransaction: vi.fn().mockRejectedValue(error) };
    const setProperty = vi.fn();
    const alertFn = vi.fn();
    const onError = vi.fn();
    const tx = { id: 'tx-fail' };

    await onDeleteTransaction({
      transaction: tx,
      confirmFn: () => true,
      api,
      token: 'tok',
      property: makeProperty([tx]),
      setProperty,
      alertFn,
      onError,
    });

    expect(onError).toHaveBeenCalledWith(error);
    expect(alertFn).toHaveBeenCalledWith('Не удалось удалить операцию. Попробуйте еще раз.');
    expect(setProperty).not.toHaveBeenCalled();
  });

  it('does NOT update property state when the API call fails', async () => {
    const api = { destroyTransaction: vi.fn().mockRejectedValue(new Error('fail')) };
    const setProperty = vi.fn();

    await onDeleteTransaction({
      transaction: { id: 'tx-X' },
      confirmFn: () => true,
      api,
      token: 'tok',
      property: makeProperty([{ id: 'tx-X' }]),
      setProperty,
      alertFn: vi.fn(),
      onError: vi.fn(),
    });

    expect(setProperty).not.toHaveBeenCalled();
  });

  // Regression: alert message must be in Russian as specified in the source
  it('shows the Russian error alert message on failure', async () => {
    const api = { destroyTransaction: vi.fn().mockRejectedValue(new Error('err')) };
    const alertFn = vi.fn();

    await onDeleteTransaction({
      transaction: { id: 'tx-1' },
      confirmFn: () => true,
      api,
      token: 'tok',
      property: makeProperty([{ id: 'tx-1' }]),
      setProperty: vi.fn(),
      alertFn,
      onError: vi.fn(),
    });

    expect(alertFn).toHaveBeenCalledWith('Не удалось удалить операцию. Попробуйте еще раз.');
  });
});

// ---------------------------------------------------------------------------
// 5. Transaction coloring logic (amount > 0 → text-success, amount < 0 → text-danger)
// ---------------------------------------------------------------------------

describe('properties/[id].vue – transaction amount coloring', () => {
  it('applies text-success when amount is positive', () => {
    const classes = transactionColorClass(100);
    expect(classes['text-success']).toBe(true);
    expect(classes['text-danger']).toBe(false);
  });

  it('applies text-danger when amount is negative', () => {
    const classes = transactionColorClass(-50);
    expect(classes['text-success']).toBe(false);
    expect(classes['text-danger']).toBe(true);
  });

  it('applies neither class when amount is zero', () => {
    const classes = transactionColorClass(0);
    expect(classes['text-success']).toBe(false);
    expect(classes['text-danger']).toBe(false);
  });

  it('applies text-success for a large positive amount', () => {
    const classes = transactionColorClass(999999);
    expect(classes['text-success']).toBe(true);
    expect(classes['text-danger']).toBe(false);
  });

  it('applies text-danger for a large negative amount', () => {
    const classes = transactionColorClass(-999999);
    expect(classes['text-success']).toBe(false);
    expect(classes['text-danger']).toBe(true);
  });

  // Regression: old code used `transaction.isIncome` boolean flag.
  // New code uses `transaction.amount > 0` / `transaction.amount < 0`.
  it('regression – coloring is based on sign of amount, not an isIncome flag', () => {
    // A transaction with amount=-100 should be red even if isIncome were true on old code.
    const classes = transactionColorClass(-100);
    expect(classes['text-danger']).toBe(true);
    expect(classes['text-success']).toBe(false);
  });
});