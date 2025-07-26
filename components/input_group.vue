<template>
  <div class='input-group mb-2'>
    <input
      v-bind='inputAttrs'
      :class='inputClass'
    />
    <span class='input-group-text'>{{props.groupText}}</span>
  </div>
</template>

<script setup>
const props = defineProps({
  groupText: String,
  type: {
    type: String,
    default: 'text',
  },
  placeholder: String,
  autocomplete: {
    type: String,
    default: 'off',
  },
  required: Boolean,
  disabled: Boolean,
  class: {
    type: String,
    default: '',
  },
  modelValue: [String, Number],
  name: String,
  id: String,
})

const emit = defineEmits(['update:modelValue'])

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
]));
</script>
