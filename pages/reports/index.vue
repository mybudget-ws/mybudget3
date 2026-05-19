<script setup>
import VueApexCharts from 'vue3-apexcharts';
import api from '~/lib/api';
import { CHART_COLORS } from '~/lib/consts';
import { useAuth } from '~/composables/use_auth';
import { parseNumberArray, parseStringArray } from '~/lib/helper_parsers';

const { token } = useAuth();
const route = useRoute();
const router = useRouter();
const appConfig = useAppConfig();

const isLoading = ref(true);
const isError = ref(false);
const chartData = ref({});

const CHART_HEIGTH = 500;
const CHART_TYPE = 'line';
const PERIODS = {
  CURRENT_MONTH: 'Текущий месяц',
  YEARS_1: 'Год',
  YEARS_2: 'Два года',
  YEARS_5: 'Пять лет',
  ALL: 'Всё время',
};
const isPeriodValid = (value) => (!!PERIODS[value]);
const period = ref(isPeriodValid(route.query.period) ? route.query.period : 'CURRENT_MONTH');

const textColor = computed(() =>
  appConfig.theme.dark ? '#e2e8f0' : '#334155'
);
const series = computed(() => chartData.value.series);
const categories = computed(() => chartData.value.categories);

const filters = computed(() => {
  return {
    period: period.value,
    accountIds: parseNumberArray(route.query.accounts),
    categoryIds: parseNumberArray(route.query.categories),
    projectIds: parseNumberArray(route.query.projects),
    propertyIds: parseNumberArray(route.query.properties),
    kinds: parseStringArray(route.query.kinds),
  };
});

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

const setPeriod = (value) => {
  period.value = value;

  router.push({
    query: {
      ...route.query,
      period: value,
    },
  });
};

const toggleQueryFilter = (queryKey, id, parser, formatter = (arr) => arr.join(',')) => {
  const current = parser(route.query[queryKey]);
  const newValues = current.includes(id)
    ? current.filter(item => item !== id)
    : [...current, id];
  
  const nextQuery = { ...route.query };
  if (newValues.length) nextQuery[queryKey] = formatter(newValues);
  else delete nextQuery[queryKey];
  
  router.replace({ query: nextQuery });
};

const onCategoryClick = (id) => {
  toggleQueryFilter('categories', id, parseNumberArray);
};

const onAccountClick = (id) => {
  toggleQueryFilter('accounts', id, parseNumberArray);
};

const onProjectClick = (id) => {
  toggleQueryFilter('projects', id, parseNumberArray);
};

const onPropertyClick = (id) => {
  toggleQueryFilter('properties', id, parseNumberArray);
};

const onKindClick = (id) => {
  toggleQueryFilter('kinds', id, parseStringArray);
};

watch(() => route.query.period, (newPeriod) => {
  if (isPeriodValid(newPeriod) && newPeriod !== period.value) {
    period.value = newPeriod;
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
                v-for="[key, label] in Object.entries(PERIODS)"
                :key='key'
                class='nav-link'
                :class="{ active: period === key }"
                @click="setPeriod(key)"
              >
                {{ label }}
              </button>
            </nav>
          </div>
        </div>
        <div v-if="isTopFiltersVisible" class="card-body border-top">
          <div class="badges-list">
            <BadgeCategory
              v-for="kind in selectedKinds"
              :key="kind.id"
              :name="kind.name"
              :is-x="true"              
              @click="onKindClick(kind.id)"
            />

            <BadgeAccount
              v-for="account in selectedAccounts"
              :key="account.id"
              :name="account.name"
              :is-x="true"
              @click="onAccountClick(account.id)"
            />

            <BadgeCategory
              v-for="category in selectedCategories"
              :key="category.id"
              :name="category.name"
              :is-x="true"
              @click="onCategoryClick(category.id)"
            />

            <BadgeProject
              v-for="project in selectedProjects"
              :key="project.id"
              :name="project.name"
              :is-x="true"
              @click="onProjectClick(project.id)"
            />

            <BadgeProperty
              v-for="property in selectedProperties"
              :key="property.id"
              :name="property.name"
              :is-x="true"
              @click="onPropertyClick(property.id)"
            />
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
      <FilterKinds @update:items="onKindsChange" />
      <FilterAccounts @update:items='onAccountsChange' />
      <FilterCategories @update:items='onCategoriesChange' />
      <FilterProjects @update:items='onProjectsChange' />
      <FilterProperties @update:items='onPropertiesChange' />
    </div>
  </div>
</template>
