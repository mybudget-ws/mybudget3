<script setup>
import {
  IconX,
  IconBulbFilled,
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
    return 'bg-azure-lt text-azure-lt-fg';
  }

  return 'bg-azure text-azure-fg';
});
</script>

<template>
  <!-- Светлая тема: bg-azure text-azure-fg -->
  <!-- Тёмная тема: bg-azure-lt text-azure-lt-fg -->
  <span
    class="badge"
    :class="[
      props.isClickable ? 'cursor-pointer' : '',
      colorClass,
    ]"
    @click="onClick"
  >
    <IconBulbFilled
      size="14"
      stroke-width="2"
      class="text-white opacity-80"
    />

    {{ props.name }}

    <IconX
      v-if="props.isX"
      size="12"
      class="text-white"
    />
  </span>
</template>
