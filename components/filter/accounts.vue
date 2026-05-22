<script setup>
import api from '~/lib/api';
import { IconPlus } from '@tabler/icons-vue';

const props = defineProps({
  reload: {
    type: Number,
    default: 0,
  },
});

const route = useRoute();
const router = useRouter();

const { token } = useAuth();

const emit = defineEmits(['update:items']);

const {
  isLoading,
  selectedIds,
  visibleItems,
  canToggleShowAll,
  isShowAll,
  toggleSelection,
  load,
} = useSelectableFilter({
  queryKey: 'accounts',
  emit,
  route,
  router,
  loadFn: () => api.accounts(token.value),
});

defineExpose({ load });

watch(
  () => props.reload,
  () => {
    if (props.reload > 1) {
      load(true);
    }
  }
);

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
  <ModalNewAccount
    v-if='isShowModal'
    @saved='onSaved'
    @close="isShowModal = false"
  />
  <div class='card mb-3'>
    <PlaceholderLoadingFilters v-if='isLoading' />

    <div v-else class='card-body pt-2 pe-2 pb-0 ps-3'>
      <div class='d-flex align-items-center justify-content-between mb-2'>
        <div class='subheader'>Счета</div>
        <button
          class='btn btn-action'
          title='Создать счёт'
          @click="isShowModal = true"
        >
          <IconPlus size="20" stroke-width="1"/>
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
            <Amount
              class='d-block text-secondary fs-6'
              :value='item.balance'
              :currency='item.currency.name'
            />
          </span>
        </label>
      </div>
      <div v-if="canToggleShowAll" class="pb-2">
        <button
          class="btn btn-action btn-sm text-secondary w-100"
          style="margin-left: -0.25rem;"
          @click="isShowAll = !isShowAll"
        >
          {{ isShowAll ? 'Скрыть' : 'Показать всё' }}
        </button>
      </div>
    </div>
  </div>
</template>
