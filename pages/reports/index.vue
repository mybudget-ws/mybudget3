<script setup>
import VueApexCharts from 'vue3-apexcharts';
import api from '~/lib/api';
import { CHART_COLORS } from '~/lib/consts';
import { useAuth } from '~/composables/use_auth';
import { useChart } from '~/composables/use_chart';

const route = useRoute();
const { token } = useAuth();
const {
  CHART_LABEL_COLOR,
  CHART_HEIGTH,
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
const isLoading = ref(true);
const isError = ref(false);
const chartData = ref({});

const series = computed(() => chartData.value.series);
const categories = computed(() => chartData.value.categories);

const selectedAccounts = ref([]);
const selectedCategories = ref([]);
const selectedKinds = ref([]);
const selectedProjects = ref([]);
const selectedProperties = ref([]);

const isTopFiltersVisible = computed(() => (
  selectedCategories.value.length
    || selectedProjects.value.length
    || selectedAccounts.value.length
    || selectedProperties.value.length
    || selectedKinds.value.length
));

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
        colors: CHART_LABEL_COLOR,
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
        colors: CHART_LABEL_COLOR,
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
      colors: CHART_LABEL_COLOR,
    },
  },
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
                v-for='[key, label] in Object.entries(PERIODS)'
                :key='key'
                class='nav-link'
                :class='{ active: period === key }'
                @click='setPeriod(key)'
              >
                {{ label }}
              </button>
            </nav>
          </div>
        </div>
        <div
          v-if='isTopFiltersVisible'
          class='card-body border-top'
          :style='{ minHeight: "56px" }'
        >
          <div class='badges-list'>
            <BadgeCategory
              v-for='kind in selectedKinds'
              :key='kind.id'
              :name='kind.name'
              :is-x='true'              
              @click='onKindClick(kind.id)'
            />

            <BadgeAccount
              v-for='account in selectedAccounts'
              :key='account.id'
              :name='account.name'
              :is-x='true'
              @click='onAccountClick(account.id)'
            />

            <BadgeCategory
              v-for='category in selectedCategories'
              :key='category.id'
              :name='category.name'
              :is-x='true'
              @click='onCategoryClick(category.id)'
            />

            <BadgeProject
              v-for='project in selectedProjects'
              :key='project.id'
              :name='project.name'
              :is-x='true'
              @click='onProjectClick(project.id)'
            />

            <BadgeProperty
              v-for='property in selectedProperties'
              :key='property.id'
              :name='property.name'
              :is-x='true'
              @click='onPropertyClick(property.id)'
            />
          </div>
        </div>
      </div>

      <div class='card mt-3'>
        <div class='card-header'>
          <h3 class='card-title'>Баланс</h3>
          <NuxtLink
            to='/reports/transactions'
            class='card-title text-secondary ms-3'
          >
            Операции
          </NuxtLink>
        </div>

        <div class='card-body'>
          <div v-if='isLoading' class='text-center w-full'>
            <PlaceholderLoading />
          </div>
          <div v-else-if='!isError' class='w-full'>
            <VueApexCharts
              :type='CHART_TYPE'
              :height='CHART_HEIGTH'
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
      <FilterKinds @update:items='onKindsChange' />
      <FilterAccounts @update:items='onAccountsChange' />
      <FilterCategories @update:items='onCategoriesChange' />
      <FilterProjects @update:items='onProjectsChange' />
      <FilterProperties @update:items='onPropertiesChange' />
    </div>
  </div>
</template>
