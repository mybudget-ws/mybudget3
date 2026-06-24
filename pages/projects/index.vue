<script setup>
import {
  IconPlus,
  IconPencil,
  IconEyeOff,
  IconTrash,
  IconDotsVertical,
  IconChevronCompactDown,
} from '@tabler/icons-vue';

import api from '~/lib/api';
import { useAuth } from '~/composables/use_auth';
import { useDevice } from '~/composables/use_device';

const { token } = useAuth();
const isError = ref(false)
const isLoading = ref(false);
const isQuiteLoading = ref(false);
const items = ref([]);
const isShowModal = ref(false);
const currentItem = ref(null);
const visibleItems = computed(() => items.value.filter(v => !v.isHidden));
const hiddenItems = computed(() => items.value.filter(v => v.isHidden));
const { isMobile } = useDevice();
const isArchiveOpen = ref(false);

const isEmpty = computed(() => {
  if (isLoading.value) return false;
  if (isError.value) return false;
  return items.value.length === 0;
});
const load = async (isQuite = false) => {
  isError.value = false;
  if (isQuite) {
    isQuiteLoading.value = true
  } else {
    isLoading.value = true
  }

  try {
    const result = await api.projects(token.value, { allData: true });
    if (result) {
      items.value = result;
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

const displayCurrency = ({ balances }) => {
  return balances[0]?.currencyBase?.name ?? '';
};

const sumBalance = ({ balances }) => {
  if (balances.length === 0) return 0.0;
  return balances.map(v => v.amountBase).reduce((a, b) => a + b);
};

const toggleHidden = async ({ id }) => {
  isQuiteLoading.value = true;
  await api.toggleIsHidden(token.value, id, 'project');
  await load(true);
};

const destroy = async ({ id }) => {
  if (confirm('Вы уверены, что хотите удалить проект, операция необратима?')) {
    isQuiteLoading.value = true;
    await api.destroyProject(token.value, id);
    await load(true);
  }
};

const openCreate = () => {
  currentItem.value = null
  isShowModal.value = true
}

const openEdit = (item) => {
  currentItem.value = { ...item }
  isShowModal.value = true
}

const onSaved = async () => {
  isShowModal.value = false
  await load(true)
}

watchEffect(() => {
  if (token.value) load();
});
</script>

<template>
  <ModalNewProject
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
                <h2 class='mb-0'>Проекты</h2>
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
              <div class='d-flex flex-grow-1 align-items-center'>
                <div class='col'>
                  <div class='card-title mb-0'>
                    {{ item.name }}
                  </div>

                  <div class='card-subtitle text-secondary'>
                    <span
                      :class='{
                        "text-success": sumBalance(item) > 0,
                        "text-danger": sumBalance(item) < 0
                      }'
                    >
                      <Amount
                        :value='sumBalance(item)'
                        :currency='displayCurrency(item)'
                      />
                    </span>
                  </div>
                </div>
              </div>

              <div class='card-actions'>
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
                    <a class='dropdown-item' href='#' @click.prevent='openEdit(item)'>
                      Редактировать
                    </a>

                    <a class='dropdown-item' href='#' @click.prevent='toggleHidden(item)'>
                      Скрыть
                    </a>

                    <a class='dropdown-item text-danger' href='#' @click.prevent='destroy(item)'>
                      Удалить
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-if='hiddenItems.length > 0'
              class='border-top'
            >
              <button
                type='button'
                class='w-100 btn btn-link text-decoration-none text-secondary ps-5 px-3 py-2 d-flex align-items-center justify-content-between'
                @click='isArchiveOpen = !isArchiveOpen'
              >
                <span>Архив ({{ hiddenItems.length }})</span>

                <IconChevronCompactDown
                  size='20'
                  :style='{
                    transform: isArchiveOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform .2s"
                  }'
                />
              </button>

              <template v-if='isArchiveOpen'>
                <div
                  v-for='(item, index) in hiddenItems'
                  :key='item.id'
                  class='card-header ps-5'
                  :class='{ "border-bottom-0": index === hiddenItems.length - 1 }'
                >
                  <div class='col'>
                    <div class='card-title mb-0 text-secondary'>
                      {{ item.name }}
                    </div>
                  </div>

                  <div class='card-actions'>
                    <div class='dropdown'>
                      <a
                        href='#'
                        class='btn-action'
                        data-bs-toggle='dropdown'
                        aria-expanded='false'
                        @click.prevent
                      >
                        <IconDotsVertical size='20' stroke-width='1' />
                      </a>

                      <div class='dropdown-menu dropdown-menu-end'>
                        <button
                          type='button'
                          class='dropdown-item'
                          @click='toggleHidden(item)'
                        >
                          Восстановить
                        </button>

                        <button
                          type='button'
                          class='dropdown-item text-danger'
                          @click='destroy(item)'
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <div v-if='!isLoading && !isMobile' class='advanced-table'>
            <div class='table-responsive'>
              <table class='table table-vcenter table-selectable'>
                <thead>
                  <tr>
                    <th>Название</th>
                    <th class='text-end'>Баланс</th>
                    <th class='w-1'/>
                  </tr>
                </thead>
                <tbody class='table-tbody'>
                  <tr v-for='item in visibleItems' :key='item.id'>
                    <td>
                      {{ item.name }}
                    </td>
                    <td class='text-nowrap text-end'>
                      <span
                        :class='{
                        "text-success": sumBalance(item) > 0,
                        "text-danger": sumBalance(item) < 0
                      }'>
                        <Amount
                          :value='sumBalance(item)'
                          :currency='displayCurrency(item)'
                        />
                      </span>
                    </td>
                    <td>
                      <div class='btn-actions'>
                        <button
                          type='button' class='btn btn-action'
                          @click='openEdit(item)'
                        >
                          <IconPencil size='20' stroke-width='1' />
                        </button>
                        <button
                          v-tooltip:bottom='"Скрыть проект"'
                          type='button'
                          class='btn btn-action'
                          @click='toggleHidden(item)'
                        >
                          <IconEyeOff size='20' stroke-width='1' />
                        </button>
                        <button type='button' class='btn btn-action' @click='destroy(item)'>
                          <IconTrash size='20' stroke-width='1' />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table v-if='hiddenItems.length > 0' class='table table-vcenter table-selectable'>
                <thead>
                  <tr>
                    <th>Архив ({{ hiddenItems.length }})</th>
                    <th class='w-1'/>
                  </tr>
                </thead>
                <tbody class='opacity-30'>
                  <tr v-for='item in hiddenItems' :key='item.id'>
                    <td>{{ item.name }}</td>
                    <td>
                      <div class='btn-actions justify-content-end'>
                        <button type='button' class='btn btn-action' @click='toggleHidden(item)'>
                          <IconEyeOff size='20' stroke-width='1' />
                        </button>
                        <button type='button' class='btn btn-action' @click='destroy(item)'>
                          <IconTrash size='20' stroke-width='1' />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
              <div class='card-footer d-flex align-items-center'>
              <i v-if='isEmpty' class='text-secondary'>
                Похоже таких проектов ещё нет
              </i>
              <i v-if='isError' class='text-danger'>
                Ошибка: не удалось загрузить проекты.
                Попробуйте повторить операцию, или обратитесь в поддержку.
              </i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
