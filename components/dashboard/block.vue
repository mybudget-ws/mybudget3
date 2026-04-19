<script setup>
import VueApexCharts from 'vue3-apexcharts';

const appConfig = useAppConfig()
const textColor = appConfig.theme.dark ? '#e2e8f0' : '#334155';
const CHART_HEIGTH = 200;
const CHART_TYPE = 'bar';

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  isLoading: {
    type: Boolean,
    default: true,
  },
});

const series = [
  {
    name: 'TODO',
    data: [117, 92, 94, 98, 75, 110, 69, 80, 109, 113, 115, 95]
  }
]

const chartOptions = {
  chart: {
    type: CHART_TYPE,
    fontFamily: 'inherit',
    height: CHART_HEIGTH,
    parentHeightOffset: 0,
    toolbar: { show: false, },
    animations: { enabled: false },
    stacked: true,
    sparkline: { enabled: true },
  },
  tooltip: { theme: 'dark' },
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
    categories: [
    '06.21', '06.22', '06.23', '06.24', '06.25', '06.26', '06.27', '06.28', '06.29', '06.30', '07.01', '07.02'
    ],
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
  colors: [
    '#4263eb',
  ],
}
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
          :type=CHART_TYPE
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
