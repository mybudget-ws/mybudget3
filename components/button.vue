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
  variant: {
    type: String,
    default: 'primary', // primary, secondary, outline, danger и т.д.
  },
});

const variantClass = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return 'btn-secondary'
    case 'outline':
      return 'btn-outline-primary'
    case 'danger':
      return 'btn-danger'
    default:
      return 'btn-primary'
  }
});

const buttonClass = computed(() => ([
  'btn',
  variantClass.value,
  props.class,
]));
</script>
