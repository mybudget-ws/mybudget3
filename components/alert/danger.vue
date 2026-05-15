<script setup>
import { IconAlertCircle } from '@tabler/icons-vue';

defineProps({
  title: String,
  description: String,
});
</script>

<template>
  <div class="alert alert-danger" role="alert">
    <div class="alert-icon">
      <IconAlertCircle stroke-width="1.4" />
    </div>

    <div>
      <h4 v-if="title" class="alert-heading">
        {{ title }}
      </h4>

      <div v-if="description" class="alert-description">
        {{ description }}
      </div>
    </div>
  </div>
</template>