<script setup>
import api from '~/lib/api';
import { IconPlus } from '@tabler/icons-vue';

const route = useRoute();
const router = useRouter();

const { token } = useAuth();

const emit = defineEmits(['update:items']);

const {
  isLoading,
  selectedIds,
  visibleItems,
  toggleSelection,
  load,
} = useSelectableFilter({
  queryKey: 'projects',
  emit,
  route,
  router,
  loadFn: () => api.projects(token.value),
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
  <ModalNewProject
    v-if='isShowModal'
    @saved='onSaved'
    @close='isShowModal = false'
  />
  <div class='card mb-3'>
    <PlaceholderLoadingFilters v-if='isLoading' />

    <div v-else class='card-body pt-2 pe-2 pb-0 ps-3'>
      <div class='d-flex align-items-center justify-content-between mb-2'>
        <div class='subheader'>Проекты</div>
        <button
          class='btn btn-action'
          title='Создать проект'
          @click='isShowModal = true'
        >
          <IconPlus size='20' stroke-width='1'/>
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

