<script setup>
import {
  IconPlus,
  IconPencil,
  IconEyeOff,
  IconTrash,
} from '@tabler/icons-vue';

import api from '~/lib/api';
import { useAuth } from '~/composables/use_auth';

const route = useRoute();
const { token } = useAuth();
const isError = ref(false)
const isLoading = ref(false);
const isQuiteLoading = ref(false);
const items = ref([]);
const isShowModal = ref(false);
const currentItem = ref(null);
const visibleItems = computed(() => items.value.filter(v => !v.isHidden));
const hiddenItems = computed(() => items.value.filter(v => v.isHidden));

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
    @close="isShowModal = false"
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
                    <IconPlus stroke-width=2 />
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
                    <th>Название</th>
                    <th class='text-end'>Баланс</th>
                    <th class='w-1'></th>
                  </tr>
                </thead>
                <tbody class='table-tbody'>
                  <tr v-for="item in visibleItems" :key="item.id">
                    <td>
                      {{ item.name }}
                    </td>
                    <td class='text-nowrap text-end'>
                      <span :class="{
                        'text-success': sumBalance(item) > 0,
                        'text-danger': sumBalance(item) < 0
                      }">
                        <Amount
                          :value='sumBalance(item)'
                          :currency='displayCurrency(item)'
                        />
                      </span>
                    </td>
                    <td>
                      <div class='btn-actions'>
                        <a class='btn btn-action'
                          @click.prevent='openEdit(item)'
                        >
                          <IconPencil size=20 stroke-width=1 />
                        </a>
                        <a
                            class='btn btn-action'
                            @click.prevent='toggleHidden(item)'
                            v-tooltip:bottom="'Скрыть проект'"
                        >
                          <IconEyeOff size=20 stroke-width=1 />
                        </a>
                        <a class='btn btn-action' @click.prevent='destroy(item)'>
                          <IconTrash size=20 stroke-width=1 />
                        </a>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table v-if='hiddenItems.length > 0' class='table table-vcenter table-selectable'>
                <thead>
                  <tr>
                    <th>Архив ({{ hiddenItems.length }})</th>
                    <th class='w-1'></th>
                  </tr>
                </thead>
                <tbody class='opacity-30'>
                  <tr v-for="item in hiddenItems" :key="item.id">
                    <td>{{ item.name }}</td>
                    <td>
                      <div class='btn-actions justify-content-end'>
                        <a class='btn btn-action' @click.prevent='toggleHidden(item)'>
                          <IconEyeOff size=20 stroke-width=1 />
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
