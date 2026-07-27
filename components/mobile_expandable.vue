<script setup>
import { ref } from 'vue';
import { IconChevronDown } from '@tabler/icons-vue';

const props = defineProps({
  title: {
    type: String,
    default: 'Список',
  },
  count: {
    type: Number,
    default: 0,
  },
  defaultOpen: {
    type: Boolean,
    default: false,
  },
});

const isOpen = ref(props.defaultOpen);
</script>

<template>
  <div
    v-if='count > 0'
    class='border-top'
  >
    <button
      type='button'
      class='btn btn-link w-100 text-decoration-none text-secondary d-flex align-items-center justify-content-between'
      @click='isOpen = !isOpen'
    >
      <span>{{ title }} ({{ count }})</span>

      <IconChevronDown
        size='20'
        :style='{
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform .2s",
        }'
      />
    </button>

    <div v-if='isOpen'>
      <slot />
    </div>
  </div>
</template>