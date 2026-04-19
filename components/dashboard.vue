<script setup>
import {
  IconArrowDown,
  IconArrowUp,
  IconArrowsRightLeft,
} from '@tabler/icons-vue';

import api from '~/lib/api';
import { formatDate, formatDateFull } from '~/lib/helper_date';
import { useAuth } from '~/composables/use_auth';

const { token } = useAuth();
const isLoading = ref(false);
const isError = ref(false);
const dashboard = ref({});

const onIncome = () => alert('новых доход');
const onTransfer = () => alert('новых перевод')
const onExpense = () => alert('новых расход');

const load = async () => {
  isLoading.value = true;
  isError.value = false;

  try {
    const result = await api.dashboard(token.value);
    if (result) {
      dashboard.value = result;
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

watch(token, (val) => {
  if (val) load();
}, { immediate: true });
</script>

<template>
  <div class='row align-items-center mb-4'>
    <div class='col'>
      <div v-if='isLoading' class='text-start placeholder-glow'>
        <div class='d-block placeholder col-1 mb-2' />
        <div class='d-block placeholder placeholder-lg col-2' />
      </div>
      <template v-else>
        <div class='page-pretitle'>Обзор</div>
        <h2 class='page-title'>{{ dashboard?.currentMonth }}</h2>
      </template>
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
        :is-loading='isLoading'
      >
        <div class='card-table table-responsive'>
          <table class='table table-vcenter'>
            <thead>
              <tr>
                <th class='w-1 text-nowrap'>Дата</th>
                <th class='w-1 text-nowrap'>Счёт</th>
                <th class='w-1 text-nowrap text-end'>Величина</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for='item in dashboard.incomes' :key='item.id'>
                <td :title='formatDateFull(item.dateAt)'>
                  {{ formatDate(item.dateAt) }}
                </td>
                <td class='text-nowrap'>{{ item.account.name }}</td>
                <td class='text-nowrap text-end text-success'>
                  <Amount
                    :value='item.amount'
                    :currency='item.account.currency.name'
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </DashboardBlock>
    </div>

    <div class='col-lg-6'>
      <DashboardBlock
        title='Расходы'
        :is-loading='isLoading'
      >
        <div class='card-table table-responsive'>
          <table class='table table-vcenter'>
            <thead>
              <tr>
                <th class='w-1 text-nowrap'>Дата</th>
                <th class='w-1 text-nowrap'>Счёт</th>
                <th class='w-1 text-nowrap text-end'>Величина</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for='item in dashboard.expenses' :key='item.id'>
                <td :title='formatDateFull(item.dateAt)'>
                  {{ formatDate(item.dateAt) }}
                </td>
                <td class='text-nowrap'>{{ item.account.name }}</td>
                <td class='text-nowrap text-end text-danger'>
                  <Amount
                    :value='item.amount'
                    :currency='item.account.currency.name'
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </DashboardBlock>
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
  <div class='row'>
    <div class='col'>
      <AlertWarning
        class='mt-3'
        title='В разработке'
        description='Не обращайте внимание'
      />
    </div>
  </div>
</template>
