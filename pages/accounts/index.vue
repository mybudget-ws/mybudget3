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

const isLoading = ref(false);
const isQuiteLoading = ref(false);
const accounts = ref([]);
const isShowModal = ref(false);
const currentItem = ref(null);
const visibleItems = computed(() => accounts.value.filter(v => !v.isHidden));
const hiddenItems = computed(() => accounts.value.filter(v => v.isHidden));

const load = async (isQuite = false) => {
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
  } finally {
    isLoading.value = false;
    isQuiteLoading.value = false;
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
};

const kindDisplayName = ({ kind }) => {
  return kind == 'credit' ? 'Кредит' : '';
}

watch(
  () => token.value,
  (val) => {
    if (val) load();
  },
  { immediate: true }
);
</script>

<template>
  <ModalNewAccount
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
                <h2 class='mb-0'>Счета</h2>
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
                      <span class='me-2'>{{ item.name }}</span>
                      <span v-if='isShowKind(item)' class='badge'>{{ kindDisplayName(item) }}</span>
                    </td>
                    <td class='text-nowrap text-end'>
                      <span :class="{
                        'text-success': item.balance > 0,
                        'text-danger': item.balance < 0
                      }">
                        <Amount
                          :value='item.balance'
                          :currency='item.currency.name'
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
                            v-tooltip:bottom="'Скрыть счёт'"
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
