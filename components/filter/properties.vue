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

  router.replace({
    query: {
      ...route.query,
      properties: Array.from(selectedIds.value).join(','),
    },
  });
};

const visibleItems = computed(() => (
  items.value.filter(v => v.isHidden === false)
));

const initSelectedItemsByQuery = (items = '') => {
  const queryIds = items?.toString().split(',') || [];
  selectedIds.value = new Set(queryIds.map(id => Number(id)));
}

const onSaved = async () => {
  isShowModal.value = false;
  await load();
};

watch(() => route, (newRoute) => {
  initSelectedItemsByQuery(newRoute.query.properties);
}, { immediate: true, deep: true })

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
      <div class='mb-2 d-flex align-items-center justify-content-between'>
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