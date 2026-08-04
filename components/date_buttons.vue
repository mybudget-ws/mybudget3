<script setup>
const model = defineModel({
  type: Date,
  required: true,
});

const today = new Date();

const format = (date) => {
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
  });
};

const createDate = (daysAgo) => {
  const date = new Date(today);
  date.setDate(today.getDate() - daysAgo);
  return date;
};

const buttons = [
  {
    key: 'today',
    label: 'Сегодня',
    date: createDate(0),
  },
  {
    key: 'yesterday',
    label: 'Вчера',
    date: createDate(1),
  },
  ...[2, 3, 4].map((daysAgo) => {
    const date = createDate(daysAgo);

    return {
      key: `date-${daysAgo}`,
      label: format(date),
      date,
    };
  }),
];
</script>

<template>
  <div class='mt-1'>
    <nav class='nav nav-segmented w-100'>
      <button
        v-for='item in buttons'
        :key='item.key'
        class='nav-link date-button'
        :class='{ active: model.toDateString() === item.date.toDateString() }'
        type='button'
        @click='model = item.date'
      >
        {{ item.label }}
      </button>
    </nav>
  </div>
</template>

<style scoped>
.date-button {
  height: 24px !important;
  padding: 0 8px;
  font-size: 12px;
}
</style>