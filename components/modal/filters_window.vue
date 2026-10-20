<script setup>
const props = defineProps({
  isLoaded: {
    type: Boolean,
    default: false,
  },
  transactionEventTicks: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits([
  'close',
  'kinds-change',
  'accounts-change',
  'categories-change',
  'projects-change',
  'properties-change',
]);

const FILTERS_STORAGE_KEY = 'transactions-filters-order';

const defaultFilterOrder = [
  'period',
  'kinds',
  'accounts',
  'categories',
  'projects',
  'properties',
];

const filterOrder = ref([...defaultFilterOrder]);

const draggedFilter = ref(null);
const dragStartY = ref(0);
const dragOffsetY = ref(0);
const isDragging = ref(false);

// true, пока DOM пересобирается после перестановки
let isReordering = false;

const filterElements = new Map();

const setFilterElement = (filter, element) => {
  if (element) {
    filterElements.set(filter, element);
  } else {
    filterElements.delete(filter);
  }
};

const loadFilterOrder = () => {
  if (!import.meta.client) return;

  try {
    const saved = JSON.parse(
      localStorage.getItem(FILTERS_STORAGE_KEY)
    );

    if (!Array.isArray(saved)) return;

    const valid = saved.filter((key) => defaultFilterOrder.includes(key));
    const missing = defaultFilterOrder.filter((key) => !valid.includes(key));

    filterOrder.value = [...valid, ...missing];
  } catch {
    filterOrder.value = [...defaultFilterOrder];
  }
};

const saveFilterOrder = () => {
  if (!import.meta.client) return;

  localStorage.setItem(
    FILTERS_STORAGE_KEY,
    JSON.stringify(filterOrder.value)
  );
};

const getFilterAtPoint = (y) => {
  for (const [filter, element] of filterElements) {
    if (filter === draggedFilter.value) continue;

    const rect = element.getBoundingClientRect();

    if (y >= rect.top && y <= rect.bottom) {
      return filter;
    }
  }

  return null;
};

const moveFilter = async (filter) => {
  const dragged = draggedFilter.value;

  if (!dragged || dragged === filter) return;

  const order = [...filterOrder.value];

  const fromIndex = order.indexOf(dragged);
  const toIndex = order.indexOf(filter);

  if (fromIndex === -1 || toIndex === -1) return;

  const element = filterElements.get(dragged);
  const topBefore = element?.getBoundingClientRect().top ?? 0;

  const [moved] = order.splice(fromIndex, 1);
  order.splice(toIndex, 0, moved);

  isReordering = true;
  filterOrder.value = order;

  await nextTick();

  // Компенсируем скачок карточки, чтобы она осталась под пальцем
  if (element && draggedFilter.value === dragged) {
    dragStartY.value += element.getBoundingClientRect().top - topBefore;
  }

  isReordering = false;
};

const onPointerMove = (event) => {
  if (!draggedFilter.value || isReordering) return;

  const distance = event.clientY - dragStartY.value;

  if (!isDragging.value && Math.abs(distance) < 6) {
    return;
  }

  isDragging.value = true;
  dragOffsetY.value = distance;

  event.preventDefault();

  const filter = getFilterAtPoint(event.clientY);

  if (!filter) return;

  // Меняем местами только после пересечения середины соседа
  const rect = filterElements.get(filter).getBoundingClientRect();
  const middle = rect.top + rect.height / 2;

  const fromIndex = filterOrder.value.indexOf(draggedFilter.value);
  const toIndex = filterOrder.value.indexOf(filter);

  const crossedDown = toIndex > fromIndex && event.clientY > middle;
  const crossedUp = toIndex < fromIndex && event.clientY < middle;

  if (crossedDown || crossedUp) {
    moveFilter(filter);
  }
};

const removeListeners = () => {
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerup', finishDrag);
  window.removeEventListener('pointercancel', finishDrag);
};

function finishDrag() {
  removeListeners();

  if (isDragging.value) {
    saveFilterOrder();
  }

  draggedFilter.value = null;
  dragOffsetY.value = 0;
  isDragging.value = false;
  isReordering = false;
}

const onPointerDown = (filter, event) => {
  if (event.pointerType === 'mouse' && event.button !== 0) return;

  // Снимаем неявный захват указателя: при перестановке DOM он всё равно теряется.
  // События слушаем на window.
  if (event.target?.hasPointerCapture?.(event.pointerId)) {
    event.target.releasePointerCapture(event.pointerId);
  }

  draggedFilter.value = filter;
  dragStartY.value = event.clientY;
  dragOffsetY.value = 0;
  isDragging.value = false;
  isReordering = false;

  window.addEventListener('pointermove', onPointerMove, { passive: false });
  window.addEventListener('pointerup', finishDrag);
  window.addEventListener('pointercancel', finishDrag);
};

const filterStyle = (filter) => {
  if (draggedFilter.value !== filter) {
    return undefined;
  }

  return {
    transform: `translateY(${dragOffsetY.value}px)`,
    zIndex: 10,
  };
};

onMounted(() => {
  loadFilterOrder();
});

onBeforeUnmount(() => {
  removeListeners();
});
</script>

<template>
  <ModalBase @close='emit("close")'>
    <div class='modal-header'>
      <h5 class='modal-title'>Фильтры</h5>

      <button
        class='btn-close'
        type='button'
        @click='emit("close")'
      />
    </div>

    <div class='modal-body'>
      <div class='row'>
        <div class='col-12'>
          <div
            v-for='filter in filterOrder'
            :key='filter'
            :ref='(element) => setFilterElement(filter, element)'
            class='mobile-filter-item'
            :class='{
              "mobile-filter-item-dragging": draggedFilter === filter,
            }'
            :style='filterStyle(filter)'
          >
            <FilterPeriod
              v-if='filter === "period"'
              :mobile-drag-handle='true'
              @pointerdown='onPointerDown("period", $event)'
            />

            <FilterKinds
              v-else-if='filter === "kinds"'
              :is-loading='!props.isLoaded'
              :mobile-drag-handle='true'
              @update:items='emit("kinds-change", $event)'
              @pointerdown='onPointerDown("kinds", $event)'
            />

            <FilterAccounts
              v-else-if='filter === "accounts"'
              :reload='props.transactionEventTicks'
              :mobile-drag-handle='true'
              @update:items='emit("accounts-change", $event)'
              @pointerdown='onPointerDown("accounts", $event)'
            />

            <FilterCategories
              v-else-if='filter === "categories"'
              :mobile-drag-handle='true'
              @update:items='emit("categories-change", $event)'
              @pointerdown='onPointerDown("categories", $event)'
            />

            <FilterProjects
              v-else-if='filter === "projects"'
              :mobile-drag-handle='true'
              @update:items='emit("projects-change", $event)'
              @pointerdown='onPointerDown("projects", $event)'
            />

            <FilterProperties
              v-else-if='filter === "properties"'
              :mobile-drag-handle='true'
              @update:items='emit("properties-change", $event)'
              @pointerdown='onPointerDown("properties", $event)'
            />
          </div>
        </div>
      </div>
    </div>

    <div class='modal-footer'>
      <button
        type='button'
        class='btn btn-primary'
        @click='emit("close")'
      >
        Закрыть
      </button>
    </div>
  </ModalBase>
</template>

<style scoped>
.mobile-filter-item {
  position: relative;
  transition: transform 0.15s ease;
}

.mobile-filter-item-dragging {
  transition: none;
  opacity: 0.8;
}
</style>
