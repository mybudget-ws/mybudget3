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
const items = ref([]);
const isShowModal = ref(false);
const currentItem = ref(null);
const visibleItems = computed(() => items.value.filter(v => !v.isHidden));
const hiddenItems = computed(() => items.value.filter(v => v.isHidden));

const load = async (isQuite = false) => {
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
  } finally {
    isLoading.value = false;
    isQuiteLoading.value = false;
  }
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

watch(
  () => token.value,
  (val) => {
    if (val) load();
  },
  { immediate: true }
);
</script>

<template>
  <ModalNewGoal
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
                <h2 class='mb-0'>Цели</h2>
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
                    <th class='w-1'></th>
                  </tr>
                </thead>
                <tbody class='table-tbody'>
                  <tr v-for="item in visibleItems" :key="item.id">
                    <td>
                      {{ item.name }}
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
