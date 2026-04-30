<script setup>
import VueApexCharts from 'vue3-apexcharts';

const appConfig = useAppConfig()
const textColor = appConfig.theme.dark ? '#e2e8f0' : '#334155';
const CHART_HEIGTH = 200;

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  colors: {
    type: Array,
    default: () => [
      '#4263eb',
      '#0ca678',
      '#ae3ec9',
      '#17a2b8',
      '#f59f00',
      '#066fd1',
      '#74b816',
      '#4299e1',
      '#f76707',
      '#2fb344',
      '#d6336c',
      '#d63939',
    ],
  },
  chartType: {
    type: String,
    default: 'bar',
  },
  chartData: {
    type: Object,
    default: undefined,
  },
  isLoading: {
    type: Boolean,
    default: true,
  },
});

const categories = computed(() => props.chartData?.categories || []);
const series = computed(() => props.chartData?.series || []);

const chartOptions = computed(() => ({
  chart: {
    type: props.chartType,
    height: CHART_HEIGTH,
    parentHeightOffset: 0,
    toolbar: { show: false, },
    animations: { enabled: false },
    stacked: true,
    sparkline: { enabled: true },
  },
  colors: props.colors,
  labels: [...categories.value],
  tooltip: { theme: 'dark' },
  stroke: { show: false },
  grid: {
    show: false,
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  },
  plotOptions: {
    bar: {
      columnWidth: '86%',
    }
  },
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    categories: [...categories.value],
    offsetY: 0,
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      show: false,
      padding: 0,
      style: {
        colors: textColor,
      }
    },
  },
  yaxis: {
    show: false,
    labels: {
      padding: 4,
      style: {
        colors: textColor,
      }
    },
  },
}));
</script>

<template>
  <div class='card'>
    <div class='card-header border-0'>
      <div class='card-title'>
        {{ props.title }}
      </div>
    </div>

    <div class='p-3 d-flex'>
      <div v-if='isLoading' class='text-center w-full'>
        <PlaceholderLoading />
      </div>
      <div v-else class='w-full'>
        <VueApexCharts
          :type='props.chartType'
          :height=CHART_HEIGTH
          :options='chartOptions'
          :series='series'
        />
      </div>
    </div>

    <PlaceholderLoadingFilters v-if='isLoading' />
    <slot v-else />
  </div>
</template>
