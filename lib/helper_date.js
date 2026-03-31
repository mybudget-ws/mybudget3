const DEFAULT_LOCALE = 'ru-RU';

const isSameDay = (a, b) => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
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

  if (isSameDay(date, now)) return 'Сегодня';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, yesterday)) return 'Вчера';

  return date.toLocaleDateString(locale);
};

export const formatDateFull = (dateStr, locale = DEFAULT_LOCALE) => {
  const date = parseDate(dateStr);
  if (!date) return '';

  return date.toLocaleString(locale);
};