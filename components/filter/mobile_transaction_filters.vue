<script setup>
defineProps({
  isLoaded: {
    type: Boolean,
    default: false,
  },
  transactionEventTicks: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits([
  'close',
  'kinds-change',
  'accounts-change',
  'categories-change',
  'projects-change',
  'properties-change',
]);
</script>

<template>
  <ModalBase @close='emit("close")'>
    <div class='modal-header'>
      <h5 class='modal-title'>Фильтры операций</h5>
      <button class='btn-close' type='button' @click='emit("close")' />
    </div>

    <div class='modal-body'>
      <div class='row mb-3'>
        <div class='col-12'>
          <block />
          <FilterKinds
            :is-loading='!isLoaded'
            @update:items='emit("kinds-change", $event)'
          />

          <FilterAccounts
            :reload='transactionEventTicks'
            @update:items='emit("accounts-change", $event)'
          />

          <FilterCategories
            @update:items='emit("categories-change", $event)'
          />

          <FilterProjects
            @update:items='emit("projects-change", $event)'
          />

          <FilterProperties
            @update:items='emit("properties-change", $event)'
          />
        </div>        
      </div>
    </div>
    <div class='modal-footer'>
      <button
        type='button'
        class='btn btn-primary'
        @click='emit("close")'
      >
        Закрыть
      </button>
    </div>
  </ModalBase>
</template>