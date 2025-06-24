<template>
  <button
    :type='type'
    :disabled='loading || disabled'
    :class='buttonClass'
  >
    <span
      v-if='loading'
      class='spinner-border spinner-border-sm me-2'
      role='status'
      aria-hidden='true'
    />
    <slot />
  </button>
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    default: 'button',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  class: {
    type: String,
    default: '',
  },
});

const buttonClass = computed(() => ([
  'btn',
  props.class,
]));
</script>
