<script setup>
import {
  IconArrowDown,
  IconArrowUp,
  IconArrowsRightLeft,
  IconCopy,
} from '@tabler/icons-vue';

import api from '~/lib/api';
import { formatDate, formatDateFull } from '~/lib/helper_date';
import { useAuth } from '~/composables/use_auth';

const { token } = useAuth();
const isLoading = ref(true);
const isError = ref(false);
const isInitialLoading = ref(true);
const dashboard = ref({});

const KIND_EXPENSE = 'expense';
const KIND_INCOME = 'income';

const isShowModal = ref(false);
const isShowModalTransfer = ref(false);
const currentKind = ref(KIND_INCOME);
const isCopyItem = ref(false);
const currentItem = ref(null);
const selectedTransferAccountId = ref(null);

const openCreate = (kind) => {
  currentItem.value = null;
  currentKind.value = kind;
  isCopyItem.value = false;
  isShowModal.value = true;
};

const openCreateTransfer = (accountId = NaN) => {
  selectedTransferAccountId.value = accountId;
  isShowModalTransfer.value = true;
};

const onSaved = async () => {
  closeModals();
  await load();
};

const closeModals = () => {
  isShowModal.value = false;
  isShowModalTransfer.value = false;
  isCopyItem.value = false;
  currentItem.value = null;
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
    isInitialLoading.value = false;
  }
};

const accounts = computed(() => {
  if (isInitialLoading.value) return [];
  if (!dashboard.value.accounts) return [];

  return dashboard.value.accounts;
});

const openCopy = (item) => {
  currentItem.value = { ...item, id: undefined };
  currentKind.value = item.amount > 0 ? KIND_INCOME : KIND_EXPENSE;
  isCopyItem.value = true;
  isShowModal.value = true;
};

const assets = computed(() => {
  if (isInitialLoading.value) return [];
  if (!dashboard.value.assets) return [];

  return dashboard.value.assets;
});

watch(token, (val) => {
  if (val) load();
}, { immediate: true });

</script>

<template>
  <ModalNewTransaction
    v-if='isShowModal'
    :kind='currentKind'
    :item='currentItem'
    :is-copy='isCopyItem'
    @saved='onSaved'
    @close='closeModals'
  />

  <ModalNewTransfer
    v-if='isShowModalTransfer'
    :initial-account-id='selectedTransferAccountId'
    @saved='onSaved'
    @close='closeModals'
  />
  <div class='row align-items-center mb-4'>
    <div class='col'>
      <div v-if='isInitialLoading' class='text-start placeholder-glow' style='margin-bottom: .3rem;'>
        <div class='d-block placeholder col-1 mb-2' />
        <div class='d-block placeholder placeholder-lg col-2' />
      </div>
      <template v-else>
        <div class='page-pretitle'>Обзор</div>
        <h2 class='page-title d-flex align-items-center gap-2'>
          {{ dashboard?.currentMonth }}
          <span
            v-if='isLoading'
            class='spinner-border spinner-border-sm text-primary'
            role='status'
          />
        </h2>
      </template>
    </div>
    <div class='col-md-auto col-sm-12'>
      <div class='ms-auto d-flex flex-wrap btn-list'>
        <button
          class='btn btn-outline-green'
          type='button'
          @click='openCreate(KIND_INCOME)'
        >
          <IconArrowUp stroke-width='2' />
        </button>

        <button
          class='btn btn-outline-secondary'
          type='button'
          @click='openCreateTransfer()'
        >
          <IconArrowsRightLeft stroke-width='2' />
        </button>

        <button
          class='btn btn-primary'
          type='button'
          @click='openCreate(KIND_EXPENSE)'
        >
          <IconArrowDown stroke-width='2' />
        </button>
      </div>
    </div>
  </div>

  <div class='row row-deck row-cards'>
    <div class='col-lg-6'>
      <DashboardBlock
        title='Доходы'
        :is-loading='isInitialLoading'
        :colors='["#0ca678"]'
        :chart-data='dashboard.incomesChart'
      >
        <div class='card-table table-responsive'>
          <table class='table table-sm table-vcenter'>
            <thead>
              <tr>
                <th class='w-1 text-nowrap'>Дата</th>
                <th class='w-1 text-nowrap'>Счёт</th>
                <th>Категории</th>
                <th class='text-nowrap text-end'>Величина</th>
                <th class='w-1'/>
              </tr>
            </thead>
            <tbody>
              <tr v-for='item in dashboard.incomes' :key='item.id'>
                <td :title='formatDateFull(item.dateAt)'>
                  {{ formatDate(item.dateAt) }}
                </td>
                <td>
                  <BadgeAccount :name='item.account.name' :is-clickable='false' />
                </td>
                <td>
                  <div class='badges-list'>
                    <BadgeCategory
                      v-for='cat in item.categories'
                      :key='cat.id'
                      :name='cat.name'
                      :is-clickable='false'
                      @click='onCategoryClick(cat.id)'
                    />
                  </div>
                </td>
                <td class='text-nowrap text-end text-success'>
                  <Amount
                    :value='item.amount'
                    :currency='item.account.currency.name'
                  />
                </td>
                <td>
                  <button
                    v-tooltip:bottom='"Повторить операцию"'
                    type='button'
                    class='btn btn-action'
                    @click='openCopy(item)'
                  >
                    <IconCopy size='18' stroke-width='1' />
                  </button>
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
        :is-loading='isInitialLoading'
        :chart-data='dashboard.expensesChart'
      >
        <div class='card-table table-responsive'>
          <table class='table table-sm table-vcenter'>
            <thead>
              <tr>
                <th class='w-1 text-nowrap'>Дата</th>
                <th class='w-1 text-nowrap'>Счёт</th>
                <th>Категории</th>
                <th class='text-nowrap text-end'>Величина</th>
                <th class='w-1'/>
              </tr>
            </thead>
            <tbody>
              <tr v-for='item in dashboard.expenses' :key='item.id'>
                <td :title='formatDateFull(item.dateAt)'>
                  {{ formatDate(item.dateAt) }}
                </td>
                <td>
                  <BadgeAccount :name='item.account.name' :is-clickable='false' />
                </td>
                <td>
                  <div class='badges-list'>
                    <BadgeCategory
                      v-for='cat in item.categories'
                      :key='cat.id'
                      :name='cat.name'
                      :is-clickable='false'
                      @click='onCategoryClick(cat.id)'
                    />
                  </div>
                </td>
                <td class='text-nowrap text-end text-danger'>
                  <Amount
                    :value='item.amount'
                    :currency='item.account.currency.name'
                  />
                </td>
                <td>
                  <button
                    v-tooltip:bottom='"Повторить операцию"'
                    type='button'
                    class='btn btn-action'
                    @click='openCopy(item)'
                  >
                    <IconCopy size='18' stroke-width='1' />
                  </button>
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
        chart-type='donut'
        :is-loading='isInitialLoading'
        :chart-data='dashboard.accountsChart'
      >
        <div class='card-table table-responsive'>
          <table class='table table-sm table-vcenter'>
            <thead>
              <tr>
                <th class='text-nowrap'>Название</th>
                <th class='w-1 text-nowrap text-end'>Баланс</th>
                <th class='w-1' />
              </tr>
            </thead>
            <tbody>
              <tr v-for='item in accounts' :key='item.id'>
                <td class='text-nowrap'>{{ item.name }}</td>
                <td class='text-nowrap text-end'>
                  <span
                    :class='{
                      "text-success": item.balance > 0,
                      "text-danger": item.balance < 0
                    }'
                  >
                    <Amount
                      :value='item.balance'
                      :currency='item.currency.name'
                    />
                  </span>
                </td>
                <td>
                  <button
                    v-tooltip:bottom='"Создать перевод"'
                    type='button'
                    class='btn btn-action'
                    @click='openCreateTransfer(item.id)'
                  >
                    <IconArrowsRightLeft size='18' stroke-width='1' />
                  </button>
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
        chart-type='donut'
        :is-loading='isInitialLoading'
        :chart-data='dashboard.assetsChart'
      >
        <div class='card-table table-responsive'>
          <table class='table table-sm table-vcenter'>
            <thead>
              <tr>
                <th class='text-nowrap'>Название</th>
                <th class='w-1 text-nowrap text-end'>Величина</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for='item in assets' :key='item.id'>
                <td class='no-button-padding'>
                  {{ item.name }}
                  <span v-if='item.tag' class='badge ms-2'>
                    {{ item.tag }}
                  </span>
                </td>
                <td class='text-nowrap text-end'>
                  <Amount
                    :value='item.amount'
                    :currency='item.currency.name'
                    is-color
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </DashboardBlock>
    </div>
  </div>
</template>

<style scoped>
.no-button-padding {
  padding-top: 0.88rem;
  padding-bottom: 0.88rem;
}
</style>
