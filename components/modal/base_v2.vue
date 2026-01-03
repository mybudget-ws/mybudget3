<script setup>
import { onMounted, onUnmounted, nextTick, ref } from 'vue';

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
});

const onKeyDown = (e) => {
  if (e.key === 'Escape') {
    emit('close');
  }
};

onMounted(() => {
  window.addEventListener('keydown', onKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown);
});
</script>

<template>
  <div
    class='modal show d-block'
    @click="emit('close')"
  >
    <div class='modal-dialog modal-lg' tabindex='-1'>
      <div
        class='modal-content'
        ref='modalRef'
        @click.stop
      >
        <slot />
      </div>
    </div>
  </div>
</template>
