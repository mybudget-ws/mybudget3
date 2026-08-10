
<script setup>
import VueApexCharts from 'vue3-apexcharts';
import {
  IconArrowUp,
  IconArrowDown,
  IconCoins,
} from '@tabler/icons-vue';

import api from '~/lib/api';
import { useAuth } from '~/composables/use_auth';
import { useDevice } from '~/composables/use_device';
import {
  KIND_EXPENSE,
  KIND_INCOME,
  CHART_COLORS,
} from '~/lib/consts';

const appConfig = useAppConfig();
const route = useRoute();
const { token } = useAuth();
const { isMobile } = useDevice();

definePageMeta({
  middleware: ['authenticated'],
});

const project = ref(null);
const transactions = ref([]);

const isLoading = ref(true);
const isQuiteLoading = ref(false);
const isError = ref(false);

const isShowTransactionModal = ref(false);
const currentKind = ref(KIND_EXPENSE);
const editingTransaction = ref(null);

const chartData = ref(null);

const CHART_HEIGHT = 300;
const CHART_TYPE = 'line';

const textColor = computed(() =>
  appConfig.theme.dark ? '#e2e8f0' : '#334155'
);

const balance = computed(() => {
  if (!project.value) {
    return 0;
  }

  return project.value.totalIncome + project.value.totalExpense;
});

const categories = computed(() => {
  return chartData.value?.categories || [];
});

const series = computed(() => {
  return chartData.value?.series || [];
});

const chartOptions = computed(() => ({
  chart: {
    type: CHART_TYPE,
    fontFamily: 'inherit',
    height: CHART_HEIGHT,
    parentHeightOffset: 0,
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
    animations: {
      enabled: false,
    },
  },

  colors: CHART_COLORS,

  tooltip: {
    theme: 'dark',
  },

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
      bottom: -4,
    },
    strokeDashArray: 4,
  },

  xaxis: {
    labels: {
      padding: 0,
      style: {
        colors: textColor.value,
      },
    },
    tooltip: {
      enabled: false,
    },
    type: 'category',
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
      vertical: 8,
    },
    labels: {
      colors: textColor.value,
    },
  },
}));

const loadProject = async (projectId) => {
  const result = await api.project(token.value, {
    id: projectId,
  });

  if (!result) {
    throw new Error('Проект не найден');
  }

  project.value = result;
};

const loadTransactions = async (projectId) => {
  try {
    const result = await api.transactions(token.value, {
      page: 1,
      perPage: 100,
      filters: {
        projectIds: [projectId],
      },
    });

    console.log('PROJECT TRANSACTIONS:', result);

    transactions.value = result || [];
  } catch (error) {
    console.error('PROJECT TRANSACTIONS ERROR:', error);
    transactions.value = [];
  }
};

const loadChart = async (projectId) => {
  try {
    const result = await api.chartTransactions(token.value, {
      period: 'ALL',
      projectIds: [projectId],
    });

    console.log('PROJECT CHART RESULT:', result);

    chartData.value = result || null;
  } catch (error) {
    console.error('PROJECT CHART ERROR:', error);
    chartData.value = null;
  }
};

const load = async (isQuite = false) => {
  isError.value = false;

  if (isQuite) {
    isQuiteLoading.value = true;
  } else {
    isLoading.value = true;
  }

  try {
    const projectId = Number(route.params.id);

    if (!projectId) {
      throw new Error('Некорректный ID проекта');
    }

    await Promise.all([
      loadProject(projectId),
      loadTransactions(projectId),
      loadChart(projectId),
    ]);
  } catch (error) {
    console.error(error);
    isError.value = true;
  } finally {
    isLoading.value = false;
    isQuiteLoading.value = false;
  }
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

const onTransactionSaved = async () => {
  isShowTransactionModal.value = false;
  await load(true);
};

const onDeleteTransaction = async (transaction) => {
  if (!confirm('Удалить операцию?')) {
    return;
  }

  try {
    await api.destroyTransaction(token.value, transaction.id);
    await load(true);
  } catch (error) {
    console.error('Failed to delete transaction:', error);
    alert('Не удалось удалить операцию. Попробуйте еще раз.');
  }
};

onMounted(load);
</script>

<template>
  <ModalNewTransaction
    v-if='isShowTransactionModal'
    :kind='currentKind'
    :item='editingTransaction'
    :project-id='project?.id'
    @saved='onTransactionSaved'
    @close='isShowTransactionModal = false'
  />

  <div v-if='isLoading'>
    <div class='card mb-4 placeholder-glow'>
      <div
        class='card-body'
        :class='isMobile
          ? "d-flex flex-column gap-2"
          : "d-flex justify-content-between align-items-center"'
      >
        <div>
          <div
            class='placeholder placeholder-lg d-block mb-2'
            style='width: 180px'
          />

          <div
            class='placeholder placeholder-sm d-block'
            style='width: 70px'
          />
        </div>

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

      <div class='card-body'>
        <div class='placeholder-glow'>
          <div
            class='placeholder w-100'
            style='height: 300px'
          />
        </div>
      </div>
    </div>

    <div class='card placeholder-glow'>
      <div class='card-header'>
        <div
          class='placeholder placeholder-lg'
          style='width: 100px'
        />
      </div>

      <div
        v-for='index in [1, 2, 3]'
        :key='index'
        class='card-header'
      >
        <div class='d-flex justify-content-between align-items-center w-100'>
          <div
            class='placeholder placeholder-sm'
            style='width: 120px'
          />

          <div
            class='placeholder placeholder-sm'
            style='width: 60px'
          />
        </div>
      </div>
    </div>
  </div>

  <div v-else-if='isError' class='alert alert-danger'>
    Ошибка загрузки проекта
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
            {{ project?.name || 'Проект' }}

            <PlaceholderLoading
              v-if='isQuiteLoading'
              class='spinner-border-sm ms-2'
            />
          </h2>

          <div class='text-secondary'>
            Проект
          </div>
        </div>

        <div
          v-if='project'
          :class='isMobile
            ? "d-flex flex-column gap-3 mt-2"
            : "d-flex gap-4"'
        >
          <div class='d-flex align-items-center gap-2'>
            <div class='bg-green-lt avatar shadow-none'>
              <IconArrowUp size='24' />
            </div>

            <div>
              <Amount
                class='fw-medium'
                :value='project.totalIncome'
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
                :value='Math.abs(project.totalExpense)'
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
                :value='balance'
                copyable
              />

              <div class='text-secondary small'>
                Баланс
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
            :height='CHART_HEIGHT'
            :options='chartOptions'
            :series='series'
          />

          <div
            v-else-if='!isLoading'
            class='text-secondary text-center py-5'
          >
            Нет данных для отображения
          </div>
        </div>
      </div>
    </div>

    <div class='card'>
      <div class='card-table'>
        <div class='card-header pe-0'>
          <div class='row w-full align-items-center'>
            <div class='col'>
              <h2 class='mb-0'>
                Операции
              </h2>
            </div>

            <div class='col-auto'>
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
        </div>

        <div v-if='!isLoading && isMobile'>
          <TransactionItem
            v-for='(transaction, index) in transactions'
            :key='transaction.id'
            :transaction='transaction'
            is-mobile
            :is-last='index === transactions.length - 1'
            @edit='onEditTransaction'
            @delete='onDeleteTransaction'
          />

          <div
            v-if='!transactions.length'
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
                  <th class='w-1 text-nowrap'>
                    Дата
                  </th>

                  <th class='w-1 text-nowrap text-end'>
                    Величина
                  </th>

                  <th class='w-1 text-nowrap'>
                    Счёт
                  </th>

                  <th>
                    Категории
                  </th>

                  <th>
                    Описание
                  </th>

                  <th class='w-1' />
                </tr>
              </thead>

              <tbody class='table-tbody'>
                <TransactionItem
                  v-for='transaction in transactions'
                  :key='transaction.id'
                  :transaction='transaction'
                  @edit='onEditTransaction'
                  @delete='onDeleteTransaction'
                />

                <tr v-if='!transactions.length'>
                  <td
                    colspan='6'
                    class='text-center text-secondary py-5'
                  >
                    Похоже, операций ещё нет
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>

