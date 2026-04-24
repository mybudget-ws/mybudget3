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
const isLoading = ref(true);
const isError = ref(false);
const dashboard = ref({});

const KIND_EXPENSE = 'expense';
const KIND_INCOME = 'income';

const isShowModal = ref(false);
const isShowModalTransfer = ref(false);
const currentKind = ref(KIND_INCOME);
const isCopyItem = ref(false);

const openCreate = (kind) => {
  currentKind.value = kind;
  isCopyItem.value = false;
  isShowModal.value = true;
};

const openCreateTransfer = () => {
  isShowModalTransfer.value = true;
};

const onSaved = async () => {
  isShowModal.value = false;
  isShowModalTransfer.value = false;
  await load();
};
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

const accountsOrdered = computed(() => {
  if (isLoading.value) return [];
  if (!dashboard.value.accounts) return [];

  return [...dashboard.value.accounts].sort(
    (a, b) => b.balanceBase - a.balanceBase
  );
});

watch(token, (val) => {
  if (val) load();
}, { immediate: true });

</script>

<template>
  <ModalNewTransaction
    v-if="isShowModal"
    :kind="currentKind"
    :is-copy="isCopyItem"
    @saved="onSaved"
    @close="isShowModal = false"
  />

  <ModalNewTransfer
    v-if="isShowModalTransfer"
    @saved="onSaved"
    @close="isShowModalTransfer = false"
  />
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
          @click="openCreate(KIND_INCOME)"
        >
          <IconArrowUp stroke-width=2 />
        </button>

        <button
          class='btn btn-outline-secondary'
          type='button'
          @click="openCreateTransfer()"
        >
          <IconArrowsRightLeft stroke-width=2 />
        </button>

        <button
          class='btn btn-primary'
          type='button'
          @click="openCreate(KIND_EXPENSE)"
        >
          <IconArrowDown stroke-width=2 />
        </button>
      </div>
    </div>
  </div>

  <div class='row row-deck row-cards'>
    <div class='col-lg-6'>
      <DashboardBlock
        :key="`income-${isLoading}`"
        title='Доходы'
        :is-loading='isLoading'
        :colors="['#0ca678']"
        :chart-data='dashboard.incomesChart'
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
        :key="`expenses-${isLoading}`"
        title='Расходы'
        :is-loading='isLoading'
        :chart-data='dashboard.expensesChart'
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
        :key="`accounts-${isLoading}`"
        title='Счета'
        chart-type='line'
        :is-loading='isLoading'
        :chart-data='dashboard.accountsChart'
      >
        <div class='card-table table-responsive'>
          <table class='table table-vcenter'>
            <thead>
              <tr>
                <th class='text-nowrap'>Название</th>
                <th class='w-1 text-nowrap text-end'>Баланс</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for='item in accountsOrdered' :key='item.id'>
                <td class='text-nowrap'>{{ item.name }}</td>
                <td class='text-nowrap text-end'>
                  <span
                    :class="{
                      'text-success': item.balance > 0,
                      'text-danger': item.balance < 0
                    }"
                  >
                    <Amount
                      :value='item.balance'
                      :currency='item.currency.name'
                    />
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </DashboardBlock>
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
