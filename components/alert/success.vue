<script setup>
import { IconCheck } from '@tabler/icons-vue';

defineProps({
  title: String,
  description: String,
});
</script>

<template>
  <div class="alert alert-success">
    <div class="alert-icon">
      <IconCheck stroke-width="1.4" />
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