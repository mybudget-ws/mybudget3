export const DEFAULT_LOCALE = 'ru-RU';

const isSameDay = (a, b) => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const isValidDate = (date) => {
  return date instanceof Date && !Number.isNaN(date.getTime());
};

export const parseDate = (dateStr) => {
  if (!dateStr) return null;

  const date = new Date(dateStr);
  return isValidDate(date) ? date : null;
};

export const formatDate = (dateStr, locale = DEFAULT_LOCALE) => {
  const date = parseDate(dateStr);
  if (!date) return '';

  const now = new Date();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (isSameDay(date, now)) return capitalize(rtf.format(0, 'day'));

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, yesterday)) return capitalize(rtf.format(-1, 'day'));

  return date.toLocaleDateString(locale);
};

export const formatDateFull = (dateStr, locale = DEFAULT_LOCALE) => {
  const date = parseDate(dateStr);
  if (!date) return '';

  return date.toLocaleString(locale);
};

export const xaxisFormatter = (value, timestamp) => {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const month = new Intl.DateTimeFormat('ru-RU', {
    month: 'short',
  }).format(date);

  if (date.getDate() === 1) {
    const year = String(date.getFullYear()).slice(-2);

    return `${month} '${year}`;
  }

  return `${date.getDate()} ${month}`;
};