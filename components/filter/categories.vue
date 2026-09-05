<script setup>
import api from '~/lib/api';
import {
  IconGripVertical,
  IconPlus,
} from '@tabler/icons-vue';

const route = useRoute();
const router = useRouter();

const { token } = useAuth();

const props = defineProps({
  mobileDragHandle: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'update:items',
  'drag-start',
  'drag-end',
  'pointerdown',
  'pointermove',
  'pointerup',
]);

const {
  isLoading,
  selectedIds,
  visibleItems,
  isShowAll,
  canToggleShowAll,
  toggleSelection,
  load,
} = useSelectableFilter({
  queryKey: 'categories',
  emit,
  route,
  router,
  withFavourites: true,
  loadFn: () => api.categories(token.value),
});

watchEffect(() => {
  if (token.value) {
    load();
  }
});

const isShowModal = ref(false);

const onSaved = async () => {
  isShowModal.value = false;
  await load();
};
</script>

<template>
  <ModalNewCategory
    v-if='isShowModal'
    @saved='onSaved'
    @close='isShowModal = false'
  />

  <div class='card mb-3'>
    <PlaceholderLoadingFilters v-if='isLoading' />

    <div v-else class='card-body pt-3 pe-2 pb-0 ps-3'>
      <div class='d-flex align-items-center justify-content-between mb-2'>
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
          Категории
        </div>
        <button
          class='btn btn-action'
          title='Создать категорию'
          @click='isShowModal = true'
        >
          <IconPlus size='20' stroke-width='1' />
        </button>
      </div>

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

      <div v-if='canToggleShowAll' class='pb-2'>
        <button
          class='btn btn-action btn-sm text-secondary w-100'
          style='margin-left: -0.25rem;'
          @click='isShowAll = !isShowAll'
        >
          {{ isShowAll ? 'Скрыть' : 'Показать всё' }}
        </button>
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