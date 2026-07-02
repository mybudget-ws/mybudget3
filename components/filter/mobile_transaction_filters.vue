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
  <div class='col-12'>
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

    <button
      type='button'
      class='btn btn-primary btn-sm d-block mx-auto mb-3'
      @click='emit("close")'
    >
      Закрыть
    </button>
  </div>
</template>