<script setup>
import {
  IconPlus,
  IconPencil,
  IconTrash,
} from '@tabler/icons-vue';

import api from '~/lib/api';
import { useAuth } from '~/composables/use_auth';

definePageMeta({
  middleware: ['authenticated'],
});

const route = useRoute();
const { token } = useAuth();
const prices = computed(() => property.value?.prices || []);
const property = ref(null);

const isLoading = ref(false);
const isError = ref(false);

const isShowModal = ref(false);
const editingPrice = ref(null);

const loadProperty = async () => {
  try {
    isLoading.value = true;
    isError.value = false;

    property.value = await api.property(token.value, {
      id: route.params.id,
    });
  } catch (error) {
    console.error(error);
    isError.value = true;
  } finally {
    isLoading.value = false;
  }
};

const onCreatePrice = () => {
  editingPrice.value = null;
  isShowModal.value = true;
};

const onEditPrice = (price) => {
  editingPrice.value = price;
  isShowModal.value = true;
};

const onDeletePrice = async (price) => {
  const confirmed = confirm('Удалить цену?');

  if (!confirmed) {
    return;
  }

  try {
    await api.destroyPropertyPrice(token.value, {
      propertyId: property.value.id,
      id: price.id,
    });

    await loadProperty();
  } catch (error) {
    console.error(error);
  }
};

const onSaved = async () => {
  isShowModal.value = false;

  await loadProperty();
};

onMounted(async () => {
  await loadProperty();
});
</script>

<template>
  <div>
    <div class="d-flex align-items-center justify-content-between mb-4">
      <div>
        <h1 class="h3 mb-1">
          {{ property?.name || 'Имущество' }}
        </h1>

        <div class="text-secondary">
          История цен
        </div>
      </div>

      <button
        class="btn btn-primary"
        @click="onCreatePrice"
      >
        <IconPlus
          class="me-1"
          :size="18"
        />

        Добавить цену
      </button>
    </div>

    <div
      v-if="isLoading"
      class="card"
    >
      <div class="card-body">
        Загрузка...
      </div>
    </div>

    <div
      v-else-if="isError"
      class="alert alert-danger"
    >
      Ошибка загрузки имущества
    </div>

    <div
      v-else
      class="card"
    >
      <div class="table-responsive">
        <table class="table table-vcenter card-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Цена</th>
              <th>Описание</th>
              <th>Валюта</th>
              <th class="w-1"></th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="price in prices"
              :key="price.id"
            >
              <td>
                {{ price.date }}
              </td>

              <td>
                {{ price.amount }}
              </td>

              <td>
                {{ price.description || '—' }}
              </td>

              <td>
                {{ price.currency?.name }}
              </td>

              <td>
                <div class="d-flex gap-2">
                  <button
                    class="btn btn-icon btn-outline-primary"
                    @click="onEditPrice(price)"
                  >
                    <IconPencil :size="18" />
                  </button>

                  <button
                    class="btn btn-icon btn-outline-danger"
                    @click="onDeletePrice(price)"
                  >
                    <IconTrash :size="18" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!prices.length">
              <td
                colspan="5"
                class="text-center text-secondary py-4"
              >
                История цен пустая
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!--
    <ModalPropertyPrice
      v-if="isShowModal"
      :property="property"
      :item="editingPrice"
      @saved="onSaved"
      @close="isShowModal = false"
    />
    -->
  </div>
</template>