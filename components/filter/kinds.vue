<script setup>
const route = useRoute();
const router = useRouter();

const selectedIds = ref(new Set());
const items = ref([
  { id: 'INCOME', name: 'Доход' },
  { id: 'EXPENSE', name: 'Расход' },
  { id: 'TRANSFER', name: 'Перевод' },
]);

const emit = defineEmits(['update:items']);

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: null,
  }
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
  <div class="card mb-3">
    <PlaceholderLoadingFilters v-if='props.isLoading' />
    
    <div v-else class="card-body pt-3 pe-2 pb-0 ps-3 pb-1">
      <div class="subheader mb-3">
        Тип операций
      </div>
      <div v-for="item in items" :key="item.id">
        <label class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            :checked="selectedIds.has(item.id)"
            @change="toggleSelection(item.id)"
          >
          <span class="form-check-label">
            {{ item.name }}
          </span>
        </label>
      </div>
    </div>
  </div>
</template>