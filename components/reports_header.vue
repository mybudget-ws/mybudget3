<script setup>
import { IconFilter } from '@tabler/icons-vue';
import { useDevice } from '~/composables/use_device';

const { isMobile } = useDevice();

defineProps({
  period: {
    type: String,
    required: true,
  },
  periods: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits([
  'change-period',
  'show-filters',
]);
</script>

<template>
  <div class='card-header border-bottom-0'>
    <template v-if='isMobile'>
      <div class='w-100 d-flex flex-column'>
        <div class='d-flex align-items-center justify-content-between'>
          <h2 class='my-2'>Отчёты</h2>

          <button
            class='btn btn-ghost-secondary'
            type='button'
            @click='emit("show-filters")'
          >
            <IconFilter stroke-width='2' />
          </button>
        </div>

        <nav class='nav nav-segmented w-100 mt-3' role='tablist'>
          <button
            v-for='[key, label] in Object.entries(periods)'
            :key='key'
            class='nav-link'
            :class='{ active: period === key }'
            @click='emit("change-period", key)'
          >
            {{ label }}
          </button>
        </nav>
      </div>
    </template>

    <template v-else>
      <h2 class='my-2'>Отчёты</h2>

      <div class='card-actions'>
        <nav class='nav nav-segmented w-100' role='tablist'>
          <button
            v-for='[key, label] in Object.entries(periods)'
            :key='key'
            class='nav-link'
            :class='{ active: period === key }'
            @click='emit("change-period", key)'
          >
            {{ label }}
          </button>
        </nav>
      </div>
    </template>
  </div>
</template>