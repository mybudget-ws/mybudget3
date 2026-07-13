<script setup>
import { IconArrowUp, IconArrowDown } from '@tabler/icons-vue';

defineProps({
  isMobile: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['create']);

const KIND_INCOME = 'income';
const KIND_EXPENSE = 'expense';

const openCreateTransaction = (kind) => {
  emit('create', kind);
};
</script>

<template>
  <div class='card-header pe-0'>
    <div
      class='row w-full align-items-center'
      :class='isMobile ? "justify-content-between" : ""'
    >
      <div
        class='col'
        :class='isMobile ? "col-auto" : ""'
      >
        <h2 class='mb-0'>
          Операции
        </h2>
      </div>

      <div
        class='col-md-auto col-sm-12'
        :class='isMobile ? "col-auto" : ""'
      >
        <div class='ms-auto d-flex gap-2'>
          <button
            class='btn btn-outline-green'
            type='button'
            @click='openCreateTransaction(KIND_INCOME)'
          >
            <IconArrowUp stroke-width='2' />
          </button>

          <button
            class='btn btn-primary'
            type='button'
            @click='openCreateTransaction(KIND_EXPENSE)'
          >
            <IconArrowDown stroke-width='2' />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>