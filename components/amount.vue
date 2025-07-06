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
  <span class='font-monospace' :class='props.class'>
    {{ formatAmount(props.value) }}
    <span v-if='props.currency'>
      {{ props.currency }}
    </span>
  </span>
</template>
