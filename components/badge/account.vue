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
    <IconWallet size=14 stroke-width=2 />
    {{ props.name }}
    <IconX v-if='props.isX' size='12' />
  </span>
</template>
