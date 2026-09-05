<script setup>
import { IconGripVertical } from '@tabler/icons-vue';

const route = useRoute();
const router = useRouter();

const selectedIds = ref(new Set());
const items = ref([
  { id: 'INCOME', name: 'Доход' },
  { id: 'EXPENSE', name: 'Расход' },
  { id: 'TRANSFER', name: 'Перевод' },
]);

const emit = defineEmits([
  'update:items',
  'drag-start',
  'drag-end',
  'pointerdown',
  'pointermove',
  'pointerup',
]);

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: null,
  },
  mobileDragHandle: {
    type: Boolean,
    default: false,
  },
});

const selectedItems = computed(() => {
  return items.value.filter(item => selectedIds.value.has(item.id));
});

const initSelectedItemsByQuery = (val = '') => {
  const queryIds = val?.toString().split(',') || [];
  selectedIds.value = new Set(queryIds.filter(Boolean));
};

const toggleSelection = (id) => {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id);
  } else {
    selectedIds.value.add(id);
  }

  router.replace({
    query: {
      ...route.query,
      kinds: Array.from(selectedIds.value).join(','),
    },
  });
};

watch(
  () => route.query.kinds,
  (value) => {
    initSelectedItemsByQuery(value);
  },
  { immediate: true }
);

watch(selectedItems, (val) => {
  emit('update:items', val);
}, { immediate: true });
</script>

<template>
  <div class='card mb-3'>
    <PlaceholderLoadingFilters v-if='props.isLoading' />

    <div v-else class='card-body pt-3 pe-2 pb-0 ps-3 pb-1'>
      <div class='subheader mb-3 d-flex align-items-center'>
        <span
          class='filter-drag-handle me-1'
          :class='{ "filter-drag-handle-mobile": props.mobileDragHandle }'
          :draggable='!props.mobileDragHandle'
          @dragstart='!props.mobileDragHandle && emit("drag-start", $event)'
          @dragend='!props.mobileDragHandle && emit("drag-end")'
          @pointerdown='props.mobileDragHandle && emit("pointerdown", $event)'
          @pointermove='props.mobileDragHandle && emit("pointermove", $event)'
          @pointerup='props.mobileDragHandle && emit("pointerup", $event)'
        >
          <IconGripVertical
            size='18'
            stroke-width='2'
          />
        </span>
        Тип операций
      </div>
      <div v-for='item in items' :key='item.id'>
        <label class='form-check'>
          <input
            class='form-check-input'
            type='checkbox'
            :checked='selectedIds.has(item.id)'
            @change='toggleSelection(item.id)'
          >
          <span class='form-check-label'>
            {{ item.name }}
          </span>
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .filter-drag-handle {
    display: inline-flex;
    align-items: center;
    cursor: grab;
  }

  .filter-drag-handle:active {
    cursor: grabbing;
  }

  .filter-drag-handle-mobile {
    cursor: grab;
    touch-action: none;
  }

  .filter-drag-handle-mobile:active {
    cursor: grabbing;
  }
</style>