<script setup>
const props = defineProps({
  id: String,
});
</script>

<template>
  <div class='modal' :id='props.id' tabindex='-1'>
    <div class='modal-dialog' role='document'>
      <div class='modal-content'>
        <slot />
      </div>
    </div>
  </div>
</template>
