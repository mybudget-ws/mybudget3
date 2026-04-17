<script setup>
import {
  IconArrowDown,
  IconArrowUp,
  IconArrowsRightLeft,
} from '@tabler/icons-vue';

const onIncome = () => alert('новых доход');
const onTransfer = () => alert('новых перевод')
const onExpense = () => alert('новых расход');
</script>

<template>
  <div class='row align-items-center mb-4'>
    <div class='col'>
      <div class='page-pretitle'>Overview</div>
      <h2 class='page-title'>Dashboard</h2>
    </div>
    <div class='col-md-auto col-sm-12'>
      <div class='ms-auto d-flex flex-wrap btn-list'>
        <button
          class='btn btn-outline-green'
          type='button'
          @click='onIncome'
        >
          <IconArrowUp stroke-width=2 />
        </button>
        <button
          class='btn btn-outline-secondary'
          type='button'
          @click='onTransfer'
        >
          <IconArrowsRightLeft stroke-width=2 />
        </button>
        <button
          class='btn btn-primary'
          type='button'
          @click='onExpense'
        >
          <IconArrowDown stroke-width=2 />
        </button>
      </div>
    </div>
  </div>

  <div class='row row-deck row-cards'>
    <div class='col-lg-6'>
      <DashboardBlock
        title='Доходы'
      />
    </div>

    <div class='col-lg-6'>
      <DashboardBlock
        title='Расходы'
      />
    </div>

    <div class='col-lg-6'>
      <DashboardBlock
        title='Счета'
      />
    </div>

    <div class='col-lg-6'>
      <DashboardBlock
        title='Все активы'
      />
    </div>
  </div>
</template>
