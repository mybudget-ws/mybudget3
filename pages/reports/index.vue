<script setup>
import VueApexCharts from 'vue3-apexcharts';

const appConfig = useAppConfig()
const textColor = appConfig.theme.dark ? '#e2e8f0' : '#334155';
const CHART_HEIGTH = 400;

const series = [
  {
    name: 'Наличные',
    data: [117, 92, 94, 98, 75, 110, 69, 80, 109, 113, 115,
      95]
  }, {
    name: 'Счёт 2',
    data: [59, 80, 61, 66, 70, 84, 87, 64, 94, 56, 55, 67]
  }, {
    name: 'Счёт 3',
    data: [53, 51, 52, 41, 46, 60, 45, 43, 30, 50, 58, 59]
  }
]

const chartOptions = {
  chart: {
    type: 'line',
    fontFamily: 'inherit',
    height: CHART_HEIGTH,
    parentHeightOffset: 0,
    toolbar: { show: false, },
    animations: { enabled: false },
  },
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
    // categories: [1991,1992,1993,1994,1995,1996,1997,1998,1999]
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
  labels: [
    '2020-06-21', '2020-06-22', '2020-06-23', '2020-06-24',
    '2020-06-25', '2020-06-26', '2020-06-27', '2020-06-28',
    '2020-06-29', '2020-06-30', '2020-07-01', '2020-07-02'
  ],
}
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
                class="nav-link active"
                role="tab"
                data-bs-toggle="tab"
                aria-selected="true" aria-current="page"
              >
                Текущий месяц
              </button>
              <button
                class="nav-link"
                role="tab"
                data-bs-toggle="tab"
                aria-selected="false"
                tabindex="-1"
              >
                Год
              </button>
              <button
                class="nav-link"
                role="tab"
                data-bs-toggle="tab"
                aria-selected="false"
                tabindex="-1"
              >
                Два года
              </button>
              <button
                class="nav-link"
                role="tab"
                data-bs-toggle="tab"
                aria-selected="false"
                tabindex="-1"
              >
                Пять лет
              </button>
              <button
                class="nav-link"
                role="tab"
                data-bs-toggle="tab"
                aria-selected="false"
                tabindex="-1"
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
          <VueApexCharts
            type='line'
            :height='CHART_HEIGTH'
            :options='chartOptions'
            :series='series'
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
