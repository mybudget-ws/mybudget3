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
import { useDevice } from '~/composables/use_device';

const { isMobile } = useDevice();
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

const currencyBaseName = computed(() => {
  if (accounts.value.length === 0) return '';
  return accounts.value[0].currencyBase.name;
});

const totalAccountsBalanceBase = computed(() => {
  return accounts.value?.reduce((sum, a) => {
    return sum + a.balanceBase;
  }, 0) || 0
});

const totalAssetsAmountBase = computed(() => {
  return assets.value?.reduce((sum, a) => {
    return sum + a.amountBase;
  }, 0) || 0
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
  <div
    class='row align-items-center'
    :class='isMobile ? "mb-2" : "mb-4"'
  >
    <div class='col'>
      <div v-if='isInitialLoading' class='text-start placeholder-glow' style='margin-bottom: .3rem;'>
        <div class='d-block placeholder col-1 mb-2' />
        <div class='d-block placeholder placeholder-lg col-2' />
      </div>
      <template v-else>
        <div class='page-pretitle'>Обзор</div>
        <h2
          class='page-title d-flex align-items-center gap-2'
          :class='{ "mb-1": isMobile }'
        >
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
        empty-text='Доходов в этом месяце пока нет'
        empty-footer-text='Доходов ещё нет'
        :is-empty-footer='dashboard.incomes.length === 0'
        :to='{
          path: "/transactions",
          query: {
            kinds: "INCOME",
          },
        }'
        :is-loading='isInitialLoading'
        :colors='["#0ca678"]'
        :chart-data='dashboard.incomesChart'
      >
        <div v-if='!isLoading && isMobile'>
          <div
            v-for='(item, index) in dashboard.incomes'
            :key='item.id'
            class='card-header'
            :class='{ "border-bottom-0": index === dashboard.incomes.length - 1 }'
          >
            <div class='flex-fill'>

              <div class='card-title'>
                {{ formatDate(item.dateAt) }}
              </div>

              <div class='text-secondary mt-1'>
                {{ item.account.name }}
              </div>

              <div class='mt-1'>
                <Amount
                  :value='item.amount'
                  :currency='item.account.currency.name'
                  class='text-success'
                  copyable
                />
              </div>

              <div class='badges-list mt-2'>
                <BadgeCategory
                  v-for='cat in item.categories'
                  :key='cat.id'
                  :name='cat.name'
                  :is-clickable='false'
                />
              </div>

            </div>

            <div class='card-actions'>
              <button
                v-tooltip:bottom='"Повторить операцию"'
                type='button'
                class='btn btn-action'
                @click='openCopy(item)'
              >
                <IconCopy size='18' stroke-width='1' />
              </button>
            </div>
          </div>
        </div>


        <div v-else class='card-table table-responsive'>
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
                    copyable
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
        empty-icon-color='text-red'
        empty-text='Расходов в этом месяце пока нет'
        empty-footer-text='Расходов ещё нет'
        :is-empty-footer='dashboard.expenses.length === 0'
        :to='{
          path: "/transactions",
          query: {
            kinds: "EXPENSE",
          },
        }'
        :is-loading='isInitialLoading'
        :chart-data='dashboard.expensesChart'
      >
        <div v-if='!isLoading && isMobile'>
          <div
            v-for='(item, index) in dashboard.expenses'
            :key='item.id'
            class='card-header'
            :class='{ "border-bottom-0": index === dashboard.expenses.length - 1 }'
          >
            <div class='flex-fill'>

              <div class='card-title'>
                {{ formatDate(item.dateAt) }}
              </div>

              <div class='text-secondary mt-1'>
                {{ item.account.name }}
              </div>

              <div class='mt-1'>
                <Amount
                  :value='item.amount'
                  :currency='item.account.currency.name'
                  class='text-danger'
                  copyable
                />
              </div>

              <div class='badges-list mt-2'>
                <BadgeCategory
                  v-for='cat in item.categories'
                  :key='cat.id'
                  :name='cat.name'
                  :is-clickable='false'
                />
              </div>

            </div>

            <div class='card-actions'>
              <button
                v-tooltip:bottom='"Повторить операцию"'
                type='button'
                class='btn btn-action'
                @click='openCopy(item)'
              >
                <IconCopy size='18' stroke-width='1' />
              </button>
            </div>
          </div>
        </div>

        <div v-else class='card-table table-responsive'>
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
                    copyable
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
        empty-text='Нет операций, или баланс счетов отрицательный'
        empty-icon='pie'
        empty-icon-color='text-blue'
        :to='{
          path: "/accounts",
        }'
        chart-type='donut'
        :is-loading='isInitialLoading'
        :chart-data='dashboard.accountsChart'
      >
        <div v-if='!isLoading && isMobile'>
          <div class='card-header'>
            <div class='flex-fill'>
              <div class='card-title'>
                Всего
              </div>

              <div class='mt-1'>
                <Amount
                  :value='totalAccountsBalanceBase'
                  :currency='currencyBaseName'
                  class='text-success'
                  copyable
                />
              </div>
            </div>
          </div>

          <div
            v-for='(item, index) in accounts'
            :key='item.id'
            class='card-header'
            :class='{ "border-bottom-0": index === accounts.length - 1 }'
          >
            <div class='flex-fill'>
              <div class='card-title'>
                {{ item.name }}
              </div>
              <div class='mt-1'>
                <Amount
                  :value='item.balance'
                  :currency='item.currency.name'
                  is-color
                  copyable
                />
              </div>
            </div>
            <div class='card-actions'>
              <button
                v-tooltip:bottom='"Создать перевод"'
                type='button'
                class='btn btn-action'
                @click='openCreateTransfer(item.id)'
              >
                <IconArrowsRightLeft
                  size='18'
                  stroke-width='1'
                />
              </button>
            </div>
          </div>
        </div>
        <div v-else class='card-table table-responsive'>
          <table class='table table-sm table-vcenter'>
            <thead>
              <tr>
                <th class='text-nowrap'>Название</th>
                <th class='w-1 text-nowrap text-end'>Баланс</th>
                <th class='w-1' />
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class='text-secondary'><b>Всего</b></td>
                <td class='text-end no-button-padding'>
                  <Amount
                    :value='totalAccountsBalanceBase'
                    :currency='currencyBaseName'
                    is-color
                    copyable
                  />
                </td>
                <td />
              </tr>
              <tr v-for='item in accounts' :key='item.id'>
                <td class='text-nowrap'>{{ item.name }}</td>
                <td class='text-nowrap text-end'>
                  <Amount
                    :value='item.balance'
                    :currency='item.currency.name'
                    is-color
                    copyable
                  />
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
        empty-text='У вас пока нет активов'
        empty-icon='pie3'
        empty-icon-color='text-purple'
        chart-type='donut'
        :is-loading='isInitialLoading'
        :chart-data='dashboard.assetsChart'
      >
        <div v-if='!isLoading && isMobile'>
          <div class='card-header'>
            <div class='flex-fill'>
              <div class='card-title'>
                Всего
              </div>

              <div class='mt-1'>
                <Amount
                  :value='totalAssetsAmountBase'
                  :currency='currencyBaseName'
                  is-color
                  copyable
                />
              </div>
            </div>
          </div>

          <div
            v-for='(item, index) in assets'
            :key='item.id'
            class='card-header'
            :class='{ "border-bottom-0": index === assets.length - 1 }'
          >
            <div class='flex-fill'>

              <div class='card-title'>
                {{ item.name }}
                <span
                  v-if='item.tag'
                  class='badge ms-2'
                >
                  {{ item.tag }}
                </span>
              </div>

              <div class='mt-1'>
                <Amount
                  :value='item.amount'
                  :currency='item.currency.name'
                  is-color
                  copyable
                />
              </div>
            </div>
          </div>
        </div>

        <div v-else class='card-table table-responsive'>
          <table class='table table-sm table-vcenter'>
            <thead>
              <tr>
                <th class='text-nowrap'>Название</th>
                <th class='w-1 text-nowrap text-end'>Величина</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class='text-secondary'><b>Всего</b></td>
                <td class='text-end text-success no-button-padding'>
                  <Amount
                    :value='totalAssetsAmountBase'
                    :currency='currencyBaseName'
                    is-color
                    copyable
                  />
                </td>
              </tr>
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
                    copyable
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
