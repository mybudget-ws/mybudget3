<script setup>
const props = defineProps({
  id: String,
  showCallback: Function,
});

onMounted(() => {
  const modalElement = document.getElementById(props.id);
  if (modalElement && props.showCallback) {
    modalElement.addEventListener('shown.bs.modal', props.showCallback);
  }
});

onUnmounted(() => {
  const modalElement = document.getElementById(props.id);
  if (modalElement && props.showCallback) {
    modalElement.removeEventListener('shown.bs.modal', props.showCallback);
  }
});
</script>

<template>
  <div class='modal' :id='props.id' tabindex='-1'>
    <div class='modal-dialog modal-lg' role='document'>
      <div class='modal-content'>
        <slot />
      </div>
    </div>
  </div>
</template>
