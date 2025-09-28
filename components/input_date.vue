<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: [Date, String],
    default: new Date(),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);
const internalDate = ref(props.modelValue instanceof Date ? props.modelValue : new Date(props.modelValue));

const formatDateForInput = (date) => {
  if (!(date instanceof Date) || isNaN(date)) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const inputValue = computed(() => formatDateForInput(internalDate.value));

const parseDateFromInput = (value) => {
  if (!value) return new Date();
  const [year, month, day] = value.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day));
};
const onInput = (event) => {
  internalDate.value = parseDateFromInput(event.target.value);
};

// Watch for changes in modelValue prop
watch(() => props.modelValue, (newValue) => {
  internalDate.value = newValue instanceof Date ? newValue : new Date(newValue);
});

// Watch for changes in internalDate and emit updates
watch(internalDate, (newDate) => {
  emit('update:modelValue', newDate);
});

</script>

<template>
  <input
    type='date'
    class='form-control'
    :value='inputValue'
    :disabled='disabled'
    @input='onInput'
  />
</template>
