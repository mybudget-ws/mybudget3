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

const { token } = useAuth();
const { isMobile } = useDevice();
const isError = ref(false);
const isLoading = ref(false);
const isQuiteLoading = ref(false);
const categories = ref([]);
const favouriteToggleInFlight = ref(new Set());
const isShowModal = ref(false);
const currentItem = ref(null);
const visibleItems = computed(() => categories.value.filter(v => !v.isHidden));
const hiddenItems = computed(() => categories.value.filter(v => v.isHidden));
const isArchiveOpen = ref(false);

const isEmpty = computed(() => {
  if (isLoading.value) return false;
  if (isError.value) return false;
  return categories.value.length === 0;
});

const load = async (isQuite = false) => {
  isError.value = false;
  if (isQuite) {
    isQuiteLoading.value = true
  } else {
    isLoading.value = true
  }

  try {
    //throw new Error('Test error');
    const items = await api.categories(token.value);
    if (items) {
      categories.value = items
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
      'category'
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
  await api.toggleIsHidden(token.value, id, 'category');
  await load(true);
};

const destroy = async ({ id }) => {
  if (confirm('Вы уверены, что хотите удалить категорию?')) {
    isQuiteLoading.value = true;
    await api.destroyCategory(token.value, id);
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
  <ModalNewCategory
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
                <h2 class='mb-0'>Категории</h2>
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
                <div class='me-2'>
                  <button
                    v-tooltip:right='item.isFavourite ? "Убрать из избранного" : "Добавить в избранное"'
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

                <div class='col'>
                  <div class='card-title mb-0'>
                    {{ item.name }}
                  </div>
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
                      @click='openEdit(item)'
                    >
                      Редактировать
                    </button>

                    <button
                      type='button'
                      class='dropdown-item'
                      @click='toggleHidden(item)'
                    >
                      Скрыть
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
            <div
              v-if='hiddenItems.length > 0'
              class='border-top-0'
            >
              <MobileArchive
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
                        <span>{{ item.name }}</span>
                      </div>
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
                          v-tooltip:bottom='"Скрыть категорию"'
                          type='button'
                          class='btn btn-action'
                          @click='toggleHidden(item)'
                        >
                          <IconEyeOff size='20' stroke-width='1' />
                        </button>
                        <button
                          type='button' class='btn btn-action' @click='destroy(item)'>
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
                    <td>
                      {{ item.name }}
                    </td>
                    <td>
                      <div class='btn-actions justify-content-end'>
                        <button
                          type='button' class='btn btn-action' @click='toggleHidden(item)'>
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
                Похоже таких категорий ещё нет
              </i>
              <i v-if='isError' class='text-danger'>
                Ошибка: не удалось загрузить категории.
                Попробуйте повторить операцию, или обратитесь в поддержку.
              </i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
