<script setup>
import {
  IconWallet,
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
    <IconWallet size='14' stroke-width='2' class='text-cyan opacity-80' />
    {{ props.name }}
    <IconX v-if='props.isX' size='12' />
  </span>
</template>
