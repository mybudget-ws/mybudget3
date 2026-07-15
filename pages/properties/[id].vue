<script setup>
import VueApexCharts from 'vue3-apexcharts';
import {
  IconArrowDown,
  IconArrowUp,
  IconCoins,
  IconPencil,
  IconTrash,
  IconPlus,
  IconDotsVertical,
} from '@tabler/icons-vue';

import api from '~/lib/api';
import { formatDate, formatDateFull } from '~/lib/helper_date';
import { useAuth } from '~/composables/use_auth';
import { KIND_EXPENSE, KIND_INCOME, CHART_COLORS  } from '~/lib/consts';
import { useDevice } from '~/composables/use_device';

const { isMobile } = useDevice();

definePageMeta({
  middleware: ['authenticated'],
});

const route = useRoute();
const appConfig = useAppConfig();
const { token } = useAuth();

const property = ref(null);
const isLoading = ref(true);
const isQuiteLoading = ref(false);
const isError = ref(false);
const isShowPriceModal = ref(false);
const editingPrice = ref(null);
const isShowTransactionModal = ref(false);
const editingTransaction = ref(null);
const currentKind = ref(KIND_EXPENSE);
const isShowAllPrices = ref(false);

const DEFAULT_PRICE_ITEMS = 3;
const CHART_HEIGTH = 300;
// Убрать в будущем дублирование с report/index.vue
const CHART_TYPE = 'line';

const textColor = computed(() =>
  appConfig.theme.dark ? '#e2e8f0' : '#334155'
);
const series = computed(() => property.value?.pricesChart?.series || []);
const categories = computed(() => property.value?.pricesChart?.categories || []);

const allPrices = computed(() => {
  return [...(property.value?.prices || [])]
    .sort((a, b) => new Date(b.date) - new Date(a.date));
});

const isShowFooter = computed(() => allPrices.value.length > DEFAULT_PRICE_ITEMS);

const pricesWithChange = computed(() => {
  const sorted = [...allPrices.value].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return sorted.map((price, index) => {
    const previous = sorted[index + 1];

    if (!previous || previous.amount === 0) {
      return {
        ...price,
        change: null,
        changeClass: '',
      };
    }

    const change = ((price.amount - previous.amount) / previous.amount) * 100;
    const rounded = Number(change.toFixed(2));

    let changeClass = 'text-secondary';

    if (rounded > 0) {
      changeClass = 'text-success';
    } else if (rounded < 0) {
      changeClass = 'text-danger';
    }

    return {
      ...price,
      change: rounded,
      changeClass,
    };
  });
});

const prices = computed(() => {
  if (isShowAllPrices.value) {
    return pricesWithChange.value;
  }

  return pricesWithChange.value.slice(0, DEFAULT_PRICE_ITEMS);
});
const load = async (isQuite = false) => {
  isError.value = false;
  if (isQuite) {
    isQuiteLoading.value = true;
  } else {
    isLoading.value = true;
  }

  try {
    property.value = await api.property(token.value, {
      id: route.params.id,
    });
  } catch (e) {
    console.error(e);
    isError.value = true;
  } finally {
    isLoading.value = false;
    isQuiteLoading.value = false;
  }
};

const onCreatePrice = () => {
  editingPrice.value = null;
  isShowPriceModal.value = true;
};

const onEditPrice = (price) => {
  editingPrice.value = price;
  isShowPriceModal.value = true;
};

const onDeletePrice = async (price) => {
  if (!confirm('Удалить цену?')) return;

  await api.destroyPropertyPrice(token.value, {
    propertyId: property.value.id,
    id: price.id,
  });

  await load(true);
};

const onPriceSaved = async () => {
  isShowPriceModal.value = false;
  await load(true);
};

const openCreateTransaction = (kind) => {
  currentKind.value = kind;
  editingTransaction.value = null;
  isShowTransactionModal.value = true;
};

const onEditTransaction = (transaction) => {
  editingTransaction.value = transaction;
  currentKind.value =
    transaction.amount > 0 ? KIND_INCOME : KIND_EXPENSE;

  isShowTransactionModal.value = true;
};

const onDeleteTransaction = async (transaction) => {
  if (!confirm('Удалить операцию?')) return;
  try {
    await api.destroyTransaction(token.value, transaction.id);
    await load(true);
  } catch (error) {
    console.error('Failed to delete transaction:', error);
    alert('Не удалось удалить операцию. Попробуйте еще раз.');
  }
};

const onTransactionSaved = async () => {
  isShowTransactionModal.value = false;
  await load(true);
};

onMounted(load);

const chartOptions = computed(() => ({
  chart: {
    type: CHART_TYPE,
    fontFamily: 'inherit',
    height: CHART_HEIGTH,
    parentHeightOffset: 0,
    toolbar: { show: false, },
    animations: { enabled: false },
  },
  colors: CHART_COLORS,
  tooltip: { theme: 'dark' },
  stroke: {
    width: 3,
    lineCap: 'round',
    curve: 'straight',
  },
  grid: {
    padding: {
      top: -20,
      right: 0,
      left: -4,
      bottom: -4
    },
    strokeDashArray: 4,
  },
  xaxis: {
    labels: {
      padding: 0,
      style: {
        colors: textColor.value,
      }
    },
    tooltip: { enabled: false },
    type: 'datetime',
    categories: [...categories.value],
  },
  yaxis: {
    labels: {
      padding: 4,
      style: {
        colors: textColor.value,
      },
      formatter: (val) => {
        return new Intl.NumberFormat('ru-RU', {
          maximumFractionDigits: 0,
          useGrouping: true,
        }).format(val);
      },
    },
  },
  legend: {
    show: true,
    position: 'bottom',
    offsetY: 12,
    markers: {
      width: 10,
      height: 10,
      radius: 100,
    },
    itemMargin: {
      horizontal: 8,
      vertical: 8
    },
    labels: {
      colors: textColor.value,
    },
  },
}));
</script>

<template>
  <ModalNewPrice
    v-if='isShowPriceModal'
    :property='property'
    :item='editingPrice'
    @saved='onPriceSaved'
    @close='isShowPriceModal = false'
  />

  <ModalNewTransaction
    v-if='isShowTransactionModal'
    :kind='currentKind'
    :item='editingTransaction'
    :property-id='property?.id'
    @saved='onTransactionSaved'
    @close='isShowTransactionModal = false'
  />

  <div>
    <div v-if='isLoading'>
      <div class='card mb-4'>
        <div class='card-body'>
          <div
            class='d-flex'
            :class='isMobile
              ? "flex-column align-items-start gap-3"
              : "justify-content-between align-items-center"'
          >
            <!-- название -->
            <div class='placeholder-glow d-flex flex-column gap-3 w-50'>
              <div class='placeholder placeholder-lg col-6' />
              <div class='placeholder placeholder col-3' />
            </div>

            <!-- показатели справа -->
            <div
              class='d-flex gap-3'
              :class='isMobile
                ? "flex-column align-items-start w-100"
                : "align-items-center"'
            >

              <div
                v-for='index in [1, 2, 3]'
                :key='index'
                class='d-flex align-items-center placeholder-glow'
              >
                <div class='avatar placeholder' />
                <div class='ms-2'>
                  <div
                    class='placeholder placeholder-lg d-block mb-2'
                    style='width: 80px'
                  />
                  <div
                    class='placeholder placeholder-sm d-block'
                    style='width: 60px'
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- график -->
          <div class='placeholder-glow mt-4'>
            <div
              class='placeholder w-100'
              style='height: 300px'
            />
          </div>
        </div>
      </div>

      <div v-for='index in [1, 2]' :key='index' class='card mb-4 placeholder-glow'>
        <div class='card-header'>
          <div class='placeholder placeholder-lg col-3'/>
        </div>

        <div
          v-for='i in 2'
          :key='i'
          class='card-header'
        >
          <div class='d-flex justify-content-between align-items-center w-100'>
            <div class='placeholder placeholder-sm col-2' />
            <div class='placeholder placeholder-sm col-1' />
          </div>
        </div>
      </div>
    </div>

    <div v-else-if='isError' class='alert alert-danger'>
      Ошибка загрузки имущества
    </div>

    <template v-else>
      <div class='card mb-4'>
        <div
          class='card-body'
          :class='isMobile
            ? "d-flex flex-column gap-2"
            : "d-flex justify-content-between align-items-center"'
        >
          <div>
            <h2 class='mb-1'>
              {{ property?.name || 'Имущество' }}
              <PlaceholderLoading
                v-if='isQuiteLoading'
                class='spinner-border-sm ms-2'
              />
            </h2>

            <div class='text-secondary'>
              Имущество
            </div>
          </div>

          <div
            v-if='property'
            :class='isMobile ? "d-flex flex-column gap-3 mt-2" : "d-flex gap-4"'
          >
            <div class='d-flex align-items-center gap-2'>
              <div class='bg-green-lt avatar shadow-none'>
                <IconArrowUp size='24' />
              </div>

              <div>
                <Amount
                  class='fw-medium'
                  :value='property.totalIncome'
                  :currency='property.currency.name'
                  copyable
                />
                <div class='text-secondary small'>
                  Доходы
                </div>
              </div>
            </div>

            <div class='d-flex align-items-center gap-2'>
              <div class='bg-red-lt avatar shadow-none'>
                <IconArrowDown size='24' />
              </div>

              <div>
                <Amount
                  class='fw-medium'
                  :value='Math.abs(property.totalExpense)'
                  :currency='property.currency.name'
                  copyable
                />
                <div class='text-secondary small'>
                  Расходы
                </div>
              </div>
            </div>

            <div class='d-flex align-items-center gap-2'>
              <div class='bg-primary-lt avatar shadow-none'>
                <IconCoins size='24' />
              </div>

              <div>
                <Amount
                  class='fw-medium'
                  :value='property.amount'
                  :currency='property.currency.name'
                  copyable
                />
                <div class='text-secondary small'>
                  Стоимость
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class='card-body'>
          <div class='w-full'>
            <VueApexCharts
              v-if='!isLoading && series.length'
              :type='CHART_TYPE'
              :height='CHART_HEIGTH'
              :options='chartOptions'
              :series='series'
            />
          </div>
        </div>
      </div>

      <div class='card mb-4'>
        <div class='card-table'>
          <div class='card-header pe-0'>
            <div class='row w-full align-items-center'>
              <div class='col'>
                <h2 class='mb-0'>История цены</h2>
              </div>

              <div class='col-auto'>
                <button
                  class='btn btn-primary'
                  @click='onCreatePrice'
                >
                  <IconPlus :size='20' />
                </button>
              </div>
            </div>
          </div>

          <div v-if='!isLoading && isMobile'>
            <div
              v-for='(price, index) in prices'
              :key='price.id'
              class='card-header'
              :class='{ "border-bottom-0": index === prices.length - 1 && !isShowFooter }'
            >
              <div class='d-flex flex-grow-1 align-items-center'>
                <div class='col'>
                  <div class='card-title mb-0'>
                    {{ formatDate(price.date) }}
                  </div>

                  <div class='card-subtitle text-secondary'>
                    <Amount
                      :value='price.amount'
                      :currency='price.currency?.name'
                      copyable
                    />
                  </div>
                  <div
                    v-if='price.change !== null'
                    class='small mt-1'
                    :class='price.changeClass'
                  >
                    {{ price.change }} %
                  </div>
                </div>
              </div>

              <div class='card-actions'>
                <div class='dropdown position-relative'>
                  <button
                    type='button'
                    class='btn-action border-0 bg-transparent'
                    data-bs-toggle='dropdown'
                    data-bs-display='static'
                  >
                    <IconDotsVertical
                      size='20'
                      stroke-width='1'
                    />
                  </button>

                  <div class='dropdown-menu dropdown-menu-end'>
                    <button
                      class='dropdown-item'
                      @click='onEditPrice(price)'
                    >
                      Редактировать
                    </button>

                    <button
                      v-if='allPrices.length > 1'
                      class='dropdown-item text-danger'
                      @click='onDeletePrice(price)'
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if='!prices.length'
              class='card-body text-center text-secondary py-5'
            >
              История цен пустая
            </div>

            <div
              v-if='isShowFooter'
              class='card-footer bg-transparent border-0'
            >
              <button
                class='btn btn-action btn-sm text-secondary w-100 p-2'
                @click='isShowAllPrices = !isShowAllPrices'
              >
                {{ isShowAllPrices ? 'Скрыть' : 'Показать все' }}
              </button>
            </div>
          </div>

          <div v-if='!isLoading && !isMobile' class='advanced-table'>
            <div class='table-responsive'>
              <table class='table table-vcenter table-selectable'>
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th class='w-1 text-nowrap text-end'/>
                    <th class='w-1 text-nowrap text-end'>Величина</th>
                    <th class='w-1'/>
                  </tr>
                </thead>

                <tbody class='table-tbody'>
                  <tr
                    v-for='price in prices'
                    :key='price.id'
                  >
                    <td>{{ formatDate(price.date) }}</td>
                     <td class='text-nowrap text-end'>
                      <span
                        v-if='price.change !== null'
                        class='font-monospace'
                        :class='price.changeClass'
                      >
                        {{ price.change }} %
                      </span>
                    </td>
                    <td class='text-nowrap text-end'>
                      <Amount
                        :value='price.amount'
                        :currency='price.currency?.name'
                        copyable
                      />
                    </td>
                    <td>
                      <div class='btn-actions'>
                        <button
                          class='btn btn-action'
                          @click='onEditPrice(price)'
                        >
                          <IconPencil size='20' stroke-width='1.5' />
                        </button>

                        <button
                          v-if='allPrices.length > 1'
                          class='btn btn-action'
                          @click='onDeletePrice(price)'
                        >
                          <IconTrash size='20' stroke-width='1.5' />
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr v-if='!prices.length'>
                    <td
                      colspan='3'
                      class='text-center text-secondary py-5'
                    >
                      История цен пустая
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-if='isShowFooter' class='card-footer bg-transparent border-0'>
                <button
                  class='btn btn-action btn-sm text-secondary w-100 p-2'
                  @click='isShowAllPrices = !isShowAllPrices'
                >
                  {{ isShowAllPrices ? 'Скрыть' : 'Показать все' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class='card'>
        <div class='card-table'>
          <div class='card-header pe-2'>
            <div class='d-flex justify-content-between align-items-center w-100'>
              <h2 class='mb-0'>
                Операции
              </h2>

              <div class='d-flex gap-2'>
                <button
                  class='btn btn-outline-green'
                  type='button'
                  @click='openCreateTransaction(KIND_INCOME)'
                >
                  <IconArrowUp stroke-width='2' />
                </button>

                <button
                  class='btn btn-primary'
                  type='button'
                  @click='openCreateTransaction(KIND_EXPENSE)'
                >
                  <IconArrowDown stroke-width='2' />
                </button>
              </div>
            </div>
          </div>

          <div v-if='!isLoading && isMobile'>
            <div
              v-for='(item, index) in property?.transactions || []'
              :key='item.id'
              class='card-header'
              :class='{ "border-bottom-0": index === property?.transactions.length - 1 }'
            >
              <div class='d-flex w-100'>

                <div class='flex-grow-1 min-w-0'>

                  <div class='text-secondary'>
                    {{ formatDate(item.dateAt) }}
                  </div>

                  <div class='mt-1'>
                    <Amount
                      :value='item.amount'
                      :currency='item.account?.currency?.name'
                      :is-color='true'
                      copyable
                    />
                  </div>

                  <div class='badges-list mt-2'>
                    <BadgeAccount
                      :name='item.account?.name'
                      class='no-hover'
                    />

                    <BadgeProject
                      v-if='item.project'
                      :name='item.project.name'
                      class='no-hover'
                    />

                    <BadgeProperty
                      v-if='item.property'
                      :name='item.property.name'
                      class='no-hover'
                    />

                    <BadgeCategory
                      v-for='cat in item.categories'
                      :key='cat.id'
                      :name='cat.name'
                      class='no-hover'
                    />
                  </div>

                  <div
                    v-if='item.description'
                    class='text-secondary small mt-1 text-truncate'
                  >
                    {{ item.description }}
                  </div>
                </div>

                <div class='ms-auto d-flex align-items-center'>
                  <div class='dropdown'>
                    <button
                      type='button'
                      class='btn-action border-0 bg-transparent'
                      data-bs-toggle='dropdown'
                      data-bs-display='static'
                    >
                      <IconDotsVertical size='20' stroke-width='1' />
                    </button>

                    <div class='dropdown-menu dropdown-menu-end'>
                      <button
                        class='dropdown-item'
                        @click='onEditTransaction(item)'
                      >
                        Редактировать
                      </button>

                      <button
                        class='dropdown-item text-danger'
                        @click='onDeleteTransaction(item)'
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-if='!property?.transactions?.length'
              class='text-secondary text-center mt-3'
            >
              Похоже, операций ещё нет
            </div>
          </div>

          <div v-if='!isLoading && !isMobile' class='advanced-table'>
            <div class='table-responsive'>
              <table class='table table-vcenter table-selectable'>
                <thead>
                  <tr>
                    <th class='w-1 text-nowrap'>Дата</th>
                    <th class='w-1 text-nowrap text-end'>Величина</th>
                    <th class='w-1 text-nowrap'>Счёт</th>
                    <th>Категории</th>
                    <th>Описание</th>
                    <th class='w-1'/>
                  </tr>
                </thead>

                <tbody class='table-tbody'>
                  <tr
                    v-for='transaction in property?.transactions || []'
                    :key='transaction.id'
                  >
                    <td :title='formatDateFull(transaction.dateAt)'>
                      {{ formatDate(transaction.dateAt) }}
                    </td>
                    <td class='text-nowrap text-end'>
                      <Amount
                        :value='transaction.amount'
                        :currency='transaction.account?.currency?.name'
                        is-color
                        copyable
                      />
                    </td>
                    <td>
                      <BadgeAccount
                        :name='transaction.account?.name'
                        class='no-hover'
                      />
                    </td>
                    <td>
                      <div class='badges-list'>
                        <BadgeProject
                          v-if='transaction.project'
                          :name='transaction.project.name'
                          class='no-hover'
                        />

                        <BadgeProperty
                          v-if='transaction.property'
                          :name='transaction.property.name'
                          class='no-hover'
                        />

                        <BadgeCategory
                          v-for='cat in transaction.categories'
                          :key='cat.id'
                          :name='cat.name'
                          class='no-hover'
                        />
                      </div>
                    </td>
                    <td class='text-secondary'>
                      {{ transaction.description }}
                    </td>
                    <td>
                      <div class='btn-actions'>
                        <button
                          class='btn btn-action'
                          @click='onEditTransaction(transaction)'
                        >
                          <IconPencil size='20' stroke-width='1.5' />
                        </button>

                        <button
                          class='btn btn-action'
                          @click='onDeleteTransaction(transaction)'
                        >
                          <IconTrash size='20' stroke-width='1.5' />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.badge.no-hover {
  cursor: default !important;
  pointer-events: none;
}

.badge.no-hover:hover {
  background: inherit !important;
  color: inherit !important;
  filter: none !important;
  box-shadow: none !important;
  transform: none !important;
}
</style>