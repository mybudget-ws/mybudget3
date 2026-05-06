<script setup>
import VueApexCharts from 'vue3-apexcharts';

import api from '~/lib/api';
import { CHART_COLORS } from '~/lib/consts';
import { useAuth } from '~/composables/use_auth';

const { token } = useAuth();
const isLoading = ref(true);
const isError = ref(false);
const chartData = ref({});

const route = useRoute();
const router = useRouter();
const period = ref(route.query.period || 'CURRENT_MONTH');

const appConfig = useAppConfig()
const textColor = appConfig.theme.dark ? '#e2e8f0' : '#334155';
const CHART_HEIGTH = 500;
const CHART_TYPE = 'line';


const series = computed(() => chartData.value.series);
const categories = computed(() => chartData.value.categories);

const load = async () => {
  isLoading.value = true;
  isError.value = false;

  try {
    const result = await api.chartBalances(token.value, period.value);
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

const setPeriod = (value) => {
  period.value = value;

  router.replace({
    query: {
      ...route.query,
      period: value,
    },
  });
};

watch([token, period], ([t]) => {
  if (t) load();
}, { immediate: true });

watch(() => route.query.period, (newPeriod) => {
  if (newPeriod && newPeriod !== period.value) {
    period.value = newPeriod;
  }
});
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
        colors: textColor,
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
        colors: textColor,
      }
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
      colors: textColor,
    },
  },
  // labels: [
  //   '2020-06-21', '2020-06-22', '2020-06-23', '2020-06-24',
  //   '2020-06-25', '2020-06-26', '2020-06-27', '2020-06-28',
  //   '2020-06-29', '2020-06-30', '2020-07-01', '2020-07-02'
  // ],
}));
</script>

<template>
  <div class='row'>
    <div class='col-sm-12 col-lg-9 col-xl-10'>
      <div class='card'>
        <div class='card-header border-bottom-0'>
          <h2 class='my-2'>Отчёты</h2>
          <div class='card-actions'>
            <nav class='nav nav-segmented w-100' role='tablist'>
              <button
                class="nav-link"
                :class="{ active: period === 'CURRENT_MONTH' }"
                @click="setPeriod('CURRENT_MONTH')"
              >
                Текущий месяц
              </button>
              <button
                class="nav-link"
                :class="{ active: period === 'YEARS_1' }"
                @click="setPeriod('YEARS_1')"
              >
                Год
              </button>
              <button
                class="nav-link"
                :class="{ active: period === 'YEARS_2' }"
                @click="setPeriod('YEARS_2')"
              >
                Два года
              </button>
              <button
                class="nav-link"
                :class="{ active: period === 'YEARS_5' }"
                @click="setPeriod('YEARS_5')"
              >
                Пять лет
              </button>
              <button
                class="nav-link"
                :class="{ active: period === 'ALL' }"
                @click="setPeriod('ALL')"
              >
                Всё время
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div class='card mt-3'>
        <div class='card-header'>
          <h3 class='card-title'>Баланс</h3>
        </div>
        <div class='card-body'>
          <div v-if='isLoading' class='text-center w-full'>
            <PlaceholderLoading />
          </div>
          <div v-else-if='!isError' class='w-full'>
            <VueApexCharts
              :type=CHART_TYPE
              :height=CHART_HEIGTH
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

      <AlertWarning
        class='mt-3'
        title='В разработке'
        description='Не обращайте внимание'
      />
    </div>

    <div class='col-sm-12 col-lg-3 col-xl-2'>
      <FilterAccounts />
      <FilterCategories />
      <FilterProjects />
      <FilterProperties />
    </div>
  </div>
</template>
