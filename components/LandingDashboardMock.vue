<script setup>
import {
  IconArrowUp,
  IconArrowDown,
  IconArrowsRightLeft,
} from '@tabler/icons-vue';

const incomeBars = [0, 0, 0, 180, 0, 0, 12, 0, 0, 0, 35, 0, 0, 0, 0, 180, 0, 0, 9, 0, 0, 0, 0, 25, 0, 0, 0];
const expenseBars = [4, 12, 3, 0, 8, 25, 6, 3, 14, 0, 5, 38, 4, 3, 9, 0, 6, 22, 3, 7, 0, 41, 5, 3, 11, 0, 8];

// высота столбика в процентах от высоты контейнера
const barPath = (values) => {
  const max = Math.max(...values);
  return values.map((v) => (v === 0 ? 0 : Math.max((v / max) * 100, 4)));
};
const incomeRects = barPath(incomeBars);
const expenseRects = barPath(expenseBars);

// donut: доли в процентах, длина окружности = 100
const donut = (parts) => {
  let offset = 25;
  return parts.map((p) => {
    const gap = 0.8;
    const seg = { ...p, dash: `${p.value - gap} ${100 - p.value + gap}`, offset };
    offset -= p.value;
    return seg;
  });
};
const accountsDonut = donut([
  { value: 58, color: '#4263eb' },
  { value: 27, color: '#4299e1' },
  { value: 15, color: '#ae3ec9' },
]);
const assetsDonut = donut([
  { value: 52, color: '#ae3ec9' },
  { value: 30, color: '#4299e1' },
  { value: 18, color: '#0ca678' },
]);

const incomes = [
  { date: '3 ноя', account: 'Тинькофф', cats: ['Зарплата'], amount: '+180 000,00' },
  { date: '10 ноя', account: 'Наличные', cats: ['Подработка'], amount: '+12 500,00' },
  { date: '14 ноя', account: 'Сбер', cats: ['Проценты'], amount: '+1 340,00' },
];
const expenses = [
  { date: '5 ноя', account: 'Тинькофф', cats: ['Продукты'], amount: '−4 250,00' },
  { date: '8 ноя', account: 'Сбер', cats: ['Транспорт', 'Авто'], amount: '−3 500,00' },
  { date: '12 ноя', account: 'Наличные', cats: ['Кафе'], amount: '−1 890,00' },
];
const accounts = [
  { name: 'Тинькофф', amount: '312 400,00' },
  { name: 'Сбер', amount: '184 900,00' },
  { name: 'Наличные', amount: '45 200,00' },
];
const assets = [
  { name: 'Баланс счетов', amount: '542 500,00' },
  { name: 'Накопительный счёт', tag: 'вклад', amount: '420 000,00' },
  { name: 'Акции', tag: 'брокер', amount: '253 000,00' },
];
</script>

<template>
  <div class='mock-window' aria-hidden='true'>
    <div class='mock-body'>
      <div class='mock-content'>
        <!-- шапка -->
        <div class='d-flex align-items-center mb-3'>
          <div class='flex-fill'>
            <div class='page-pretitle'>Обзор</div>
            <h2 class='page-title mb-0'>Ноябрь 2026</h2>
          </div>
          <div class='btn-list flex-nowrap'>
            <span class='btn btn-sm btn-outline-green'><IconArrowUp :size='16' /></span>
            <span class='btn btn-sm btn-outline-secondary'><IconArrowsRightLeft :size='16' /></span>
            <span class='btn btn-sm btn-primary'><IconArrowDown :size='16' /></span>
          </div>
        </div>

        <div class='row row-cards'>
          <!-- Доходы -->
          <div class='col-6'>
            <div class='card'>
              <div class='card-header border-0 pb-0'>
                <div class='card-title'>Доходы</div>
                <div class='ms-auto font-monospace'>
                  193 840,00 <span class='text-secondary'>RUB</span>
                </div>
              </div>
              <div class='mock-bars'>
                <div
                  v-for='(h, i) in incomeRects' :key='i'
                  class='mock-bar'
                  :style='{ height: h + "%", background: "#0ca678" }'
                />
              </div>
              <table class='table table-sm table-vcenter card-table mb-0'>
                <thead>
                  <tr><th>Дата</th><th>Счёт</th><th>Категории</th><th class='text-end'>Величина</th></tr>
                </thead>
                <tbody>
                  <tr v-for='r in incomes' :key='r.date + r.amount'>
                    <td class='text-nowrap'>{{ r.date }}</td>
                    <td><span class='badge bg-blue-lt'>{{ r.account }}</span></td>
                    <td><span v-for='c in r.cats' :key='c' class='badge bg-green-lt me-1'>{{ c }}</span></td>
                    <td class='text-end text-success text-nowrap font-monospace'>
                      {{ r.amount }} <span class='text-secondary'>RUB</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Расходы -->
          <div class='col-6'>
            <div class='card'>
              <div class='card-header border-0 pb-0'>
                <div class='card-title'>Расходы</div>
                <div class='ms-auto font-monospace'>
                  74 210,00 <span class='text-secondary'>RUB</span>
                </div>
              </div>
              <div class='mock-bars'>
                <div
                  v-for='(h, i) in expenseRects' :key='i'
                  class='mock-bar'
                  :style='{ height: h + "%", background: "var(--tblr-primary)" }'
                />
              </div>
              <table class='table table-sm table-vcenter card-table mb-0'>
                <thead>
                  <tr><th>Дата</th><th>Счёт</th><th>Категории</th><th class='text-end'>Величина</th></tr>
                </thead>
                <tbody>
                  <tr v-for='r in expenses' :key='r.date + r.amount'>
                    <td class='text-nowrap'>{{ r.date }}</td>
                    <td><span class='badge bg-blue-lt'>{{ r.account }}</span></td>
                    <td><span v-for='c in r.cats' :key='c' class='badge bg-green-lt me-1'>{{ c }}</span></td>
                    <td class='text-end text-danger text-nowrap font-monospace'>
                      {{ r.amount }} <span class='text-secondary'>RUB</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Счета -->
          <div class='col-6'>
            <div class='card'>
              <div class='card-header border-0 pb-0'>
                <div class='card-title'>Счета</div>
              </div>
              <div class='d-flex justify-content-center py-2'>
                <svg viewBox='0 0 36 36' class='mock-donut'>
                  <circle
                    v-for='(s, i) in accountsDonut' :key='i'
                    cx='18' cy='18' r='14.5' pathLength='100' fill='none'
                    :stroke='s.color' stroke-width='5'
                    :stroke-dasharray='s.dash' :stroke-dashoffset='s.offset'
                  />
                </svg>
              </div>
              <table class='table table-sm table-vcenter card-table mb-0'>
                <thead>
                  <tr><th>Название</th><th class='text-end'>Баланс</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td class='text-secondary'><b>Всего</b></td>
                    <td class='text-end text-success font-monospace'>542 500,00 <span class='text-secondary'>RUB</span></td>
                  </tr>
                  <tr v-for='a in accounts' :key='a.name'>
                    <td>{{ a.name }}</td>
                    <td class='text-end font-monospace'>{{ a.amount }} <span class='text-secondary'>RUB</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Все активы -->
          <div class='col-6'>
            <div class='card'>
              <div class='card-header border-0 pb-0'>
                <div class='card-title'>Все активы</div>
              </div>
              <div class='d-flex justify-content-center py-2'>
                <svg viewBox='0 0 36 36' class='mock-donut'>
                  <circle
                    v-for='(s, i) in assetsDonut' :key='i'
                    cx='18' cy='18' r='14.5' pathLength='100' fill='none'
                    :stroke='s.color' stroke-width='5'
                    :stroke-dasharray='s.dash' :stroke-dashoffset='s.offset'
                  />
                </svg>
              </div>
              <table class='table table-sm table-vcenter card-table mb-0'>
                <thead>
                  <tr><th>Название</th><th class='text-end'>Величина</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td class='text-secondary'><b>Всего</b></td>
                    <td class='text-end text-success font-monospace'>1 215 500,00 <span class='text-secondary'>RUB</span></td>
                  </tr>
                  <tr v-for='a in assets' :key='a.name'>
                    <td>
                      {{ a.name }}
                      <span v-if='a.tag' class='badge ms-2'>{{ a.tag }}</span>
                    </td>
                    <td class='text-end font-monospace'>{{ a.amount }} <span class='text-secondary'>RUB</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mock-window {
  border: 1px solid var(--tblr-border-color);
  border-radius: 1rem;
  background: var(--tblr-bg-surface);
  box-shadow:
    0 30px 80px color-mix(in srgb, var(--tblr-body-color) 4.8%, transparent),
    0 10px 30px color-mix(in srgb, var(--tblr-body-color) 2.4%, transparent);
  overflow: hidden;
  text-align: left;
  pointer-events: none;
  user-select: none;
  font-size: 0.75rem;
  margin-bottom: 26px;
}

.mock-body {
  background: var(--tblr-bg-surface-secondary);
}

.mock-content {
  padding: 20px;
}

.mock-bars {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 72px;
  margin: 0.5rem 1rem 0.9rem;
}

.mock-bar {
  flex: 1 1 0;
  min-width: 0;
  border-radius: 2px 2px 0 0;
}

.mock-donut {
  display: block;
  width: 110px;
  height: 110px;
  overflow: visible;
}

.mock-window :deep(.table) {
  font-size: 0.7rem;
}

@media (max-width: 767.98px) {
  .mock-window {
    max-height: 480px;
    -webkit-mask-image: linear-gradient(to bottom, #000 80%, transparent);
    mask-image: linear-gradient(to bottom, #000 80%, transparent);
  }

  .mock-content {
    padding: 12px;
  }

  .mock-content .row > .col-6 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}
</style>