<script setup>
import {
  IconX,
} from '@tabler/icons-vue';

const emit = defineEmits(['click']);

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  isX: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <span
    class='badge cursor-pointer'
    @click="emit('click', $event)"
  >
    {{ props.name }}
    <IconX v-if='props.isX' size='12' />
  </span>
</template>
