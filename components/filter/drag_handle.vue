<script setup>
import { IconGripVertical } from '@tabler/icons-vue';

const props = defineProps({
  mobile: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'drag-start',
  'drag-end',
  'pointerdown',
]);
</script>

<template>
  <span
    class='filter-drag-handle me-1'
    :class='{ "filter-drag-handle-mobile": props.mobile }'
    :draggable='!props.mobile'
    @dragstart='!props.mobile && emit("drag-start", $event)'
    @dragend='!props.mobile && emit("drag-end")'
    @pointerdown='props.mobile && emit("pointerdown", $event)'
  >
    <IconGripVertical
      size='18'
      stroke-width='2'
      class='opacity-40'
    />
  </span>
</template>

<style scoped>
.filter-drag-handle {
  display: inline-flex;
  align-items: center;
  cursor: grab;
  user-select: none;
}

.filter-drag-handle:active {
  cursor: grabbing;
}

.filter-drag-handle-mobile {
  touch-action: none;
  padding: 0.5rem 0.25rem;
  margin: -0.5rem 0 -0.5rem -0.25rem;
}
</style>
