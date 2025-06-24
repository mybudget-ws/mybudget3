<template>
  <label :class='labelClass'>
    <slot />
  </label>
</template>

<script setup>
const props = defineProps({
  required: Boolean,
  class: {
    type: String,
    default: '',
  },
});

const labelClass = computed(() => ([
  'form-label',
  { required: props.required },
  props.class,
]));
</script>
