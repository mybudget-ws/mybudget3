<script setup>
import { IconAlertTriangle } from '@tabler/icons-vue'

defineProps({
  title: {
    type: String,
    default: undefined,
  },
  description: {
    type: String,
    default: undefined,
  },
  buttonText: {
    type: String,
    default: undefined,
  },
});

const emit = defineEmits(['action']);
</script>

<template>
  <div class='alert alert-warning' role='alert'>
    <div class='alert-icon'>
      <IconAlertTriangle stroke-width='1.4' />
    </div>

    <h4 v-if='title' class='alert-heading'>
      {{ title }}
    </h4>

    <div v-if='description || buttonText' class='alert-description'>
      <span v-if='description'>
        {{ description }}
      </span>

      <button
        v-if='buttonText'
        type='button'
        class='btn btn-outline-warning btn-sm'
        @click='emit("action")'
      >
        {{ buttonText }}
      </button>
    </div>
  </div>
</template>