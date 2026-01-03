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
const page = ref(1);
const categories = ref([]);
const itemsEventTicks = ref(1);

const load = async (isQuite = false) => {
  if (isQuite) {
    isQuiteLoading.value = true
  } else {
    isLoading.value = true
  }

  try {
    const items = await api.categories(token.value);
    if (items) {
      categories.value = items
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

const quiteLoading = async () => {
  await load(true);
  itemsEventTicks.value++;
}

const hideCategory = async (id) => {
  isQuiteLoading.value = true;
  alert('TODO')
  // await api.hideCategory(token.value, id);
  await quiteLoading();
};

const deleteCategory = async (id) => {
  if (confirm('Вы уверены, что хотите удалить категорию?')) {
    isQuiteLoading.value = true;
    // await api.destroyTransaction(token.value, id);
    await quiteLoading();
  }
};

watch(
  () => token.value,
  (val) => {
    if (val) load();
  },
  { immediate: true }
);
</script>

<template>
  <ModalNewCategory @newItem='quiteLoading' />

  <div class='row'>
    <div class='col-12'>
      <div class='card'>
        <div class='card-table'>
          <div class='card-header pe-0'>
            <div class='row w-full align-items-center'>
              <div class='col d-flex align-items-center'>
                <h2 class='mb-0'>Категории</h2>
                <PlaceholderLoading v-if='isQuiteLoading' class='spinner-border-sm ms-2' />
              </div>
              <div class="col-md-auto col-sm-12">
                <div class="ms-auto d-flex flex-wrap btn-list">
                  <button
                    class='btn btn-primary'
                    data-bs-toggle='modal'
                    data-bs-target='#modal-category'
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
                    <th class='w-1'></th>
                  </tr>
                </thead>
                <tbody class='table-tbody'>
                  <tr v-for="item in categories" :key="item.id">
                    <td>{{ item.name }}</td>
                    <td>
                      <div class='btn-actions'>
                        <a class='btn btn-action'>
                          <IconPencil size=20 stroke-width=1 />
                        </a>
                        <a
                            class='btn btn-action'
                            @click.prevent='() => hideCategory(item.id)'
                            v-tooltip:bottom.delay="{ title: 'Скрыть категорию', delay: 400 }"
                        >
                          <IconEyeOff size=20 stroke-width=1 />
                        </a>
                        <a class='btn btn-action' @click.prevent='() => deleteCategory(item.id)'>
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
