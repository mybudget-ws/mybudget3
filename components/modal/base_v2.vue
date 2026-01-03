<script setup>
import { onMounted, nextTick, ref, useAttrs } from 'vue'

const props = defineProps({
  isFocus: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);
const modalRef = ref(null);

onMounted(async () => {
  if (!props.isFocus) return;
  await nextTick();

  modalRef.value
    ?.querySelector('input, textarea, select')
    ?.focus();
})
</script>

<template>
  <div
    class="modal show d-block"
    @click="emit('close')"
  >
    <div class="modal-dialog modal-lg" tabindex="-1">
      <div
        class="modal-content"
        ref="modalRef"
        @click.stop
      >
        <slot />
      </div>
    </div>
  </div>
</template>
