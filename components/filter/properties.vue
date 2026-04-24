<script setup>
import api from '~/lib/api';
import {
  IconPlus,
} from '@tabler/icons-vue';
const route = useRoute();
const router = useRouter();
const { token } = useAuth();

const isLoading = ref(true);
const isShowModal = ref(false);
const items = ref([]);
const selectedIds = ref(new Set());
const emit = defineEmits(['update:items']);
const load = async () => {
  isLoading.value = true
  try {
    const result = await api.properties(token.value);
    if (result) {
      items.value = result;
      initSelectedItemsByQuery(route.query.properties);
    } else {
      console.log('TODO: error');
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false
  }
};

const toggleSelection = (id) => {
  if (id === 0 || id === '0') return;
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id);
  } else {
    selectedIds.value.add(id);
  }

  const nextQuery = { ...route.query };
  const propertyIds = Array.from(selectedIds.value).filter(Boolean);

  if (propertyIds.length > 0) {
    nextQuery.properties = propertyIds.join(',');
  } else {
    delete nextQuery.properties;
  }

  router.replace({ query: nextQuery });
};

const visibleItems = computed(() => (
  items.value.filter(v => v.isHidden === false)
));

const initSelectedItemsByQuery = (value = '') => {
  const queryIds = value
    ?.toString()
    .split(',')
    .map(Number)
    .filter(Boolean) || [];

  selectedIds.value = new Set(queryIds);
}

const selectedItems = computed(() => {
  return items.value.filter(item => selectedIds.value.has(item.id));
});

const onSaved = async () => {
  isShowModal.value = false;
  await load();
};

watch(selectedItems, (val) => {
  emit('update:items', val);
}, { immediate: true });

watch(
  () => route.query.properties,
  (value) => {
    initSelectedItemsByQuery(value);
  },
  { immediate: true }
);

watchEffect(() => {
  if (token.value) load();
});

</script>

<template>
  <ModalNewProperty
    v-if='isShowModal'
    @saved='onSaved'
    @close="isShowModal = false"
  />
  <div class='card mb-3'>
    <PlaceholderLoadingFilters v-if='isLoading' />

    <div v-else class='card-body pt-2 pe-2 pb-0 ps-3'>
      <div class='d-flex align-items-center justify-content-between mb-2'>
        <div class='subheader'>Имущество</div>
        <button
          class='btn btn-action'
          title='Создать имущество'
          @click="isShowModal = true"
        >
          <IconPlus size=20 stroke-width=1 />
        </button>
      </div>
      <div v-for='item in visibleItems' :key='item.id'>
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
