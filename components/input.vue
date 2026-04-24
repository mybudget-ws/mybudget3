<template>
  <input
    ref='inputRef'
    v-bind='inputAttrs'
    :class='inputClass'
  >
  <div v-if='isShowErrorMessage' class='text-danger mt-1'>
    {{ errorText }}
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
const props = defineProps({
  id: String,
  name: String,
  modelValue: [String, Number],
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: undefined,
  },
  autocomplete: {
    type: String,
    default: 'off',
  },
  required: Boolean,
  isError: Boolean,
  disabled: Boolean,
  class: {
    type: String,
    default: '',
  },
  errorText: {
    type: String,
    default: undefined,
  }
});

const emit = defineEmits(['update:modelValue'])
const inputRef = ref(null)

const inputAttrs = computed(() => ({
  type: props.type,
  placeholder: props.placeholder,
  autocomplete: props.autocomplete,
  required: props.required,
  disabled: props.disabled,
  name: props.name,
  id: props.id,
  value: props.modelValue,
  onInput: (e) => emit('update:modelValue', e.target.value),
}))

const inputClass = computed(() => ([
  'form-control',
  props.class,
  props.isError === true ? 'border-danger' : '',
]));

const isShowErrorMessage = computed(() => (
  props.isError && props.errorText
));

const selectAll = () => {
  if (inputRef.value) {
    inputRef.value.focus();
    inputRef.value.select();
  }
}

const focus = () => {
  if (inputRef.value) {
    inputRef.value.focus();
  }
}

defineExpose({
  focus,
  selectAll,
});
</script>
