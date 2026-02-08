<script setup>
import {
  IconArrowDown,
  IconArrowUp,
  IconArrowsRightLeft,
  IconBulb,
  IconCopy,
  IconPencil,
  IconSearch,
  IconShieldLock,
  IconTrash,
} from '@tabler/icons-vue';

import api from '~/lib/api';
import { useAuth } from '~/composables/use_auth';

const LOCALE = 'ru-RU';
const PER_PAGE = 50;
const KIND_EXPENSE = 'expense';
const KIND_INCOME = 'income';

const appConfig = useAppConfig();
const route = useRoute();
const { token } = useAuth();

const isLoading = ref(false);
const isQuiteLoading = ref(false);
const isCopyItem = ref(false);
const isShowModal = ref(false);
const isShowModalTransfer = ref(false);
const currentKind = ref(KIND_EXPENSE);
const currentItem = ref(null);
const page = ref(1);
const transactions = ref([]);
const transactionEventTicks = ref(1);

const filters = reactive({
  accountIds: [],
  categoryIds: [],
  projectIds: [],
  propertyIds: []
});

const params = computed(() => ({
  page: page.value,
  perPage: PER_PAGE,
  filters
}));

const load = async (isQuite = false) => {
  if (isQuite) {
    isQuiteLoading.value = true
  } else {
    isLoading.value = true
  }

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
    if (isQuite) transactionEventTicks.value++;
    isLoading.value = false;
    isQuiteLoading.value = false;
  }
};

const isEmpty = computed(() => {
  if (isLoading.value) return false;
  return transactions.value.length === 0;
});

const badgeClasses = (kind) => {
  if (appConfig.theme.dark) {
    return kind === 'project' ?
      'bg-azure-lt text-azure-lt-fg' :
      'bg-teal-lt text-teal-lt-fg';
  } else {
    return kind === 'project' ?
      'bg-azure text-azure-fg' :
      'bg-teal text-teal-fg';
  }
};

const filterKeys = {
  accounts: 'accountIds',
  categories: 'categoryIds',
  projects: 'projectIds',
  properties: 'propertyIds'
};

const applyFiltersFromQuery = () => {
  for (const [queryKey, filterKey] of Object.entries(filterKeys)) {
    const val = route.query[queryKey];

    if (typeof val === 'string' && val.length > 0) {
      filters[filterKey] = val.split(',').map(Number).filter(id => id > 0);
    } else if (Array.isArray(val)) {
      filters[filterKey] = val.map(Number).filter(id => id > 0);
    } else {
      filters[filterKey] = [];
    }
  }
};

const destroy = async ({ id }) => {
  if (confirm('Вы уверены, что хотите удалить операцию?')) {
    isQuiteLoading.value = true;
    await api.destroyTransaction(token.value, id);
    await load(true);
  }
};

const openCreate = (kind, isCopy = false) => {
  currentKind.value = kind;
  currentItem.value = null;
  isCopyItem.value = false;
  isShowModal.value = true;
};

const openEdit = (item) => {
  currentItem.value = { ...item };
  currentKind.value = item.amount > 0 ? KIND_INCOME : KIND_EXPENSE;
  isCopyItem.value = false;
  isShowModal.value = true;
};

const openCopy = (item) => {
  currentItem.value = { ...item, id: undefined };
  currentKind.value = item.amount > 0 ? KIND_INCOME : KIND_EXPENSE;
  isCopyItem.value = true;
  isShowModal.value = true;
};

const openCreateTransfer = () => {
  isShowModalTransfer.value = true;
};

const onSaved = async () => {
  isShowModal.value = false;
  isShowModalTransfer.value = false;
  isCopyItem.value = false;
  await load(true);
};

// Тут watchEffect не использую, т.к. похоже
// watch на route.query срабатывает.
//
// watchEffect(() => {
//   if (token.value) load();
// });
watch(
  () => route.query,
  () => {
    applyFiltersFromQuery();
    if (token.value) load();
  },
  { immediate: true }
);
</script>

<template>
  <ModalNewTransaction
    v-if='isShowModal'
    :kind='currentKind'
    :item='currentItem'
    :isCopy='isCopyItem'
    @saved='onSaved'
    @close="isShowModal = false"
  />
  <ModalNewTransfer
    v-if='isShowModalTransfer'
    @saved='onSaved'
    @close="isShowModalTransfer = false"
  />

  <div class='row'>
    <div class='col-sm-12 col-lg-9 col-xl-10'>
      <!-- https://tabler.io/admin-template/preview -->
      <div class='card'>
        <div class='card-table'>
          <div class='card-header pe-0'>
            <div class='row w-full align-items-center'>
              <div class='col d-flex align-items-center'>
                <h2 class='mb-0'>Операции</h2>
                <PlaceholderLoading v-if='isQuiteLoading' class='spinner-border-sm ms-2' />
                <!--h1 class='card-title mb-0'>Операции</h1-->
                <!--p class="text-secondary m-0">Table description.</p-->
              </div>
              <div class='col-md-auto col-sm-12'>
                <div class='ms-auto d-flex flex-wrap btn-list'>
                  <!--div class="input-group input-group-flat w-auto">
                    <span class="input-group-text">
                      <IconSearch size=20 stroke-width=1 />
                    </span>
                    <input id='advanced-table-search' type='text' class='form-control'>
                    <span class="input-group-text">
                      <kbd>Enter</kbd>
                    </span>
                  </div-->
                  <button
                    class='btn btn-outline-green'
                    @click="openCreate(KIND_INCOME)"
                  >
                    <IconArrowUp stroke-width=2 />
                  </button>
                  <button
                    class='btn btn-outline-secondary'
                    @click="openCreateTransfer()"
                  >
                    <IconArrowsRightLeft stroke-width=2 />
                  </button>
                  <button
                    class='btn btn-primary'
                    @click="openCreate(KIND_EXPENSE)"
                  >
                    <IconArrowDown stroke-width=2 />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-if='isLoading' class='card-body text-center'>
            <PlaceholderLoading />
          </div>
          <div v-else class='advanced-table'>
            <div class='table-responsive'>
              <table class='table table-vcenter table-selectable'>
                <thead>
                  <tr>
                    <th class='w-1 text-nowrap'>
                      <!--button class='table-sort d-flex' data-sort='sort-date'>
                        Дата
                      </button-->
                      Дата
                    </th>
                    <th class='w-1 text-nowrap text-end'>Величина</th>
                    <th class='w-1 text-nowrap'>Счёт</th>
                    <th>Категории</th>
                    <th>Описание</th>
                    <th class='w-1'></th>
                  </tr>
                </thead>
                <tbody class='table-tbody'>
                  <tr v-for="item in transactions" :key="item.id">
                    <td>
                      {{ new Date(item.dateAt).toLocaleDateString(LOCALE) }}
                    </td>
                    <td class='text-nowrap text-end'>
                      <span :class="{
                        'text-success': !item.isTransfer && item.amount > 0,
                        'text-danger': !item.isTransfer && item.amount < 0
                      }">
                        <Amount
                          :value='item.amount'
                          :currency='item.account.currency.name'
                        />
                      </span>
                    </td>
                    <td class='text-nowrap'>{{ item.account.name }}</td>
                    <td>
                      <div class='badges-list'>
                        <span
                          v-if='item.project'
                          class='badge'
                          :class='badgeClasses("project")'
                        >
                          <IconBulb size=12 stroke-width=2 />
                          {{ item.project.name }}
                        </span>
                        <span
                          v-if='item.property'
                          class='badge'
                          :class='badgeClasses("property")'
                        >
                          <IconShieldLock size=12 stroke-width=2 />
                          {{ item.property.name }}
                        </span>
                        <span
                          v-for='cat in item.categories'
                          :key='cat.id'
                          class='badge'
                        >
                          {{ cat.name }}
                        </span>
                      </div>
                    </td>
                    <td class='text-secondary'>{{ item.description }}</td>
                    <td>
                      <div class='btn-actions'>
                        <a
                          class='btn btn-action'
                          @click.prevent='openEdit(item)'
                        >
                          <IconPencil size=20 stroke-width=1 />
                        </a>
                        <a
                          class='btn btn-action'
                          v-tooltip:bottom="'Повторить операцию'"
                          @click.prevent='openCopy(item)'
                        >
                          <IconCopy size=20 stroke-width=1 />
                        </a>
                        <a class='btn btn-action' @click.prevent='destroy(item)'>
                          <IconTrash size=20 stroke-width=1 />
                        </a>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class='card-footer d-flex align-items-center'>
              <i v-if='isEmpty' class='text-secondary'>
                Похоже таких операций ещё нет
              </i>
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
    </div>
    <div class='col-sm-12 col-lg-3 col-xl-2'>
      <FilterAccounts :reload='transactionEventTicks' />
      <FilterCategories />
      <FilterProjects />
      <FilterProperties />
    </div>
  </div>
</template>
