<script setup>
import { ref, onMounted, onUnmounted, defineEmits, watch } from 'vue';
import { Modal } from '@tabler/core/dist/js/tabler.min.js';

const props = defineProps({
  id: { type: String, required: true },
  modelValue: { type: Boolean, default: false } // для v-model
});

const emit = defineEmits(['update:modelValue', 'shown', 'hidden']);

let modalInstance = null;
const modalEl = ref(null);

const show = () => {
  modalInstance?.show();
};

const hide = () => {
  modalInstance?.hide();
};

onMounted(() => {
  if (modalEl.value) {
    modalInstance = new Modal(modalEl.value);

    modalEl.value.addEventListener('shown.bs.modal', () => {
      emit('shown');
      emit('update:modelValue', true);
    });

    modalEl.value.addEventListener('hidden.bs.modal', () => {
      emit('hidden');
      emit('update:modelValue', false);
    });

    // если v-model=true изначально
    if (props.modelValue) show();
  }
});

onUnmounted(() => {
  if (modalEl.value) {
    modalEl.value.removeEventListener('shown.bs.modal', () => {});
    modalEl.value.removeEventListener('hidden.bs.modal', () => {});
  }
  modalInstance = null;
});

// следим за v-model
watch(() => props.modelValue, (val) => {
  if (val) show();
  else hide();
});
</script>

<template>
  <div class="modal" :id="props.id" ref="modalEl" tabindex="-1">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <slot :show="show" :hide="hide" />
      </div>
    </div>
  </div>
</template>
