<script setup>
import api from '~/lib/api';

const route = useRoute();
const router = useRouter();
const { token } = useAuth();

const isLoading = ref(true);
const items = ref([]);
const selectedIds = ref(new Set());

const load = async () => {
  isLoading.value = true
  try {
    const result = await api.categories(token.value);
    if (result) {
      items.value = result;
      initSelectedItemsByQuery(route.query.categories);
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

  router.replace({
    query: {
      ...route.query,
      categories: Array.from(selectedIds.value).join(','),
    },
  });
};

const visibleItems = computed(() => (
  items.value.filter(v => v.isHidden === false)
));

const initSelectedItemsByQuery = (items = '') => {
  const queryIds = items?.toString().split(',') || [];
  selectedIds.value = new Set(queryIds.map(Number).filter(id => id > 0));
}

watch(() => route, (newRoute) => {
  initSelectedItemsByQuery(newRoute.query.categories);
}, { immediate: true, deep: true })

watchEffect(() => {
  if (token.value) load();
});
</script>

<template>
  <div class='card mb-3'>
    <PlaceholderLoadingFilters v-if='isLoading' />

    <div v-else class='card-body p-3 pb-0'>
      <div class='subheader mb-3'>Категории</div>
      <div v-for='item in visibleItems' :key='item.id'>
        <label class="form-check" :title='item.name'>
          <input
            class='form-check-input'
            type='checkbox'
            :checked='selectedIds.has(item.id)'
            @change='toggleSelection(item.id)'
          >
          <span class='form-check-label text-nowrap overflow-x-hidden'>
            {{ item.name }}
          </span>
        </label>
      </div>
    </div>
  </div>
</template>

