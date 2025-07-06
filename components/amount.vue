<script setup>
const LOCALE = 'ru-RU';

const formatAmount = (amount) => {
  const formatter = new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  });

  const absFormatted = formatter.format(Math.abs(amount));
  return amount < 0 ? `−${absFormatted}` : absFormatted;
};

const props = defineProps({
  value: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: null,
  },
  class: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <span :class='props.class'>
    <span class='font-monospace'>
      {{ formatAmount(props.value) }}
    </span>
    <span v-if='props.currency' class='text-secondary fw-light ms-2'>
      {{ props.currency }}
    </span>
  </span>
</template>
