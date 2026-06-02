export const currenciesDisplayItems = (items) => (
  items.map(item => ({
    value: item.name,
    name: `${item.displayName} — ${item.description}`,
  }))
);