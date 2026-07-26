<script setup>
import VueApexCharts from 'vue3-apexcharts';
import { CHART_COLORS } from '~/lib/consts';
import {
  IconChartBar,
  IconChartPie2,
  IconChartPie3,
} from '@tabler/icons-vue';

// const appConfig = useAppConfig()
// const labelColor = appConfig.theme.dark ? '#e2e8f0' : '#334155';
const CHART_HEIGHT = 200;

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  to: {
    type: [String, Object],
    default: null,
  },
  colors: {
    type: Array,
    default: () => CHART_COLORS,
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
  emptyText: {
    type: String,
    required: true,
  },
  emptyIconColor: {
    type: String,
    default: 'text-green',
  },
  emptyIcon: {
    type: String,
    default: 'chart',
  },
  isEmptyFooter: {
    type: Boolean,
    default: false,
  },
  emptyFooterText: {
    type: String,
    default: '',
  },
});

const categories = computed(() => props.chartData?.categories || []);
const series = computed(() => props.chartData?.series || []);

const emptyIconComponent = computed(() => {
  if (props.emptyIcon === 'pie') {
    return IconChartPie2;
  }

  if (props.emptyIcon === 'pie3') {
    return IconChartPie3;
  }

  return IconChartBar;
});

const hasChartData = computed(() => {
  if (!series.value.length) return false;

  return series.value.some((item) => {
    if (Array.isArray(item.data)) {
      return item.data.some((value) => Number(value) !== 0);
    }

    return Number(item) !== 0;
  });
});

const chartOptions = computed(() => ({
  chart: {
    type: props.chartType,
    height: CHART_HEIGHT,
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
      // style: {
      //   colors: labelColor,
      // }
    },
  },
  yaxis: {
    show: false,
    labels: {
      padding: 4,
      // style: {
      //   colors: labelColor,
      // }
    },
  },
}));
</script>

<template>
  <div class='card'>
    <div class='card-header border-0'>
      <NuxtLink
        v-if='props.to'
        :to='props.to'
        class='card-title fw-medium text-reset'
      >
        {{ props.title }}
      </NuxtLink>

      <div
        v-else
        class='card-title'
      >
        {{ props.title }}
      </div>
    </div>

    <div class='p-3 border-bottom'>
      <div
        v-if='isLoading'
        class='text-center w-100'
      >
        <PlaceholderLoading />
      </div>

      <div
        v-else-if='hasChartData'
        class='w-100'
      >
        <VueApexCharts
          :type='chartType'
          :height='CHART_HEIGHT'
          :options='chartOptions'
          :series='series'
        />
      </div>

      <div
        v-else
        class='d-flex flex-column align-items-center justify-content-center'
        :style='{ height: `${CHART_HEIGHT}px` }'
      >
        <component
          :is='emptyIconComponent'
          :class='[emptyIconColor, "mb-3"]'
          :size='44'
          stroke-width='1.5'
        />
        <div class='text-secondary text-center'>
          {{ emptyText }}
        </div>
      </div>
    </div>

    <PlaceholderLoadingFilters v-if='isLoading' />
    <slot v-else />
    <div
      v-if='!isLoading && isEmptyFooter'
      class='card-footer bg-transparent'
    >
      <div class='text-secondary'>
        {{ emptyFooterText }}
      </div>
    </div>
  </div>
</template>
