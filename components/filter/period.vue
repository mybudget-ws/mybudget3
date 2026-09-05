<script setup>
import {
  IconChevronLeft,
  IconChevronRight,
  IconGripVertical,
} from '@tabler/icons-vue';

const activeDatepicker = ref(null);

const currentMonth = ref(new Date());

const fromDate = ref(null);

const toDate = ref(null);

const quickFilters = [
  { id: 'today', name: 'Сегодня' },
  { id: 'yesterday', name: 'Вчера' },
  { id: 'week', name: 'Текущая неделя' },
  { id: 'month', name: 'Текущий месяц' },
  { id: 'custom', name: 'Свой интервал' },
];

const selectedQuickFilter = ref(null);

const monthNames = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

const weekDays = [
  'Пн',
  'Вт',
  'Ср',
  'Чт',
  'Пт',
  'Сб',
  'Вс',
];

const emit = defineEmits([
  'drag-start',
  'drag-end',
]);

const currentMonthName = computed(() => {
  return monthNames[currentMonth.value.getMonth()];
});

const currentYear = computed(() => {
  return currentMonth.value.getFullYear();
});

const daysInMonth = computed(() => {
  return new Date(
    currentYear.value,
    currentMonth.value.getMonth() + 1,
    0
  ).getDate();
});

const firstDayOffset = computed(() => {
  const day = new Date(
    currentYear.value,
    currentMonth.value.getMonth(),
    1
  ).getDay();

  return day === 0 ? 6 : day - 1;
});

const calendarDays = computed(() => {
  const days = [];

  for (let i = 0; i < firstDayOffset.value; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth.value; day++) {
    days.push(day);
  }

  return days;
});

const createDate = (day) => {
  return new Date(
    currentYear.value,
    currentMonth.value.getMonth(),
    day
  );
};

const isToday = (day) => {
  if (!day) return false;

  const today = new Date();

  return (
    today.getFullYear() === currentYear.value
    && today.getMonth() === currentMonth.value.getMonth()
    && today.getDate() === day
  );
};

const isSameDate = (date1, date2) => {
  if (!date1 || !date2) return false;

  return (
    date1.getFullYear() === date2.getFullYear()
    && date1.getMonth() === date2.getMonth()
    && date1.getDate() === date2.getDate()
  );
};

const isStartDate = (day) => {
  return isSameDate(createDate(day), fromDate.value);
};

const isEndDate = (day) => {
  return isSameDate(createDate(day), toDate.value);
};

const isInRange = (day) => {
  if (!day || !fromDate.value || !toDate.value) return false;

  const date = createDate(day);

  return date > fromDate.value && date < toDate.value;
};

const selectDate = (day) => {
  if (!day) return;

  const date = createDate(day);

  if (activeDatepicker.value === 'from') {
    fromDate.value = date;

    if (toDate.value && date > toDate.value) {
      toDate.value = null;
    }

    activeDatepicker.value = 'to';

    return;
  }

  if (activeDatepicker.value === 'to') {
    if (fromDate.value && date < fromDate.value) {
      fromDate.value = date;
      toDate.value = null;

      return;
    }

    toDate.value = date;
    activeDatepicker.value = null;
  }
};

const selectQuickFilter = (id) => {
  selectedQuickFilter.value = id;

  if (id === 'custom') {
    activeDatepicker.value = 'from';

    if (fromDate.value) {
      currentMonth.value = new Date(
        fromDate.value.getFullYear(),
        fromDate.value.getMonth(),
        1
      );
    }

    return;
  }

  activeDatepicker.value = null;
  fromDate.value = null;
  toDate.value = null;
};

const previousMonth = () => {
  currentMonth.value = new Date(
    currentYear.value,
    currentMonth.value.getMonth() - 1,
    1
  );
};

const nextMonth = () => {
  currentMonth.value = new Date(
    currentYear.value,
    currentMonth.value.getMonth() + 1,
    1
  );
};

const reset = () => {
  selectedQuickFilter.value = null;
  fromDate.value = null;
  toDate.value = null;
  activeDatepicker.value = null;
};
</script>

<template>
  <div class='card mb-3'>
    <div class='card-body pt-3 pe-2 pb-1 ps-3'>
      <div class='subheader mb-3 d-flex align-items-center'>
        <span
          class='filter-drag-handle me-1'
          draggable='true'
          @dragstart='emit("drag-start", $event)'
          @dragend='emit("drag-end")'
        >
          <IconGripVertical
            size='18'
            stroke-width='2'
          />
        </span>
        Дата
      </div>

      <div
        v-for='item in quickFilters'
        :key='item.id'
      >
        <label class='form-check'>
          <input
            class='form-check-input'
            type='radio'
            name='date-filter'
            :checked='selectedQuickFilter === item.id'
            @change='selectQuickFilter(item.id)'
          >

          <span class='form-check-label'>
            {{ item.name }}
          </span>
        </label>
      </div>

      <div
        v-if='selectedQuickFilter === "custom"'
        class='datepicker'
      >
        <div class='datepicker-header'>
          <button
            type='button'
            class='btn btn-action btn-sm'
            @click='previousMonth'
          >
            <IconChevronLeft
              size='18'
              stroke-width='1.5'
            />
          </button>

          <div class='datepicker-title'>
            <strong>
              {{ currentMonthName }}
            </strong>

            <span>
              {{ currentYear }}
            </span>
          </div>

          <button
            type='button'
            class='btn btn-action btn-sm'
            @click='nextMonth'
          >
            <IconChevronRight
              size='18'
              stroke-width='1.5'
            />
          </button>
        </div>

        <div class='datepicker-weekdays'>
          <div
            v-for='day in weekDays'
            :key='day'
          >
            {{ day }}
          </div>
        </div>

        <div class='datepicker-days'>
          <div
            v-for='(day, index) in calendarDays'
            :key='index'
            class='datepicker-day'
            :class='{
              "is-today": isToday(day),
              "is-start-date": isStartDate(day),
              "is-end-date": isEndDate(day),
              "is-in-range": isInRange(day),
            }'
            @click='selectDate(day)'
          >
            <span v-if='day'>
              {{ day }}
            </span>
          </div>
        </div>
      </div>

      <div
        v-if='selectedQuickFilter === "custom"'
        class='pb-2'
      >
        <button
          type='button'
          class='btn btn-action btn-sm text-secondary w-100'
          @click='reset'
        >
          Сбросить
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.datepicker {
  margin: 0.5rem -0.25rem 0.5rem;
  padding: 0.5rem;
}

.datepicker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.datepicker-title {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
  font-size: 0.875rem;
}

.datepicker-title strong {
  font-weight: 600;
}

.datepicker-title span {
  color: var(--tblr-secondary);
}

.datepicker-weekdays,
.datepicker-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.datepicker-weekdays {
  margin-bottom: 0.25rem;
}

.datepicker-weekdays > div {
  color: var(--tblr-secondary);
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
}

.datepicker-day {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 2rem;
  border-radius: var(--tblr-border-radius);
  font-size: 0.8125rem;
}

.datepicker-day:has(span) {
  cursor: pointer;
}

.datepicker-day:has(span):hover {
  background: var(--tblr-bg-surface-secondary);
}

.datepicker-day.is-today span {
  font-weight: 700;
}

.datepicker-day.is-start-date span,
.datepicker-day.is-end-date span {
  color: var(--tblr-primary);
  font-weight: 700;
}

.datepicker-day.is-in-range span {
  color: var(--tblr-primary);
  font-weight: 600;
}

.filter-drag-handle {
  display: inline-flex;
  align-items: center;
  cursor: grab;
}

.filter-drag-handle:active {
  cursor: grabbing;
}
</style>

