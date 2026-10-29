<script setup>
import VueApexCharts from 'vue3-apexcharts';
import api from '~/lib/api';
import { CHART_COLORS, REPORTS_CHART_STORAGE_KEY } from '~/lib/consts';
import { useAuth } from '~/composables/use_auth';
import { useChart } from '~/composables/use_chart';
import { useDevice } from '~/composables/use_device';

const route = useRoute();
const { token } = useAuth();
const {
  CHART_HEIGHT,
  CHART_LABEL_COLOR,
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

const CHART_TYPE = 'bar';
const REPORT_FILTERS_STORAGE_KEY = 'reports-filters-order';

const defaultFilterOrder = [
  'kinds',
  'accounts',
  'categories',
  'projects',
  'properties',
];

const filterOrder = ref([...defaultFilterOrder]);
const draggedFilter = ref(null);
const isLoading = ref(true);
const isError = ref(false);
const chartData = ref({});

const { isMobile } = useDevice();
const series = computed(() => chartData.value.series);
const categories = computed(() => chartData.value.categories);

const selectedAccounts = ref([]);
const selectedCategories = ref([]);
const selectedKinds = ref([]);
const selectedProjects = ref([]);
const selectedProperties = ref([]);
const isShowMobileFilters = ref(false);

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

const loadFilterOrder = () => {
  if (!import.meta.client) return;

  try {
    const saved = JSON.parse(
      localStorage.getItem(REPORT_FILTERS_STORAGE_KEY)
    );

    if (!Array.isArray(saved)) return;

    const valid = saved.filter(key => defaultFilterOrder.includes(key));
    const missing = defaultFilterOrder.filter(key => !valid.includes(key));

    filterOrder.value = [...valid, ...missing];
  } catch {
    filterOrder.value = [...defaultFilterOrder];
  }
};

const saveFilterOrder = () => {
  if (!import.meta.client) return;

  localStorage.setItem(
    REPORT_FILTERS_STORAGE_KEY,
    JSON.stringify(filterOrder.value)
  );
};

const onFilterDragStart = (filter, event) => {
  draggedFilter.value = filter;

  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', filter);

  const filterItem = event.currentTarget.closest('.filter-item');

  if (filterItem) {
    event.dataTransfer.setDragImage(
      filterItem,
      event.clientX - filterItem.getBoundingClientRect().left,
      event.clientY - filterItem.getBoundingClientRect().top
    );
  }
};

const onFilterDragOver = (filter) => {
  if (!draggedFilter.value || draggedFilter.value === filter) return;

  const order = [...filterOrder.value];

  const fromIndex = order.indexOf(draggedFilter.value);
  const toIndex = order.indexOf(filter);

  if (fromIndex === -1 || toIndex === -1) return;

  const [moved] = order.splice(fromIndex, 1);
  order.splice(toIndex, 0, moved);

  filterOrder.value = order;
};

const onFilterDragEnd = () => {
  saveFilterOrder();
  draggedFilter.value = null;
};

onMounted(() => {
  if (!import.meta.client) return;

  loadFilterOrder();

  localStorage.setItem(
    REPORTS_CHART_STORAGE_KEY,
    'transactions'
  );
});

const load = async () => {
  isLoading.value = true;
  isError.value = false;

  try {
    const result = await api.chartTransactions(token.value, filters.value);
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
    height: CHART_HEIGHT,
    parentHeightOffset: 0,
    toolbar: { show: false, },
    animations: { enabled: false },
  },
  colors: CHART_COLORS,
  tooltip: { theme: 'dark' },
  stroke: { show: false },
  grid: {
    padding: {
      top: -20,
      right: 0,
      left: -4,
      bottom: -4
    },
    strokeDashArray: 4,
  },
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    categories: [...categories.value],
    labels: {
      padding: 0,
      style: {
        colors: CHART_LABEL_COLOR,
      }
    },
    tooltip: { enabled: false },
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
  // labels: [
  //   '2020-06-21', '2020-06-22', '2020-06-23', '2020-06-24',
  //   '2020-06-25', '2020-06-26', '2020-06-27', '2020-06-28',
  //   '2020-06-29', '2020-06-30', '2020-07-01', '2020-07-02'
  // ],
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
        <div v-if='isTopFiltersVisible' class='card-body border-top'>
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
          <NuxtLink
            :to='{ path: "/reports", query: { ...route.query, period, chart: "balance" } }'
            class='card-title text-secondary'
          >
            Баланс
          </NuxtLink>
          <h3 class='card-title ms-3'>Операции</h3>
        </div>
        <div class='card-body'>
          <div
            v-if='isLoading'
            class='d-flex align-items-center justify-content-center h-100'
            :style='{ minHeight: `${CHART_HEIGHT}px` }'
          >
            <PlaceholderLoading />
          </div>
          <div v-else-if='!isError' class='w-full'>
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
