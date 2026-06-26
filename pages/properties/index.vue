<script setup>
import {
  IconPlus,
  IconPencil,
  IconEyeOff,
  IconTrash,
  IconDotsVertical,
  IconChevronDown,
} from '@tabler/icons-vue';

import api from '~/lib/api';
import { useAuth } from '~/composables/use_auth';
import { useDevice } from '~/composables/use_device';

const { isMobile } = useDevice();
const appConfig = useAppConfig();

const { token } = useAuth();
const isError = ref(false)
const isLoading = ref(false);
const isQuiteLoading = ref(false);
const properties = ref([]);
const isShowModal = ref(false)
const currentItem = ref(null)
const visibleItems = computed(() => properties.value.filter(v => !v.isHidden));
const hiddenItems = computed(() => properties.value.filter(v => v.isHidden));
const isArchiveOpen = ref(false);

const isEmpty = computed(() => {
  if (isLoading.value) return false;
  if (isError.value) return false;
  return properties.value.length === 0;
});

const isShowFooter = computed(() => isEmpty.value || isError.value);

const load = async (isQuite = false) => {
  isError.value = false;
  if (isQuite) {
    isQuiteLoading.value = true
  } else {
    isLoading.value = true
  }

  try {
    const items = await api.properties(token.value, { allData: true });
    if (items) {
      properties.value = items
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

const kindDisplayName = ({ kind }) => {
  if (kind === 'realty') return 'Недвижимость';
  if (kind === 'transport') return 'Транспорт';

  return 'Другое';
}

const linkColorClass = computed(() => {
  return appConfig.theme.dark ?
    'link-light' :
    'link-dark';
});

const toggleHidden = async ({ id }) => {
  isQuiteLoading.value = true;
  await api.toggleIsHidden(token.value, id, 'property');
  await load(true);
};

const destroy = async ({ id }) => {
  if (confirm('Вы уверены, что хотите удалить имущество?')) {
    isQuiteLoading.value = true;
    await api.destroyProperty(token.value, id);
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
  <ModalNewProperty
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
                <h2 class='mb-0'>Имущество</h2>
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
              <div class='d-flex flex-column flex-grow-1'>
                <div class='d-flex align-items-center mb-1'>
                  <NuxtLink
                    :to='`/properties/${item.id}`'
                    class='card-title'
                    :class='linkColorClass'
                  >
                    {{ item.name }}
                  </NuxtLink>
                  <div class='ms-2'>
                    <div class='badge'>
                      {{ kindDisplayName(item) }}
                    </div>
                  </div>
                </div>

                <div class='fw-medium'>
                  <Amount
                    :value='item.amount'
                    :currency='item.currency.name'
                  />
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
                class='w-100 btn btn-link text-decoration-none text-secondary  d-flex align-items-center justify-content-between'
                @click='isArchiveOpen = !isArchiveOpen'
              >
                <span>Архив ({{ hiddenItems.length }})</span>

                <IconChevronDown
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
                  class='card-header'
                  :class='{
                    "border-bottom-0": index === hiddenItems.length - 1,
                    "border-top": index === 0,
                  }'
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
          
          <div v-else class='advanced-table'>
            <div class='table-responsive'>
              <table class='table table-vcenter table-selectable'>
                <thead>
                  <tr>
                    <th>Название</th>
                    <th>Тип</th>
                    <th class='w-1'>Стоимость</th>
                    <th class='w-1'/>
                  </tr>
                </thead>
                <tbody class='table-tbody'>
                  <tr v-for='item in visibleItems' :key='item.id'>
                    <td>
                      <NuxtLink
                        :to='`/properties/${item.id}`'
                        class='fw-medium'
                        :class='linkColorClass'
                      >
                        {{ item.name }}
                      </NuxtLink>
                    </td>
                    <td class='text-secondary'>{{ kindDisplayName(item) }}</td>
                    <td class='text-nowrap text-end'>
                      <Amount
                        :value='item.amount'
                        :currency='item.currency.name'
                        copyable
                      />
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
                          v-tooltip:bottom='"Скрыть имущество"'
                          type='button'
                          class='btn btn-action'
                          @click='toggleHidden(item)'
                        >
                          <IconEyeOff size='20' stroke-width='1' />
                        </button>
                        <button
                          type='button'
                          class='btn btn-action'
                          @click='destroy(item)'
                        >
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
                          class='btn btn-action'
                          type='button'
                          @click='toggleHidden(item)'
                        >
                          <IconEyeOff size='20' stroke-width='1' />
                        </button>
                        <button
                          class='btn btn-action'
                          type='button'
                          @click='destroy(item)'
                        >
                          <IconTrash size='20' stroke-width='1' />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div
              v-if='isShowFooter'
              class='card-footer d-flex align-items-center'
            >
              <i v-if='isEmpty' class='text-secondary'>
                Похоже имущества ещё нет
              </i>
              <i v-if='isError' class='text-danger'>
                Ошибка: не удалось загрузить имущество.
                Попробуйте повторить операцию, или обратитесь в поддержку.
              </i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
