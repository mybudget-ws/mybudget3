<script setup>
import {
  IconArrowDown,
  IconArrowUp,
  IconArrowsRightLeft,
  IconSearch,
  IconFilter,
} from '@tabler/icons-vue';

import api from '~/lib/api';
import { KIND_EXPENSE, KIND_INCOME } from '~/lib/consts';
import { parseNumberArray, parseStringArray } from '~/lib/helper_parsers';
import { useAuth } from '~/composables/use_auth';
import { useDevice } from '~/composables/use_device';

const route = useRoute();
const router = useRouter();
const { token } = useAuth();
const { isMobile } = useDevice();

const PER_PAGE = 50;
const hasMore = ref(true);
const isLoadingMore = ref(false);
const isLoading = ref(false);
const isQuietLoading = ref(false);
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

// Номер последнего запроса: ответ на устаревший запрос (например, при быстром
// переключении фильтров) нужно отбросить, иначе он перезапишет свежие данные.
let loadSeq = 0;

const load = async (isQuiet = false, append = false) => {
  const seq = ++loadSeq;

  // Тихая перезагрузка (после сохранения/удаления) всегда начинается с первой
  // страницы: раньше она запрашивала текущую page и заменяла ею весь список.
  const targetPage = append ? page.value + 1 : 1;

  if (isQuiet) {
    isQuietLoading.value = true;
  } else {
    isLoading.value = true;
  }

  try {
    const items = await api.transactions(token.value, {
      ...params.value,
      page: targetPage,
    });

    if (seq !== loadSeq) return;

    if (items) {
      if (append) {
        transactions.value = [...transactions.value, ...items];
      } else {
        transactions.value = items;
      }
      // Страница фиксируется только после успешной загрузки
      page.value = targetPage;
      hasMore.value = items.length === PER_PAGE;
      isLoaded.value = true;
    }
  } catch (err) {
    if (seq !== loadSeq) return;
    console.error(err);
  } finally {
    if (seq === loadSeq) {
      // Пагинация не меняет балансы, перезагружать счета ради неё не нужно
      if (isQuiet && !append) transactionEventTicks.value++;
      isLoading.value = false;
      isQuietLoading.value = false;
    }
  }
};

const loadMore = async () => {
  if (isLoadingMore.value || isLoading.value || isQuietLoading.value) return;

  isLoadingMore.value = true;
  await load(true, true);
  isLoadingMore.value = false;
};

const destroy = async ({ id }) => {
  if (!confirm('Вы уверены, что хотите удалить операцию?')) return;

  isQuietLoading.value = true;

  try {
    await api.destroyTransaction(token.value, id);
  } catch (err) {
    console.error(err);
    isQuietLoading.value = false;
    return;
  }

  await load(true);
};

const getBackUrl = () => router.resolve({
  path: route.path,
  query: route.query,
}).href;

const openCreate = (kind) => {
  currentKind.value = kind;
  currentItem.value = null;
  isCopyItem.value = false;
  isShowModal.value = true;
};

const openCreateMobile = (kind) => {
  const backUrl = getBackUrl();

  router.push({
    path: '/transactions/new_transaction_mobile',
    query: {
      ...route.query,
      kind,
      back_url: backUrl,
    },
  });
};

const openCreateTransferMobile = () => {
  const backUrl = getBackUrl();

  router.push({
    path: '/transactions/new_transfer_mobile',
    query: {
      ...route.query,
      back_url: backUrl,
    },
  });
};

const openEdit = (item) => {
  if (isMobile.value) {
    const backUrl = getBackUrl();

    router.push({
      path: '/transactions/new_transaction_mobile',
      query: {
        id: item.id,
        kind: item.amount > 0 ? KIND_INCOME : KIND_EXPENSE,
        categories: item.categories?.map(category => category.id).join(',') || undefined,
        project_id: item.project?.id || undefined,
        property_id: item.property?.id || undefined,
        back_url: backUrl,
      },
    });

    return;
  }

  currentItem.value = { ...item };
  currentKind.value = item.amount > 0 ? KIND_INCOME : KIND_EXPENSE;
  isCopyItem.value = false;
  isShowModal.value = true;
};

const openCopy = (item) => {
  if (isMobile.value) {
    const backUrl = getBackUrl();
    router.push({
      path: '/transactions/new_transaction_mobile',
      query: {
        copy_id: item.id,
        kind: item.amount > 0 ? KIND_INCOME : KIND_EXPENSE,
        categories: item.categories?.map(category => category.id).join(',') || undefined,
        project_id: item.project?.id || undefined,
        property_id: item.property?.id || undefined,
        back_url: backUrl,
      },
    });

    return;
  }

  currentItem.value = { ...item, id: undefined };
  currentKind.value = item.amount > 0 ? KIND_INCOME : KIND_EXPENSE;
  isCopyItem.value = true;
  isShowModal.value = true;
};

const openCreateTransfer = () => {
  if (isMobile.value) {
    openCreateTransferMobile();
    return;
  }

  isShowModalTransfer.value = true;
};

const onSaved = async () => {
  isShowModal.value = false;
  isShowModalTransfer.value = false;
  isShowModalAccount.value = false;
  isCopyItem.value = false;
  await load(true);
};

// Переключает значение в query-параметре (accounts, categories, ...).
// TODO: тот же код есть в composables/use_selectable_filter.js и use_chart.js.
const toggleQueryValue = (key, value, { numeric = true } = {}) => {
  const raw = route.query[key]?.toString().split(',').filter(Boolean) ?? [];
  const current = numeric ? raw.map(Number).filter(Boolean) : raw;

  const next = current.includes(value)
    ? current.filter(v => v !== value)
    : [...current, value];

  const nextQuery = { ...route.query };

  if (next.length > 0) {
    nextQuery[key] = next.join(',');
  } else {
    delete nextQuery[key];
  }

  router.replace({ query: nextQuery });
};

const onCategoryClick = (id) => toggleQueryValue('categories', id);
const onProjectClick = (id) => toggleQueryValue('projects', id);
const onAccountClick = (id) => toggleQueryValue('accounts', id);
const onPropertyClick = (id) => toggleQueryValue('properties', id);
const onKindClick = (id) => toggleQueryValue('kinds', id, { numeric: false });

const onAccountNew = () => {
  isShowModal.value = false;
  isShowModalTransfer.value = false;
  isShowModalAccount.value = true;
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

// Грузим при смене query и когда токен появился (если он приходит позже
// монтирования, иначе первая загрузка не произойдёт до смены фильтров).
// Следим именно за Boolean(token), чтобы обновление самого токена не
// перезагружало список.
watch(
  [() => route.query, () => Boolean(token.value)],
  () => {
    if (!token.value) return;
    load();
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
  <ModalFiltersWindow
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
                  <PlaceholderLoading v-if='isQuietLoading' class='spinner-border-sm ms-2' />
                </div>
              </div>
              <div class='col-md-auto col-sm-12'>
                <div class='ms-auto d-flex flex-wrap btn-list'>
                  <div
                    class='input-group input-group-flat'
                    :class='{
                      "w-auto" : !isMobile,
                      "mt-1" : isMobile,
                     }'
                  >
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

                  <div
                    class='d-flex justify-content-between'
                    :class='{ "w-100": isMobile }'
                  >
                    <div class='d-flex gap-2'>
                      <button
                        class='btn btn-outline-green'
                        type='button'
                        @click='isMobile ? openCreateMobile(KIND_INCOME) : openCreate(KIND_INCOME)'
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
                        @click='isMobile ? openCreateMobile(KIND_EXPENSE) : openCreate(KIND_EXPENSE)'
                      >
                        <IconArrowDown stroke-width='2' />
                      </button>
                    </div>
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

          <div v-if='!isLoading && isMobile'>
            <TransactionItem
              v-for='(item, index) in transactions'
              :key='item.id'
              :transaction='item'
              is-mobile
              is-show-copy
              is-clickable
              :is-last='index === transactions.length - 1'
              @edit='openEdit'
              @copy='openCopy'
              @delete='destroy'
              @account-click='onAccountClick'
              @project-click='onProjectClick'
              @property-click='onPropertyClick'
              @category-click='onCategoryClick'
            />
            <div v-if='isEmpty' class='text-secondary text-center mt-3 mb-3'>
              Похоже таких операций ещё нет
            </div>

            <button
              v-else
              type='button'
              class='btn btn-outline-secondary w-100 border-0'
              :disabled='!hasMore || isLoadingMore || isQuietLoading'
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

          <div v-if='!isLoading && !isMobile' class='advanced-table'>
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
                  <TransactionItem
                    v-for='item in transactions'
                    :key='item.id'
                    :transaction='item'
                    is-clickable
                    is-show-copy
                    @edit='openEdit'
                    @copy='openCopy'
                    @delete='destroy'
                    @account-click='onAccountClick'
                    @project-click='onProjectClick'
                    @property-click='onPropertyClick'
                    @category-click='onCategoryClick'
                  />
                </tbody>
              </table>
            </div>

            <div v-if='isEmpty' class='card-footer bg-transparent'>
              <div class='text-secondary'>
                Похоже таких операций ещё нет
              </div>
            </div>
            <div v-else class='card-footer bg-transparent border-top'>
              <button
                type='button'
                class='btn btn-action btn-sm text-secondary w-100 border-0 p-2'
                :disabled='!hasMore || isLoadingMore || isQuietLoading'
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
