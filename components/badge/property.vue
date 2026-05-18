<script setup>
import {
  IconX,
  IconKeyFilled,
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

const colorClass = computed(() => {
  if (document.documentElement.getAttribute('data-bs-theme') === 'dark') {
    return 'bg-teal-lt text-teal-lt-fg';
  }

  return 'bg-teal text-teal-fg';
});
</script>

<template>
  <span
    class="badge"
    :class="[
      props.isClickable ? 'cursor-pointer' : '',
      colorClass,
    ]"
    @click="onClick"
  >
    <IconKeyFilled
      size="14"
      stroke-width="2"
      class="text-white"
    />

    {{ props.name }}

    <IconX
      v-if="props.isX"
      size="12"
      class="text-white"
    />
  </span>
</template>
