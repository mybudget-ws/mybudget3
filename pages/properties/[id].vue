<script setup>
import VueApexCharts from 'vue3-apexcharts';
import {
  IconArrowDown,
  IconArrowUp,
  IconPencil,
  IconTrash,
  IconPlus,
} from '@tabler/icons-vue';

import api from '~/lib/api';
import { useAuth } from '~/composables/use_auth';
import { KIND_EXPENSE, KIND_INCOME } from '~/lib/consts';
import { CHART_COLORS } from '~/lib/consts';

definePageMeta({
  middleware: ['authenticated'],
});

const route = useRoute();
const appConfig = useAppConfig();
const { token } = useAuth();

const property = ref(null);
const isLoading = ref(false);
const isError = ref(false);
const isShowPriceModal = ref(false);
const editingPrice = ref(null);
const isShowTransactionModal = ref(false);
const editingTransaction = ref(null);
const currentKind = ref(KIND_EXPENSE);

const CHART_HEIGTH = 300;
// Убрать в будущем дублирование с report/index.vue
const CHART_TYPE = 'line';
const textColor = computed(() =>
  appConfig.theme.dark ? '#e2e8f0' : '#334155'
);
const series = computed(() => property.value?.pricesChart?.series || []);
const categories = computed(() => property.value?.pricesChart?.categories || []);

const reloadPropertySilent = async () => {
  const data = await api.property(token.value, {
    id: route.params.id,
  });

  property.value = data;
};

const prices = computed(() => {
  return [...(property.value?.prices || [])]
    .sort((a, b) => new Date(b.date) - new Date(a.date));
});

const loadProperty = async () => {
  try {
    isLoading.value = true;
    isError.value = false;

    property.value = await api.property(token.value, {
      id: route.params.id,
    });
  } catch (e) {
    console.error(e);
    isError.value = true;
  } finally {
    isLoading.value = false;
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

  await loadProperty();
};

const onPriceSaved = async () => {
  isShowPriceModal.value = false;

  await reloadPropertySilent();
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

  await api.destroyTransaction(token.value, transaction.id);

  await loadProperty();
};

const onTransactionSaved = async () => {
  isShowTransactionModal.value = false;
  await reloadPropertySilent();
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });
};

onMounted(loadProperty);

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
    v-if="isShowPriceModal"
    :property="property"
    :item="editingPrice"
    @saved="onPriceSaved"
    @close="isShowPriceModal = false"
  />

  <ModalNewTransaction
    v-if="isShowTransactionModal"
    :kind="currentKind"
    :item="editingTransaction"
    :property-id="property?.id"
    @saved="onTransactionSaved"
    @close="isShowTransactionModal = false"
  />

  <div>
    <div v-if="isLoading" class="card">
      <div class="card-body">Загрузка...</div>
    </div>

    <div v-else-if="isError" class="alert alert-danger">
      Ошибка загрузки имущества
    </div>

    <template v-else>
      <div class="card mb-4">
        <div class="card-body d-flex justify-content-between align-items-start">
          <div>
            <h1 class="h3 mb-1">
              {{ property?.name || 'Имущество' }}
            </h1>
            <div class="text-secondary">Имущество</div>
          </div>

          <div v-if="prices.length" class="fs-2 text-end">
            <Amount
              :value="prices[0].amount"
              :currency="prices[0].currency?.name"
            />
          </div>
        </div>

        <div class="card-body">
          <div class='w-full'>
            <VueApexCharts
              v-if="!isLoading && series.length"
              :type=CHART_TYPE
              :height=CHART_HEIGTH
              :options='chartOptions'
              :series='series'
            />
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-body">
          <div class="d-flex align-items-center mb-4">
            <h2 class="h4 mb-0">История цены</h2>
            <button class="btn btn-primary ms-3" @click="onCreatePrice">
              <IconPlus :size="20" />
            </button>
          </div>
          <div class="border-top">
            <div class="d-flex justify-content-between py-3 text-secondary fw-bold small border-bottom">
              <div>Дата</div>
              <div>Величина</div>
            </div>
            <div
              v-for="price in prices"
              :key="price.id"
              class="d-flex justify-content-between py-4 border-bottom"
            >
              <div>{{ formatDate(price.date) }}</div>
              <div class="d-flex align-items-center">
                <Amount
                  :value="price.amount"
                  :currency="price.currency?.name"
                />
                <div class="btn-actions ms-3">

                  <button class="btn btn-action" @click="onEditPrice(price)">
                    <IconPencil size="20" stroke-width="1.5" />
                  </button>

                  <button class="btn btn-action" @click="onDeletePrice(price)">
                    <IconTrash size="20" stroke-width="1.5" />
                  </button>

                </div>
              </div>
            </div>
            <div v-if="!prices.length" class="text-center text-secondary py-5">
              История цен пустая
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-table">
          <div class="card-header pe-0">
            <div class="row w-full align-items-center">
              <div class="col">
                <h2 class="mb-0">Операции</h2>
              </div>
              <div class="col-md-auto col-sm-12">
                <div class="ms-auto d-flex gap-2">
                  <button
                    class="btn btn-outline-green"
                    type="button"
                    @click="openCreateTransaction(KIND_INCOME)"
                  >
                    <IconArrowUp stroke-width="2" />
                  </button>

                  <button
                    class="btn btn-primary"
                    type="button"
                    @click="openCreateTransaction(KIND_EXPENSE)"
                  >
                    <IconArrowDown stroke-width="2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="advanced-table">
            <div class="table-responsive">
              <table class="table table-vcenter table-selectable">
                <thead>
                  <tr>
                    <th class="w-1 text-nowrap">Дата</th>
                    <th class="w-1 text-nowrap text-end">Величина</th>
                    <th class="w-1 text-nowrap">Счёт</th>
                    <th>Категории</th>
                    <th>Описание</th>
                    <th class="w-1"></th>
                  </tr>
                </thead>

                <tbody class="table-tbody">
                  <tr
                    v-for="transaction in property?.transactions || []"
                    :key="transaction.id"
                  >
                    <td class="text-nowrap">
                      {{ formatDate(transaction.dateAt) }}
                    </td>
                    <td class="text-nowrap text-end">
                      <div
                        :class="{
                          'text-success': transaction.isIncome,
                          'text-danger': !transaction.isIncome,
                        }"
                      >
                        <Amount
                          :value="transaction.amount"
                          :currency="transaction.account?.currency?.name"
                        />
                      </div>
                    </td>
                    <td>
                      <BadgeAccount
                        :name="transaction.account?.name"
                        class="no-hover"
                      />
                    </td>
                    <td>
                      <div class="badges-list">
                        <BadgeProject
                          v-if="transaction.project"
                          :name="transaction.project.name"
                          class="no-hover"
                        />

                        <BadgeProperty
                          v-if="transaction.property"
                          :name="transaction.property.name"
                          class="no-hover"
                        />

                        <BadgeCategory
                          v-for="cat in transaction.categories"
                          :key="cat.id"
                          :name="cat.name"
                          class="no-hover"
                        />
                      </div>
                    </td>
                    <td class="text-secondary">
                      {{ transaction.description }}
                    </td>
                    <td>
                      <div class="btn-actions">
                        <button
                          class="btn btn-action"
                          @click="onEditTransaction(transaction)"
                        >
                          <IconPencil size="20" stroke-width="1.5" />
                        </button>

                        <button
                          class="btn btn-action"
                          @click="onDeleteTransaction(transaction)"
                        >
                          <IconTrash size="20" stroke-width="1.5" />
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