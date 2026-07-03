<script setup>
import {
  IconArrowDown,
  IconArrowUp,
  IconArrowsRightLeft,
  IconCopy,
  IconPencil,
  IconTrash,
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconSearch,
  IconFilter,
} from '@tabler/icons-vue';

import api from '~/lib/api';
import { formatDate, formatDateFull } from '~/lib/helper_date';
import { KIND_EXPENSE, KIND_INCOME } from '~/lib/consts';
import { parseNumberArray, parseStringArray } from '~/lib/helper_parsers';
import { useAuth } from '~/composables/use_auth';
import MobileTransactionFilters from '~/components/filter/mobile_transaction_filters.vue';
import { useDevice } from '~/composables/use_device';

const route = useRoute();
const router = useRouter();
const { token } = useAuth();
const { isMobile } = useDevice();

const PER_PAGE = 50;
const hasMore = ref(true);
const isLoadingMore = ref(false);
const isLoading = ref(false);
const isQuiteLoading = ref(false);
const isLoaded = ref(false);
const isCopyItem = ref(false);
const isShowModal = ref(false);
const isShowModalTransfer = ref(false);
const isShowModalAccount = ref(false);
const isShowMobileFilters = ref(false);
const currentKind = ref(KIND_EXPENSE);
const currentItem = ref(null);
const page = ref(1);
const transactions = ref([]);
const transactionEventTicks = ref(1);
const selectedAccounts = ref([]);
const selectedCategories = ref([]);
const selectedKinds = ref([]);
const selectedProjects = ref([]);
const selectedProperties = ref([]);
const description = ref(route.query.description?.toString() || '');

const filters = computed(() => {
  return {
    accountIds: parseNumberArray(route.query.accounts),
    categoryIds: parseNumberArray(route.query.categories),
    projectIds: parseNumberArray(route.query.projects),
    propertyIds: parseNumberArray(route.query.properties),
    kinds: parseStringArray(route.query.kinds),
    description: route.query.description?.toString().trim() || null,
  };
});

const isEmpty = computed(() => {
  if (isLoading.value) return false;
  return transactions.value.length === 0;
});

const isTopFiltersVisible = computed(() => (
  selectedCategories.value.length
    || selectedProjects.value.length
    || selectedAccounts.value.length
    || selectedProperties.value.length
    || selectedKinds.value.length
    || route.query.description
));

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

const load = async (isQuite = false, append = false) => {
  if (isQuite) {
    isQuiteLoading.value = true;
  } else {
    isLoading.value = true;
  }

  try {
    const items = await api.transactions(token.value, params.value);

    if (items) {
      if (append) {
        transactions.value = [...transactions.value, ...items];
      } else {
        transactions.value = items;
      }
      hasMore.value = items.length === PER_PAGE;
      isLoaded.value = true;
    }
  } catch (err) {
    console.error(err);
  } finally {
    if (isQuite) transactionEventTicks.value++;
    isLoading.value = false;
    isQuiteLoading.value = false;
  }
};

const loadMore = async () => {
  if (isLoadingMore.value) return;

  isLoadingMore.value = true;
  page.value += 1;

  await load(true, true);

  isLoadingMore.value = false;
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

const onKindClick = (id) => {
  const current = route.query.kinds
    ? route.query.kinds.toString().split(',').filter(Boolean)
    : [];

  const newKinds = current.includes(id)
    ? current.filter(k => k !== id)
    : [...current, id];

  const nextQuery = { ...route.query };

  if (newKinds.length > 0) {
    nextQuery.kinds = newKinds.join(',');
  } else {
    delete nextQuery.kinds;
  }

  router.replace({ query: nextQuery });
};

const onDescriptionSearch = () => {
  const nextQuery = { ...route.query };

  if (description.value.trim()) {
    nextQuery.description = description.value.trim();
  } else {
    delete nextQuery.description;
  }

  router.replace({ query: nextQuery });
};

const clearDescriptionSearch = () => {
  description.value = '';

  const nextQuery = { ...route.query };
  delete nextQuery.description;

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
    if (!token.value) return;

    page.value = 1;
    load(false, false);
  },
  { immediate: true }
);
watch(
  () => route.query.description,
  (value) => {
    description.value = value?.toString() || '';
  }
);
</script>

<template>
  <ModalNewTransaction
    v-if='isShowModal'
    :kind='currentKind'
    :item='currentItem'
    :is-copy='isCopyItem'
    @saved='onSaved'
    @close='isShowModal = false'
    @account-new='onAccountNew'
  />
  <ModalNewTransfer
    v-if='isShowModalTransfer'
    @saved='onSaved'
    @close='isShowModalTransfer = false'
    @account-new='onAccountNew'
  />
  <ModalNewAccount
    v-if='isShowModalAccount'
    @saved='onSaved'
    @close='isShowModalAccount = false'
  />
  <MobileTransactionFilters
    v-if='isShowMobileFilters'
    :is-loaded='isLoaded'
    :transaction-event-ticks='transactionEventTicks'
    @close='isShowMobileFilters = false'
    @kinds-change='onKindsChange'
    @accounts-change='onAccountsChange'
    @categories-change='onCategoriesChange'
    @projects-change='onProjectsChange'
    @properties-change='onPropertiesChange'
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
                  <div class='input-group input-group-flat w-auto'>
                    <span class='input-group-text'>
                      <IconSearch size='20' stroke-width='1' />
                    </span>

                    <input
                      id='advanced-table-search'
                      v-model='description'
                      type='text'
                      class='form-control ps-2'
                      placeholder='Поиск по описанию'
                      @keyup.enter='onDescriptionSearch'
                    >
                    <span class='input-group-text'>
                      <kbd>Enter</kbd>
                    </span>
                  </div>
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
                  <button
                    v-if='isMobile'
                    class='btn btn-ghost-secondary'
                    type='button'
                    @click='isShowMobileFilters = true'
                  >
                    <IconFilter stroke-width='2' />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if='isTopFiltersVisible'
            class='card-body border-bottom'
          >
            <div class='badges-list'>
              <BadgeCategory
                v-if='route.query.description'
                :name='route.query.description'
                :is-x='true'
                @click='clearDescriptionSearch'
              />
              <BadgeCategory
                v-for='kind in selectedKinds'
                :key='kind.id'
                :name='kind.name'
                :is-x='true'
                @click='onKindClick(kind.id)'
              />
              <BadgeAccount
                v-for='account in selectedAccounts'
                :key='account.id'
                :name='account.name'
                :is-x='true'
                @click='onAccountClick(account.id)'
              />
              <BadgeCategory
                v-for='category in selectedCategories'
                :key='category.id'
                :name='category.name'
                :is-x='true'
                @click='onCategoryClick(category.id)'
              />
              <BadgeProject
                v-for='project in selectedProjects'
                :key='project.id'
                :name='project.name'
                :is-x='true'
                @click='onProjectClick(project.id)'
              />
              <BadgeProperty
                v-for='property in selectedProperties'
                :key='property.id'
                :name='property.name'
                :is-x='true'
                @click='onPropertyClick(property.id)'
              />
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
                  <tr v-for='item in transactions' :key='item.id'>
                    <td :title='formatDateFull(item.dateAt)'>
                      {{ formatDate(item.dateAt) }}
                    </td>
                    <td class='text-nowrap text-end'>
                      <Amount
                        :value='item.amount'
                        :currency='item.account.currency.name'
                        :is-color='!item.isTransfer'
                        copyable
                      />
                    </td>
                    <td class='text-secondary'>
                      <BadgeAccount
                        :name='item.account.name'
                        @click='onAccountClick(item.account.id)'
                      />
                    </td>
                    <td>
                      <div class='badges-list'>
                        <template v-if='item.isTransfer'>
                          <span
                            v-if='item.amount > 0'
                            class='badge bg-green-lt text-green-lt-fg'
                          >
                            <IconArrowNarrowLeft size='16' />
                          </span>
                          <span
                            v-if='item.amount < 0'
                            class='badge bg-red-lt text-red-lt-fg'
                          >
                            <IconArrowNarrowRight size='16' />
                          </span>
                        </template>
                        <BadgeProject
                          v-if='item.project'
                          :name='item.project.name'
                          @click='onProjectClick(item.project.id)'
                        />
                        <BadgeProperty
                          v-if='item.property'
                          :name='item.property.name'
                          @click='onPropertyClick(item.property.id)'
                        />
                        <BadgeCategory
                          v-for='cat in item.categories'
                          :key='cat.id'
                          :name='cat.name'
                          @click='onCategoryClick(cat.id)'
                        />
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
                          <IconPencil size='20' stroke-width='1' />
                        </button>
                        <button
                          v-tooltip:bottom='"Повторить операцию"'
                          type='button'
                          class='btn btn-action'
                          @click='openCopy(item)'
                        >
                          <IconCopy size='20' stroke-width='1' />
                        </button>
                        <button
                          type='button'
                          class='btn btn-action' @click='destroy(item)'>
                          <IconTrash size='20' stroke-width='1' />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class='card-footer bg-transparent'>
              <i v-if='isEmpty' class='text-secondary'>
                Похоже таких операций ещё нет
              </i>

              <button
                v-else
                class='btn btn-action btn-sm text-secondary w-100 border-0 p-2'
                :disabled='!hasMore || isLoadingMore'
                @click='loadMore'
              >
                <template v-if='isLoadingMore'>
                  Загрузка...
                </template>

                <template v-else-if='hasMore'>
                  Загрузить ещё
                </template>

                <template v-else>
                  Операций больше нет
                </template>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-show='!isMobile'
      class='col-sm-12 col-lg-3 col-xl-2'
    >
      <FilterKinds :is-loading='!isLoaded' @update:items='onKindsChange' />
      <FilterAccounts :reload='transactionEventTicks' @update:items='onAccountsChange' />
      <FilterCategories @update:items='onCategoriesChange' />
      <FilterProjects @update:items='onProjectsChange' />
      <FilterProperties @update:items='onPropertiesChange' />
    </div>
  </div>
</template>
