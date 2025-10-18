<template>
  <select
    v-bind='selectAttrs'
    :class='selectClass'
  >
    <option
      v-for='option in options'
      :key='option.value'
      :value='option.value'
      :disabled='option.disabled'
    >
      {{ option.label }}
    </option>
  </select>
</template>

<script setup>

const props = defineProps({
  options: {
    type: Array,
    required: true,
    validator: (options) =>
      options.every(
        (option) =>
          typeof option === 'object' &&
          'value' in option &&
          'label' in option &&
          (!('disabled' in option) || typeof option.disabled === 'boolean')
      ),
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  class: {
    type: String,
    default: '',
  },
  modelValue: [String, Number],
  name: String,
  id: String,
})

const emit = defineEmits(['update:modelValue'])

const selectAttrs = computed(() => ({
  required: props.required,
  disabled: props.disabled,
  name: props.name,
  id: props.id,
  value: props.modelValue,
  onChange: (e) => emit('update:modelValue', e.target.value),
}))

const selectClass = computed(() => [
  'form-select',
  props.class,
])
</script>
