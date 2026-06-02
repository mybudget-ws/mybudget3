<script setup>
import api from '~/lib/api';

const route = useRoute();
const { token } = useAuth();

const isLoading = ref(true);
const items = ref([]);
const selectedIds = ref(new Set());
const emit = defineEmits(['toggleCategory'])

// TODO: Remove `reload` if unnecessary.
const props = defineProps({
  // reload: Number,
  ids: {
    type: Array,
    default: [],
  },
});
const isShowAll = ref(false);

const load = async () => {
  isLoading.value = true
  try {
    const result = await api.categories(token.value);
    if (result) {
      items.value = result;
      // initSelectedIds();
    } else {
      console.log('TODO: error');
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false
  }
};

const initSelectedIds = (query = route.query) => {
  if (props.ids.length === 0) {
    const queryIds = query.categories?.toString().split(',').filter(v => v !== '') || [];
    selectedIds.value = new Set(queryIds.map(id => Number(id)).filter(id => id > 0));
  } else {
    selectedIds.value = new Set(props.ids);
  }
  emit('toggleCategory', selectedIds.value);
};

const toggleSelection = (id) => {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id);
  } else {
    selectedIds.value.add(id);
  }
  emit('toggleCategory', selectedIds.value);
};

const visibleItems = computed(() => {
  const visible = items.value.filter(v => v.isHidden === false);

  if (isShowAll.value) {
    return visible;
  }

  const favourites = visible.filter(v => v.isFavourite);

  if (favourites.length === 0) {
    return visible;
  }

  const selected = visible.filter(v =>
    selectedIds.value.has(v.id)
  );

  return Array.from(
    new Map(
      [...favourites, ...selected]
        .map(v => [v.id, v])
    ).values()
  );
});

const canToggleShowAll = computed(() => {
  const visible = items.value.filter(v => v.isHidden === false);
  const favourites = visible.filter(v => v.isFavourite);

  return favourites.length > 0 && favourites.length < visible.length;
});

watch(
  () => token.value,
  (val) => {
    if (val) load();
  },
  { immediate: true }
);

// watch(
//   () => props.reload,
//   () => {
//     if (props.reload > 1) {
//       selectedIds.value.clear();
//       initSelectedIds();
//     }
//   }
// );

watch(() => route, (newRoute) => {
  initSelectedIds(newRoute.query);
}, { immediate: true, deep: true })
</script>

<template>
  <PlaceholderLoadingFilters v-if='isLoading' />

  <div v-else>
    <Label>Категории</Label>
    <div class='content-scroll'>
      <div v-for='item in visibleItems' :key='item.id'>
        <label class='form-check' :title='item.name'>
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
    
    <div v-if="canToggleShowAll" class="pb-2">
      <button
        class="btn btn-action btn-sm text-secondary w-100"
        type="button"
        @click="isShowAll = !isShowAll"
      >
        {{ isShowAll ? 'Скрыть' : 'Показать всё' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.content-scroll {
  max-height: 50vh;
  overflow: scroll;
  padding-top: 4px;
  padding-left: 4px;
}
</style>
