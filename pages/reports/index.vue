<script setup>
import VueApexCharts from 'vue3-apexcharts';
import api from '~/lib/api';
import { CHART_COLORS, REPORTS_CHART_STORAGE_KEY } from '~/lib/consts';
import { xaxisFormatter } from '~/lib/helper_date';
import { useAuth } from '~/composables/use_auth';
import { useChart } from '~/composables/use_chart';
import { useDevice } from '~/composables/use_device';
import { useFilterOrder } from '~/composables/use_filter_order';

const { isMobile } = useDevice();

// В отчётах период выбирается в шапке, поэтому фильтр "period" скрыт.
const {
  filterOrder,
  draggedFilter,
  onFilterDragStart,
  onFilterDragOver,
  onFilterDragEnd,
} = useFilterOrder({ exclude: ['period'] });

const isShowMobileFilters = ref(false);
const route = useRoute();
const router = useRouter();
const { token } = useAuth();

const {
  CHART_LABEL_COLOR,
  CHART_HEIGHT,
  PERIODS,
  period,
  setPeriod,
  filters,
  onCategoryClick,
  onAccountClick,
  onProjectClick,
  onPropertyClick,
  onKindClick,
} = useChart();

const CHART_TYPE = 'line';

const FILTER_QUERY_KEYS = [
  'kinds',
  'accounts',
  'categories',
  'projects',
  'properties',
];

const isLoading = ref(true);
const isError = ref(false);
const chartData = ref({});

const categories = computed(() => chartData.value.categories ?? []);

// Суммируем балансы всех счетов на каждую дату.
const totalBalance = computed(() => {
  const accounts = chartData.value.series ?? [];

  return categories.value.map((_, index) => {
    return accounts.reduce((sum, account) => {
      return sum + Number(account.data[index] ?? 0);
    }, 0);
  });
});

// Добавляем общую сумму первой серией.
const series = computed(() => {
  const accounts = chartData.value.series ?? [];

  return [
    {
      name: 'Всего',
      data: totalBalance.value,
    },
    ...accounts,
  ];
});

// Цвета счетов сохраняются, линия "Всего" получает secondary.
const chartColors = computed(() => {
  const accounts = chartData.value.series ?? [];

  return [
    'var(--tblr-secondary)', // CHART_COLORS[0]
    ...accounts.map((_, index) => {
      return CHART_COLORS[index % CHART_COLORS.length];
    }),
  ];
});

// Пунктир только у вычислимой серии "Всего".
const chartDashArray = computed(() => {
  return series.value.map((item) => {
    return item.name === 'Всего' ? 6 : 0;
  });
});

// Таблица балансов по каждому счету.
const balanceRows = computed(() => {
  const accounts = chartData.value.series ?? [];

  return accounts.map((account) => {
    const data = account.data ?? [];

    const startBalance = data.length
      ? Number(data[0] ?? 0)
      : null;

    const endBalance = data.length
      ? Number(data[data.length - 1] ?? 0)
      : null;

    const change = startBalance !== null && endBalance !== null
      ? endBalance - startBalance
      : null;

    return {
      name: account.name,
      startBalance,
      change,
      endBalance,
    };
  });
});

const selectedAccounts = ref([]);
const selectedCategories = ref([]);
const selectedKinds = ref([]);
const selectedProjects = ref([]);
const selectedProperties = ref([]);

const onAccountsChange = (accounts) => {
  selectedAccounts.value = accounts;
};

const onCategoriesChange = (categories) => {
  selectedCategories.value = categories;
};

const onProjectsChange = (projects) => {
  selectedProjects.value = projects;
};

const onPropertiesChange = (properties) => {
  selectedProperties.value = properties;
};

const onKindsChange = (kinds) => {
  selectedKinds.value = kinds;
};

// Сбрасываем только фильтры, период и выбранный график остаются.
const clearAllFilters = () => {
  const nextQuery = { ...route.query };

  FILTER_QUERY_KEYS.forEach((key) => {
    delete nextQuery[key];
  });

  router.replace({ query: nextQuery });
};

const load = async () => {
  isLoading.value = true;
  isError.value = false;

  try {
    const result = await api.chartBalances(token.value, filters.value);

    if (result) {
      chartData.value = result;
    } else {
      isError.value = true;
    }
  } catch (err) {
    console.error(err);
    isError.value = true;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  if (!import.meta.client) return;

  const savedChart = localStorage.getItem(
    REPORTS_CHART_STORAGE_KEY
  );

  if (route.query.chart === 'balance') {
    localStorage.setItem(
      REPORTS_CHART_STORAGE_KEY,
      'balance'
    );

    return;
  }

  if (savedChart === 'transactions') {
    router.replace({
      path: '/reports/transactions',
      query: route.query,
    });
  } else {
    localStorage.setItem(
      REPORTS_CHART_STORAGE_KEY,
      'balance'
    );
  }
});

watch(
  () => route.query,
  () => {
    if (token.value) load();
  },
  { immediate: true }
);

const chartOptions = computed(() => ({
  chart: {
    type: CHART_TYPE,
    fontFamily: 'inherit',
    height: CHART_HEIGHT,
    parentHeightOffset: 0,
    toolbar: { show: false },
    zoom: { enabled: false },
    animations: { enabled: false },
  },
  colors: chartColors.value,
  tooltip: {
    theme: 'dark',
    x: {
      formatter: (value, { dataPointIndex }) => {
        const date = new Date(categories.value[dataPointIndex]);

        if (Number.isNaN(date.getTime())) {
          return value;
        }

        return new Intl.DateTimeFormat('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(date);
      },
    },
  },
  stroke: {
    width: 3,
    lineCap: 'round',
    curve: 'straight',
    dashArray: chartDashArray.value,
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
    type: 'datetime',
    categories: [...categories.value],
    labels: {
      formatter: xaxisFormatter,
      style: { colors: CHART_LABEL_COLOR },
    },
    tooltip: { enabled: false },
  },
  yaxis: {
    labels: {
      padding: 4,
      style: { colors: CHART_LABEL_COLOR },
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
      colors: CHART_LABEL_COLOR,
    },
  },
}));
</script>

<template>
  <ModalFiltersWindow
    v-if='isShowMobileFilters'
    is-loaded
    :show-period='false'
    @close='isShowMobileFilters = false'
    @kinds-change='onKindsChange'
    @accounts-change='onAccountsChange'
    @categories-change='onCategoriesChange'
    @projects-change='onProjectsChange'
    @properties-change='onPropertiesChange'
  />

  <div class='row'>
    <div class='col-sm-12 col-lg-9 col-xl-10'>
      <div class='card'>
        <ReportsHeader
          :period='period'
          :periods='PERIODS'
          @change-period='setPeriod'
          @show-filters='isShowMobileFilters = true'
        />

        <FilterBadges
          border-class='border-top'
          :kinds='selectedKinds'
          :accounts='selectedAccounts'
          :categories='selectedCategories'
          :projects='selectedProjects'
          :properties='selectedProperties'
          @kind-click='onKindClick'
          @account-click='onAccountClick'
          @category-click='onCategoryClick'
          @project-click='onProjectClick'
          @property-click='onPropertyClick'
          @clear-all='clearAllFilters'
        />
      </div>

      <!-- График балансов -->
      <div class='card mt-3'>
        <div class='card-header'>
          <h3 class='card-title'>Баланс</h3>

          <NuxtLink
            :to='{ path: "/reports/transactions", query: { ...route.query, period, chart: "transactions" } }'
            class='card-title text-secondary ms-3'
          >
            Операции
          </NuxtLink>
        </div>

        <div class='card-body'>
          <div
            v-if='isLoading'
            class='d-flex align-items-center justify-content-center h-100'
            :style='{ minHeight: `${CHART_HEIGHT}px` }'
          >
            <PlaceholderLoading />
          </div>

          <div
            v-else-if='!isError'
            class='w-full'
          >
            <VueApexCharts
              :type='CHART_TYPE'
              :height='CHART_HEIGHT'
              :options='chartOptions'
              :series='series'
            />
          </div>

          <AlertWarning
            v-else
            title='Не удалось загрузить график'
            description='Попробуйте обновить страницу'
          />
        </div>
      </div>

      <!-- Балансы по счетам -->
      <div class='card mt-3'>
        <div class='card-header'>
          <h3 class='card-title'>Баланс по счетам</h3>
        </div>

        <div v-if='isLoading' class='card-body text-center'>
          <PlaceholderLoading />
        </div>

        <div v-else-if='!isError'>
          <!-- Мобильный список -->
          <div
            v-if='isMobile'
            class='list-group list-group-flush'
          >
            <div
              v-for='(account, index) in balanceRows'
              :key='`${account.name}-${index}`'
              class='list-group-item px-3 py-3'
            >
              <div class='fw-medium text-truncate mb-2'>
                {{ account.name }}
              </div>

              <div class='d-flex flex-column gap-2'>
                <div class='d-flex align-items-center justify-content-between gap-3'>
                  <span class='text-secondary'>
                    Начало периода
                  </span>

                  <Amount
                    v-if='account.startBalance !== null'
                    :value='account.startBalance'
                  />
                </div>

                <div class='d-flex align-items-center justify-content-between gap-3'>
                  <span class='text-secondary'>
                    Изменение
                  </span>

                  <span
                    :class='{
                      "text-success": account.change > 0,
                      "text-danger": account.change < 0,
                    }'
                  >
                    <span v-if='account.change > 0'>+</span>

                    <Amount
                      v-if='account.change !== null'
                      :value='account.change'
                    />
                  </span>
                </div>

                <div class='d-flex align-items-center justify-content-between gap-3'>
                  <span class='text-secondary'>
                    Итого
                  </span>

                  <Amount
                    v-if='account.endBalance !== null'
                    :value='account.endBalance'
                  />
                </div>
              </div>
            </div>

            <div
              v-if='!balanceRows.length'
              class='text-center text-secondary py-4'
            >
              Нет данных за выбранный период
            </div>
          </div>
          <div v-else class='advanced-table'>
            <div class='table-responsive'>
              <table class='table table-vcenter table-selectable'>
                <thead>
                  <tr>
                    <th>Название счета</th>
                    <th class='w-1 text-nowrap text-end'>Начало периода</th>
                    <th class='w-1 text-nowrap text-end'>Изменение</th>
                    <th class='w-1 text-nowrap text-end'>Итого</th>
                  </tr>
                </thead>

                <tbody class='table-tbody'>
                  <tr
                    v-for='(account, index) in balanceRows'
                    :key='`${account.name}-${index}`'
                  >
                    <td>
                      <span class='fw-medium'>
                        {{ account.name }}
                      </span>
                    </td>

                    <td class='text-nowrap text-end'>
                      <Amount
                        v-if='account.startBalance !== null'
                        :value='account.startBalance'
                      />
                    </td>

                    <td class='text-nowrap text-end'>
                      <span
                        :class='{
                          "text-success": account.change > 0,
                          "text-danger": account.change < 0,
                        }'
                      >
                        <span v-if='account.change > 0'>+</span>

                        <Amount
                          v-if='account.change !== null'
                          :value='account.change'
                        />
                      </span>
                    </td>

                    <td class='text-nowrap text-end'>
                      <Amount
                        v-if='account.endBalance !== null'
                        :value='account.endBalance'
                      />
                    </td>
                  </tr>

                  <tr v-if='!balanceRows.length'>
                    <td
                      colspan='4'
                      class='text-center text-secondary py-4'
                    >
                      Нет данных за выбранный период
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div v-else class='card-body text-center'>
          <div class='text-danger'>
            Не удалось загрузить данные
          </div>
        </div>
      </div>
    </div>

    <div
      v-show='!isMobile'
      class='col-sm-12 col-lg-3 col-xl-2'
    >
      <div class='filter-list'>
        <div
          v-for='filter in filterOrder'
          :key='filter'
          class='filter-item'
          :class='{ "filter-item-dragging": draggedFilter === filter }'
          @dragover.prevent='onFilterDragOver(filter)'
        >
          <FilterKinds
            v-if='filter === "kinds"'
            @update:items='onKindsChange'
            @drag-start='onFilterDragStart("kinds", $event)'
            @drag-end='onFilterDragEnd'
          />

          <FilterAccounts
            v-else-if='filter === "accounts"'
            @update:items='onAccountsChange'
            @drag-start='onFilterDragStart("accounts", $event)'
            @drag-end='onFilterDragEnd'
          />

          <FilterCategories
            v-else-if='filter === "categories"'
            @update:items='onCategoriesChange'
            @drag-start='onFilterDragStart("categories", $event)'
            @drag-end='onFilterDragEnd'
          />

          <FilterProjects
            v-else-if='filter === "projects"'
            @update:items='onProjectsChange'
            @drag-start='onFilterDragStart("projects", $event)'
            @drag-end='onFilterDragEnd'
          />

          <FilterProperties
            v-else-if='filter === "properties"'
            @update:items='onPropertiesChange'
            @drag-start='onFilterDragStart("properties", $event)'
            @drag-end='onFilterDragEnd'
          />
        </div>
      </div>
    </div>
  </div>
</template>