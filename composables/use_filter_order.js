// Единый порядок фильтров для страниц "Операции" и "Отчёты".
//
// Порядок хранится в одном месте:
//  - useState — общее состояние на время сессии (смена страницы
//    сразу видит изменения);
//  - localStorage — сохранение между перезагрузками.
//
// Страницы могут скрывать часть фильтров через `exclude`
// (например, в отчётах нет фильтра "period" — он в шапке),
// при этом позиция скрытых фильтров в общем порядке сохраняется.

const STORAGE_KEY = 'filters-order';

// Старые ключи, оставлены для миграции сохранённого порядка.
const LEGACY_STORAGE_KEYS = [
  'transactions-filters-order',
  'reports-filters-order',
];

export const DEFAULT_FILTER_ORDER = [
  'period',
  'kinds',
  'accounts',
  'categories',
  'projects',
  'properties',
];

const readOrder = (key) => {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    return Array.isArray(saved) ? saved : null;
  } catch {
    return null;
  }
};

const normalizeOrder = (saved) => {
  const valid = saved.filter(key => DEFAULT_FILTER_ORDER.includes(key));
  const unique = [...new Set(valid)];
  const missing = DEFAULT_FILTER_ORDER.filter(key => !unique.includes(key));

  return [...unique, ...missing];
};

export const useFilterOrder = ({ exclude = [] } = {}) => {
  const order = useState('filters-order', () => [...DEFAULT_FILTER_ORDER]);
  const draggedFilter = ref(null);

  // То, что рисует конкретная страница.
  const filterOrder = computed(
    () => order.value.filter(key => !exclude.includes(key))
  );

  const loadFilterOrder = () => {
    if (!import.meta.client) return;

    const saved = [STORAGE_KEY, ...LEGACY_STORAGE_KEYS]
      .map(readOrder)
      .find(Boolean);

    order.value = saved ? normalizeOrder(saved) : [...DEFAULT_FILTER_ORDER];
  };

  const saveFilterOrder = () => {
    if (!import.meta.client) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(order.value));
  };

  const onFilterDragStart = (filter, event) => {
    draggedFilter.value = filter;

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', filter);

    const filterItem = event.currentTarget.closest('.filter-item');

    if (filterItem) {
      const rect = filterItem.getBoundingClientRect();

      event.dataTransfer.setDragImage(
        filterItem,
        event.clientX - rect.left,
        event.clientY - rect.top
      );
    }
  };

  const onFilterDragOver = (filter) => {
    if (!draggedFilter.value || draggedFilter.value === filter) return;

    const next = [...order.value];

    const fromIndex = next.indexOf(draggedFilter.value);
    const toIndex = next.indexOf(filter);

    if (fromIndex === -1 || toIndex === -1) return;

    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);

    order.value = next;
  };

  const onFilterDragEnd = () => {
    saveFilterOrder();
    draggedFilter.value = null;
  };

  onMounted(loadFilterOrder);

  return {
    filterOrder,
    draggedFilter,
    onFilterDragStart,
    onFilterDragOver,
    onFilterDragEnd,
  };
};