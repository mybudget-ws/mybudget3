<script setup>
const props = defineProps({
  id: String,
  isFocus: Boolean,
  showCallback: Function,
});

const MODAL_SHOW = 'shown.bs.modal'

const focusOnFirstInput = () => {
  const modalElement = document.getElementById(props.id);
  const firstInput = modalElement.querySelector('input[type="text"]:not([type="hidden"])');
  if (firstInput) firstInput.focus();
};

onMounted(() => {
  const modalElement = document.getElementById(props.id);
  if (modalElement) {
    if (props.showCallback) {
      modalElement.addEventListener(MODAL_SHOW, props.showCallback);
    } else if (!!props.isFocus) {
      modalElement.addEventListener(MODAL_SHOW, focusOnFirstInput);
    }
  }
});

onUnmounted(() => {
  const modalElement = document.getElementById(props.id);
  if (modalElement) {
    if (props.showCallback) {
      modalElement.removeEventListener(MODAL_SHOW, props.showCallback);
    } else if (!!props.isFocus) {
      modalElement.addEventListener(MODAL_SHOW, focusOnFirstInput);
    }
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
