<script setup>
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
  <ModalBase @close='emit(&apos;close&apos;)'>
    <div class='modal-header'>
      <h5 class='modal-title'>
        Фильтры отчетов
      </h5>

      <button
        class='btn-close'
        type='button'
        @click='emit(&apos;close&apos;)'
      />
    </div>

    <div class='modal-body'>
      <div class='row'>
        <div class='col-12'>
          <FilterKinds
            @update:items='emit(&apos;kinds-change&apos;, $event)'
          />

          <FilterAccounts
            @update:items='emit(&apos;accounts-change&apos;, $event)'
          />

          <FilterCategories
            @update:items='emit(&apos;categories-change&apos;, $event)'
          />

          <FilterProjects
            @update:items='emit(&apos;projects-change&apos;, $event)'
          />

          <FilterProperties
            @update:items='emit(&apos;properties-change&apos;, $event)'
          />
        </div>
      </div>
    </div>

    <div class='modal-footer'>
      <button
        type='button'
        class='btn btn-primary'
        @click='emit(&apos;close&apos;)'
      >
        Закрыть
      </button>
    </div>
  </ModalBase>
</template>