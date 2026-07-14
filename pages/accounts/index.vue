<script setup>
import {
  IconPlus,
  IconPencil,
  IconEyeOff,
  IconTrash,
  IconStar,
  IconStarFilled,
  IconDotsVertical,
} from '@tabler/icons-vue';

import api from '~/lib/api';
import { useAuth } from '~/composables/use_auth';
import { useDevice } from '~/composables/use_device';

const appConfig = useAppConfig();
const { token } = useAuth();
const { isMobile } = useDevice();
const isArchiveOpen = ref(false);
const isLoading = ref(false);
const isQuiteLoading = ref(false);
const accounts = ref([]);
const favouriteToggleInFlight = ref(new Set());
const isShowModal = ref(false);
const isError = ref(false);
const currentItem = ref(null);
const visibleItems = computed(() => accounts.value.filter(v => !v.isHidden));
const hiddenItems = computed(() => accounts.value.filter(v => v.isHidden));


const isEmpty = computed(() => {
  if (isLoading.value) return false;
  if (isError.value) return false;
  return accounts.value.length === 0;
});

const load = async (isQuite = false) => {
  isError.value = false;
  if (isQuite) {
    isQuiteLoading.value = true
  } else {
    isLoading.value = true
  }

  try {
    const items = await api.accounts(token.value);
    if (items) {
      accounts.value = items
    } else {
      console.log('TODO: error');
    }
  } catch (err) {
    console.error(err);
    isError.value = true;
  } finally {
    isLoading.value = false;
    isQuiteLoading.value = false;
  }
};

const toggleFavourite = async (item) => {
  if (favouriteToggleInFlight.value.has(item.id)) return;
  favouriteToggleInFlight.value.add(item.id);
  isQuiteLoading.value = true;

  const previousValue = item.isFavourite;
  item.isFavourite = !item.isFavourite;
  try {
    await api.toggleIsFavourite(
      token.value,
      item.id,
      'account'
    );
    isError.value = false;
  } catch (err) {
    console.error(err);
    item.isFavourite = previousValue;
    isError.value = true;
  } finally {
    isQuiteLoading.value = false;
    favouriteToggleInFlight.value.delete(item.id);
  }
};

const toggleHidden = async ({ id }) => {
  isQuiteLoading.value = true;
  await api.toggleIsHidden(token.value, id, 'account');
  await load(true);
};

const destroy = async ({ id }) => {
  if (confirm('Вы уверены, что хотите удалить счёт, операция необратима?')) {
    isQuiteLoading.value = true;
    await api.destroyAccount(token.value, id);
    await load(true);
  }
};

const openCreate = () => {
  currentItem.value = null;
  isShowModal.value = true;
}

const openEdit = (item) => {
  currentItem.value = { ...item };
  isShowModal.value = true;
}

const onSaved = async () => {
  isShowModal.value = false;
  await load(true);
}

const isShowKind = ({ kind }) => {
  return kind == 'credit';
}

const kindDisplayName = ({ kind }) => {
  return kind == 'credit' ? 'Кредит' : '';
}

// TODO: Удалить дублирование кода, посмотреть остальные файлы, где
//       так же объявлена эта функция .
const linkColorClass = computed(() => {
  return appConfig.theme.dark ?
    'link-light' :
    'link-dark';
});

watchEffect(() => {
  if (token.value) load();
});
</script>

<template>
  <ModalNewAccount
    v-if='isShowModal'
    :item='currentItem'
    @saved='onSaved'
    @close='isShowModal = false'
  />

  <div class='row'>
    <div class='col-12'>
      <div class='card'>
        <div class='card-table'>
          <div class='card-header pe-0'>
              <div class='row w-full align-items-center'>
                <div class='col d-flex align-items-center'>
                  <h2 class='mb-0'>Счета</h2>
                  <PlaceholderLoading v-if='isQuiteLoading' class='spinner-border-sm ms-2' />
                </div>
                <div class='col-auto'>
                  <div class='ms-auto d-flex flex-wrap btn-list'>
                    <button
                      class='btn btn-primary'
                      @click='openCreate'
                    >
                      <IconPlus stroke-width='2' />
                    </button>
                  </div>
                </div>
              </div>
          </div>
          <div v-if='isLoading' class='card-body text-center'>
            <PlaceholderLoading />
          </div>
          <div v-if='!isLoading && isMobile'>
            <div
              v-for='(item, index) in visibleItems'
              :key='item.id'
              class='card-header'
              :class='{ "border-bottom-0": index === visibleItems.length - 1 }'
            >
              <div class='d-flex w-100'>

                <div class='me-2 d-flex align-items-center'>
                  <button
                    type='button'
                    class='btn btn-action shadow-none border-0'
                    @click.stop='toggleFavourite(item)'
                  >
                    <IconStarFilled
                      v-if='item.isFavourite'
                      size='18'
                      stroke-width='1'
                      class='text-yellow'
                    />
                    <IconStar
                      v-else
                      size='18'
                      stroke-width='1'
                      class='text-secondary'
                    />
                  </button>
                </div>

                <div class='flex-grow-1 min-w-0'>
                  <div class='card-title text-truncate'>
                    {{ item.name }}

                    <span v-if='isShowKind(item)' class='badge ms-1'>
                      {{ kindDisplayName(item) }}
                    </span>
                  </div>

                  <Amount
                    is-color
                    :value='item.balance'
                    :currency='item.currency.name'
                  />

                  <div
                    v-if='item.description'
                    class='text-secondary small mt-1'
                  >
                    {{ item.description }}
                  </div>

                </div>

                <div class='ms-2 d-flex align-items-center'>
                  <div class='dropdown'>
                    <a
                      href='#'
                      class='btn-action'
                      data-bs-toggle='dropdown'
                      @click.prevent
                    >
                      <IconDotsVertical size='20' stroke-width='1' />
                    </a>

                    <div class='dropdown-menu dropdown-menu-end'>
                      <button class='dropdown-item' @click='openEdit(item)'>
                        Редактировать
                      </button>

                      <button class='dropdown-item' @click='toggleHidden(item)'>
                        Скрыть
                      </button>

                      <button class='dropdown-item text-danger' @click='destroy(item)'>
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div v-if='hiddenItems.length > 0' class='border-top-0'>
              <Mobile_archive
                :items='hiddenItems'
                :is-open='isArchiveOpen'
                title='Архив'
                @toggle-open='isArchiveOpen = !isArchiveOpen'
                @restore='toggleHidden'
                @delete='destroy'
              />
            </div>
          </div>

          <div v-if='!isLoading && !isMobile' class='advanced-table'>
            <div class='table-responsive'>
              <table class='table table-vcenter table-selectable'>
                <thead>
                  <tr>
                    <th>Название</th>
                    <th>Описание</th>
                    <th class='text-end'>Баланс</th>
                    <th class='w-1'/>
                  </tr>
                </thead>
                <tbody class='table-tbody'>
                  <tr v-for='item in visibleItems' :key='item.id'>
                    <td>
                      <div class='d-flex align-items-center gap-2'>
                        <button
                          v-tooltip:right='item.isFavourite ? "Убрать из избранного" : "Добавить в избранное"'
                          type='button'
                          class='btn btn-action shadow-none border-0'
                          @click.stop='toggleFavourite(item)'
                        >
                          <IconStarFilled
                            v-if='item.isFavourite'
                            size='18' stroke-width='1'
                            class='text-yellow'
                          />
                          <IconStar
                            v-else
                            size='18' stroke-width='1'
                            class='text-secondary'
                          />
                        </button>
                        <NuxtLink
                          :to='{
                            path: "/transactions",
                            query: {
                              accounts: item.id,
                            },
                          }'
                          class='fw-medium text-reset'
                          :class='linkColorClass'
                        >
                          {{ item.name }}
                        </NuxtLink>
                        <span v-if='isShowKind(item)' class='badge'>
                          {{ kindDisplayName(item) }}
                        </span>
                      </div>
                    </td>
                    <td class='text-secondary'>{{ item.description }}</td>
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
                          copyable
                        />
                      </span>
                    </td>
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
                          v-tooltip:bottom='"Скрыть счёт"'
                          type='button'
                          class='btn btn-action'
                          @click='toggleHidden(item)'
                        >
                          <IconEyeOff size='20' stroke-width='1' />
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
              <table v-if='hiddenItems.length > 0' class='table table-vcenter table-selectable border-top'>
                <thead>
                  <tr>
                    <th>Архив ({{ hiddenItems.length }})</th>
                    <th>Описание</th>
                    <th class='w-1'/>
                  </tr>
                </thead>
                <tbody class='opacity-30'>
                  <tr v-for='item in hiddenItems' :key='item.id'>
                    <td>
                      {{ item.name }}
                    </td>
                    <td class='text-secondary'>{{ item.description }}</td>
                    <td>
                      <div class='btn-actions justify-content-end'>
                        <button
                          type='button' 
                          class='btn btn-action' @click='toggleHidden(item)'>
                          <IconEyeOff size='20' stroke-width='1' />
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
          </div>
          <div v-if='isEmpty || isError' class='card-footer d-flex align-items-center border-top-0'>
            <i v-if='isEmpty' class='text-secondary'>
              Похоже таких счетов ещё нет
            </i>
            <i v-if='isError' class='text-danger'>
              Ошибка: не удалось загрузить счета.
              Попробуйте повторить операцию, или обратитесь в поддержку.
            </i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
