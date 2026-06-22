<script setup>
import { computed } from 'vue';

const LOCALE = 'ru-RU';

const props = defineProps({
  value: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: null,
  },
  isColor: {
    type: Boolean,
    default: false,
  },
  copyable: {
    type: Boolean,
    default: false,
  },
  class: {
    type: String,
    default: '',
  },
});

const formatAmount = (amount) => {
  const formatter = new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  });

  const absFormatted = formatter.format(Math.abs(amount));
  return amount < 0 ? `−${absFormatted}` : absFormatted;
};

const classes = computed(() => {
  let result = props.class;

  if (props.isColor) {
    if (props.value > 0) result += ' text-success';
    else if (props.value < 0) result += ' text-danger';
  }

  if (props.copyable) {
    result += ' cursor-pointer';
  }

  return result;
});

const tooltipText = 'Кликните, чтобы скопировать';

const onClick = async () => {
  if (!props.copyable) return;

  // SSR guard
  if (typeof navigator === 'undefined' || !navigator.clipboard) return;

  try {
    await navigator.clipboard.writeText(String(props.value));
  } catch (e) {
    console.warn('Clipboard copy failed:', e);
  }
};
</script>

<template>
  <span
    v-tooltip.bottom='props.copyable ? tooltipText : null'
    :class='classes'
    @click='onClick'
  >
    <span class='font-monospace'>
      {{ formatAmount(props.value) }}
    </span>

    <span v-if='props.currency' class='text-secondary fw-light ms-2'>
      {{ props.currency }}
    </span>
  </span>
</template>