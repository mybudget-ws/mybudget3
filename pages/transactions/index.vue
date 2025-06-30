<script setup>
import {
  IconSearch,
  IconArrowDown,
  IconArrowsRightLeft,
  IconArrowUp,
} from '@tabler/icons-vue';

import api from '~/lib/api';
import { useAuth } from '~/composables/use_auth';

const appConfig = useAppConfig();
const { token } = useAuth();
const isLoading = ref(false);
const transactions = ref([]);
const page = ref(1);
const PER_PAGE = 100;
const LOCALE = 'ru-RU';

const params = computed(() => ({
  page: page.value,
  perPage: PER_PAGE,
  filters: {
    accountIds: [],
    categoryIds: [],
    projectIds: [],
    propertyIds: []
  }
}));

const load = async () => {
  isLoading.value = true
  try {
    const items = await api.transactions(token.value, params.value);
    if (items) {
      transactions.value = items
    } else {
      console.log('TODO: error');
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false
  }
};

const formatAmount = (amount) => {
  const formatter = new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  });

  const absFormatted = formatter.format(Math.abs(amount));
  return amount < 0 ? `−${absFormatted}` : absFormatted;
};

const badgeStyles = (color) => {
  return appConfig.theme.dark ?
    { color: color } :
    { backgroundColor: color };
};

watch(
  () => token.value,
  (val) => {
    if (val) {
      load();
    }
  },
  { immediate: true }
);
</script>

<template>
  <!-- https://tabler.io/admin-template/preview -->
  <div class='card'>
    <div class='card-table'>
      <div class='card-header pe-0'>
        <div class='row w-full align-items-center'>
          <div class='col'>
            <!--h1 class='card-title mb-0'>Операции</h1-->
            <h2 class='mb-0'>Операции</h2>
            <!--p class="text-secondary m-0">Table description.</p-->
          </div>
          <div class="col-md-auto col-sm-12">
            <div class="ms-auto d-flex flex-wrap btn-list">
              <div class="input-group input-group-flat w-auto">
                <span class="input-group-text">
                  <IconSearch size=20 stroke-width=1 />
                </span>
                <input id='advanced-table-search' type='text' class='form-control'>
                <!--span class="input-group-text">
                  <kbd>ctrl + K</kbd>
                </span-->
              </div>
              <a href="#" class='btn btn-outline-green'>
                <IconArrowUp stroke-width=2 />
              </a>
              <a href="#" class='btn btn-outline-secondary'>
                <IconArrowsRightLeft stroke-width=2 />
              </a>
              <a href="#" class='btn btn-primary'>
                <IconArrowDown stroke-width=2 />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div v-if='isLoading' class='card-body text-center'>
        <Loading />
      </div>
      <div v-else class='advanced-table'>
        <div class='table-responsive'>
          <table class='table table-vcenter table-selectable'>
            <thead>
              <tr>
                <th class='w-1'>
                  <button class='table-sort d-flex' data-sort='sort-name'>
                    Дата
                  </button>
                </th>
                <th class='d-flex justify-content-end'>
                  <button class='table-sort d-flex justify-content-end' data-sort='sort-city'>
                    Величина
                  </button>
                </th>
                <th>Категории</th>
                <th>Описание</th>
              </tr>
            </thead>
            <tbody class='table-tbody'>
              <tr v-for="tx in transactions" :key="tx.id">
                <td>
                  {{ new Date(tx.dateAt).toLocaleDateString(LOCALE) }}
                </td>
                <td class='text-nowrap text-end'>
                  <span :class="{
                    'text-success': !tx.isTransfer && tx.amount > 0,
                    'text-danger': !tx.isTransfer && tx.amount < 0
                  }">
                    <span class='font-monospace'>
                      {{ formatAmount(tx.amount) }}
                    </span>
                    <span class='text-secondary fw-light ms-1'>
                      {{ tx.account.currency.name }}
                    </span>
                  </span>
                </td>
                <td>
                  <div class='badges-list'>
                    <span
                      v-for='cat in tx.categories'
                      :key='cat.id'
                      class='badge'
                      :style='badgeStyles(cat.color)'
                    >
                      {{ cat.name }}
                    </span>
                  </div>
                </td>
                <td>{{ tx.description }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class='card-footer d-flex align-items-center'>
          <!--div class='dropdown'>
            <a class='btn dropdown-toggle' data-bs-toggle='dropdown'>
              <span id='page-count' class='me-1'>20</span>
              <span>records</span>
            </a>
            <div class="dropdown-menu">
              <a class="dropdown-item" data-value="10">10 records</a>
              <a class="dropdown-item" data-value="20">20 records</a>
              <a class="dropdown-item" data-value="50">50 records</a>
              <a class="dropdown-item" data-value="100">100 records</a>
            </div>
          </div>
          <ul class="pagination m-0 ms-auto">
            <li class="page-item active">
              <a class="page-link cursor-pointer" data-i="1" data-page="20">1</a>
            </li>
            <li class="page-item">
              <a class="page-link cursor-pointer" data-i="2" data-page="20">2</a>
            </li>
            <li class="page-item disabled">
              <a class="page-link cursor-pointer">...</a></li><li class="page-item"><a class="page-link cursor-pointer" data-i="7" data-page="20">7</a></li></ul>
          -->
        </div>
      </div>
    </div>
  </div>
</template>
