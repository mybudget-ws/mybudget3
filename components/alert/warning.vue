<script setup>
import { IconAlertTriangle } from '@tabler/icons-vue'

defineProps({
  title: String,
  description: String,
  buttonText: String,
})

const emit = defineEmits(['action'])
</script>

<template>
  <div class="alert alert-warning">
    <div class="alert-icon">
      <IconAlertTriangle stroke-width="1.4" />
    </div>

    <div>
      <h4 class="alert-heading" v-if="title">
        {{ title }}
      </h4>

      <div class="alert-description" v-if="description || buttonText">
        <span v-if="description">
          {{ description }}
        </span>

        <button
          v-if="buttonText"
          type="button"
          class="btn btn-outline-warning btn-sm"
          @click="emit('action')"
        >
          {{ buttonText }}
        </button>
      </div>
    </div>
  </div>
</template>