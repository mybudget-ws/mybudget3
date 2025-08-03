<template>
  <div class='spinner-border text-indigo' :class='props.class' />
</template>

<script setup>
const props = defineProps({
  class: {
    type: String,
    default: '',
  },
})
</script>
