<script setup>
import {
  IconArrowDown,
  IconArrowUp,
  IconArrowsRightLeft,
  IconBulbFilled,
  IconCopy,
  IconKeyFilled,
  IconPencil,
  IconTrash,
  IconX,
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconWallet
} from '@tabler/icons-vue';

import api from '~/lib/api';
import { formatDate, formatDateFull } from '~/lib/helper_date';
import { useAuth } from '~/composables/use_auth';

const PER_PAGE = 50;
const KIND_EXPENSE = 'expense';
const KIND_INCOME = 'income';

const appConfig = useAppConfig();
const route = useRoute();
const router = useRouter();
const { token } = useAuth();

const isLoading = ref(false);
const isQuiteLoading = ref(false);
const isLoaded = ref(false);
const isCopyItem = ref(false);
const isShowModal = ref(false);
const isShowModalTransfer = ref(false);
const isShowModalAccount = ref(false);
const currentKind = ref(KIND_EXPENSE);
const currentItem = ref(null);
const page = ref(1);
const transactions = ref([]);
const transactionEventTicks = ref(1);
const selectedCategories = ref([]);
const selectedProjects = ref([]);
const selectedAccounts = ref([]); 
const selectedProperties = ref([]);
const selectedKinds = ref([]);

const filters = computed(() => {
  const parse = (val) => {
    if (typeof val === 'string') {
      return val.split(',').map(Number).filter(Boolean);
    }
    if (Array.isArray(val)) {
      return val.map(Number).filter(Boolean);
    }
    return [];
  };

  return {
    accountIds: parse(route.query.accounts),
    categoryIds: parse(route.query.categories),
    projectIds: parse(route.query.projects),
    propertyIds: parse(route.query.properties),
    kinds: parseStringArray(route.query.kinds),
  };
});

const parseStringArray = (val) => {
  if (typeof val === 'string') {
    return val.split(',').filter(Boolean);
  }
  if (Array.isArray(val)) {
    return val.filter(Boolean);
  }
  return [];
};

const params = computed(() => ({
  page: page.value,
  perPage: PER_PAGE,
  filters: filters.value,
}));

const onCategoriesChange = (categories) => {
  selectedCategories.value = categories;
};

const onProjectsChange = (projects) => {
  selectedProjects.value = projects;
};

const onAccountsChange = (accounts) => {
  selectedAccounts.value = accounts;
};

const onPropertiesChange = (properties) => {
  selectedProperties.value = properties;
};

const onKindsChange = (kinds) => {
  selectedKinds.value = kinds;
};

const load = async (isQuite = false) => {
  if (isQuite) {
    isQuiteLoading.value = true
  } else {
    isLoading.value = true
  }

  try {
    const items = await api.transactions(token.value, params.value);
    if (items) {
      transactions.value = items;
      isLoaded.value = true;
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

const destroy = async ({ id }) => {
  if (confirm('Вы уверены, что хотите удалить операцию?')) {
    isQuiteLoading.value = true;
    await api.destroyTransaction(token.value, id);
    await load(true);
  }
};

const openCreate = (kind) => {
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
  isShowModalAccount.value = false;
  isCopyItem.value = false;
  await load(true);
};

// TODO: Подумать, унифицировать, этот код с кодом
//       в components/categories.vue
const onCategoryClick = (id) => {
  const current = route.query.categories ?
    route.query.categories.toString().split(',').map(Number).filter(Boolean) :
    [];

  const newCategories = current.includes(id) ?
    current.filter(c => c !== id) :
    [...current, id];

  const nextQuery = { ...route.query };

  if (newCategories.length > 0) {
    nextQuery.categories = newCategories.join(',');
  } else {
    delete nextQuery.categories;
  }

  router.replace({ query: nextQuery });
};

const onAccountNew = () => {
  isShowModal.value = false;
  isShowModalTransfer.value = false;
  isShowModalAccount.value = true;
};

const onProjectClick = (id) => {
  const current = route.query.projects
    ? route.query.projects.toString().split(',').map(Number).filter(Boolean)
    : [];

  const newProjects = current.includes(id)
    ? current.filter(p => p !== id)
    : [...current, id];

  const nextQuery = { ...route.query };

  if (newProjects.length > 0) {
    nextQuery.projects = newProjects.join(',');
  } else {
    delete nextQuery.projects;
  }

  router.replace({ query: nextQuery });
};

const onAccountClick = (id) => {
  const current = route.query.accounts
    ? route.query.accounts.toString().split(',').map(Number).filter(Boolean)
    : [];

  const newAccounts = current.includes(id)
    ? current.filter(a => a !== id)
    : [...current, id];

  const nextQuery = { ...route.query };

  if (newAccounts.length > 0) {
    nextQuery.accounts = newAccounts.join(',');
  } else {
    delete nextQuery.accounts;
  }

  router.replace({ query: nextQuery });
};
  
const onPropertyClick = (id) => {
  const current = route.query.properties
    ? route.query.properties.toString().split(',').map(Number).filter(Boolean)
    : [];

  const newProperties = current.includes(id)
    ? current.filter(p => p !== id)
    : [...current, id];

  const nextQuery = { ...route.query };
  
  if (newProperties.length > 0) {
    nextQuery.properties = newProperties.join(',');
  } else {
    delete nextQuery.properties;
  }

  router.replace({ query: nextQuery });
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
    :is-copy='isCopyItem'
    @saved='onSaved'
    @close="isShowModal = false"
    @account-new='onAccountNew'
  />
  <ModalNewTransfer
    v-if='isShowModalTransfer'
    @saved='onSaved'
    @close="isShowModalTransfer = false"
    @account-new='onAccountNew'
  />
  <ModalNewAccount
    v-if='isShowModalAccount'
    @saved='onSaved'
    @close="isShowModalAccount = false"
  />

  <div class='row'>
    <div class='col-sm-12 col-lg-9 col-xl-10'>
      <!-- https://tabler.io/admin-template/preview -->
      <div class='card'>
        <div class='card-table'>
          <div class='card-header pe-0'>
            <div class='row w-full align-items-center'>
              <div class='col'>
                <div class='d-flex align-items-center'>
                  <h2 class='mb-0'>Операции</h2>
                  <PlaceholderLoading v-if='isQuiteLoading' class='spinner-border-sm ms-2' />
                </div>
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
          </div>

          <div
            v-if='selectedCategories.length || selectedProjects.length || selectedAccounts.length || selectedProperties.length'
            class='card-body border-bottom'
          >
            <div class='badges-list'>
              <span
                v-for='category in selectedCategories'
                :key='category.id'
                class='badge cursor-pointer'
                @click='onCategoryClick(category.id)'
              >
                {{ category.name }}
                <IconX size='12' />
              </span>
              <span
                v-for='project in selectedProjects'
                :key='project.id'
                class='badge cursor-pointer'
                :class='badgeClasses("project")'
                @click='onProjectClick(project.id)'
              >
                <IconBulbFilled size=12 stroke-width=2 />
                {{ project.name }}
                <IconX size='12' />
              </span>
              <span
                v-for='account in selectedAccounts'
                :key='account.id'
                class='badge cursor-pointer'
                @click='onAccountClick(account.id)'
              >
                <IconWallet size=14 stroke-width=2 />
                {{ account.name }}
                <IconX size='12' />
              </span>
              <span
                v-for='property in selectedProperties'
                :key='property.id'
                class='badge cursor-pointer'
                :class='badgeClasses("property")'
                @click='onPropertyClick(property.id)'
              >
                <IconKeyFilled size=12 stroke-width=2 />
                {{ property.name }}
                <IconX size='12' />
              </span>
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
                    <th class='w-1 text-nowrap'>Дата</th>
                    <th class='w-1 text-nowrap text-end'>Величина</th>
                    <th class='w-1 text-nowrap'>Счёт</th>
                    <th>Категории</th>
                    <th>Описание</th>
                    <th class='w-1'/>
                  </tr>
                </thead>
                <tbody class='table-tbody'>
                  <tr v-for="item in transactions" :key="item.id">
                    <td :title='formatDateFull(item.dateAt)'>
                      {{ formatDate(item.dateAt) }}
                    </td>
                    <td class='text-nowrap text-end'>
                      <span
                        :class="{
                          'text-success': !item.isTransfer && item.amount > 0,
                          'text-danger': !item.isTransfer && item.amount < 0
                        }"
                      >
                        <Amount
                          :value='item.amount'
                          :currency='item.account.currency.name'
                        />
                      </span>
                    </td>
                    <td class='text-secondary'>
                      <span
                        class='badge cursor-pointer'
                        @click="onAccountClick(item.account.id)"
                      >
                        <IconWallet size=14 stroke-width=2 />
                        {{ item.account.name }}
                      </span>
                    </td>
                    <td>
                      <div class='badges-list'>
                        <template v-if='item.isTransfer'>
                          <span
                            v-if='item.amount > 0'
                            class='badge bg-green-lt text-green-lt-fg'
                          >
                            <IconArrowNarrowLeft size=16 />
                          </span>
                          <span
                            v-if='item.amount < 0'
                            class='badge bg-red-lt text-red-lt-fg'
                          >
                            <IconArrowNarrowRight size=16 />
                          </span>
                        </template>
                        <span
                          v-if='item.project'
                          class='badge cursor-pointer'
                          :class='badgeClasses("project")'
                          @click="onProjectClick(item.project.id)"
                        >
                          <IconBulbFilled size=12 stroke-width=2 />
                          {{ item.project.name }}
                        </span>
                        <span
                          v-if='item.property'
                          class='badge cursor-pointer'
                          :class='badgeClasses("property")'
                          @click="onPropertyClick(item.property.id)"
                        >
                          <IconKeyFilled size=12 stroke-width=2 />
                          {{ item.property.name }}
                        </span>
                        <span
                          v-for='cat in item.categories'
                          :key='cat.id'
                          class='badge cursor-pointer'
                          @click="onCategoryClick(cat.id)"
                        >
                          {{ cat.name }}
                        </span>
                      </div>
                    </td>
                    <td class='text-secondary'>{{ item.description }}</td>
                    <td>
                      <div class='btn-actions'>
                        <button
                          type='button'
                          class='btn btn-action'
                          @click='openEdit(item)'
                        >
                          <IconPencil size=20 stroke-width=1 />
                        </button>
                        <button
                          type='button'
                          v-tooltip:bottom="'Повторить операцию'"
                          class='btn btn-action'
                          @click='openCopy(item)'
                        >
                          <IconCopy size=20 stroke-width=1 />
                        </button>
                        <button
                          type='button'
                          class='btn btn-action' @click='destroy(item)'>
                          <IconTrash size=20 stroke-width=1 />
                        </button>
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
      <FilterKinds @update:items="onKindsChange" :isLoading="!isLoaded" />
      <FilterAccounts @update:items='onAccountsChange' :reload='transactionEventTicks' />
      <FilterCategories @update:items='onCategoriesChange' />
      <FilterProjects @update:items='onProjectsChange' />
      <FilterProperties @update:items='onPropertiesChange' />
    </div>
  </div>
</template>
