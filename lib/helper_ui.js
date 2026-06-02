export const currenciesDisplayItems = (items) => (
  items.map(item => ({
    value: item.name,
    label: `${item.displayName} — ${item.description}`,
  }))
);