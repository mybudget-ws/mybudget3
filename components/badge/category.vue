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
  isClickable: {
    type: Boolean,
    default: true,
  },
  isX: {
    type: Boolean,
    default: false,
  },
});

const onClick = (event) => {
  if (!props.isClickable) return;
  emit('click', event);
};
</script>

<template>
  <span
    class='badge'
    :class='props.isClickable ? "cursor-pointer" : ""'
    @click='onClick'
  >
    {{ props.name }}
    <IconX v-if='props.isX' size='12' />
  </span>
</template>
