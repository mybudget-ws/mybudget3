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

const property = ref(null);

const prices = computed(() => property.value?.prices || []);

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

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });
};

const formatAmount = (amount) => {
  return new Intl.NumberFormat('ru-RU').format(amount);
};

onMounted(async () => {
  await loadProperty();
});
</script>

<template>
  <ModalNewPrice
    v-if="isShowModal"
    :property="property"
    :item="editingPrice"
    @saved="onSaved"
    @close="isShowModal = false"
  />
  <div>
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
      <div class="card-body">
        <div class="d-flex justify-content: space-between mb-4">
          <div>
            <h1 class="h3 mb-1">
              {{ property?.name || 'Имущество' }}
            </h1>

            <div class="text-secondary">
              История изменения цены
            </div>
          </div>

          <button
            class="btn btn-primary ms-3"
            @click="onCreatePrice"
          >
            <IconPlus :size="20" />
          </button>
        </div>

        <div class="border-top">
          <div
            class="
              d-flex
              align-items-center
              justify-content-between
              py-3
              text-secondary
              fw-bold
              small
              border-bottom
            "
          >
            <div>
              Дата
            </div>

            <div>
              Величина
            </div>
          </div>

          <div
            v-for="price in prices"
            :key="price.id"
            class="
              d-flex
              align-items-center
              justify-content-between
              py-4
              border-bottom
            "
          >
            <div class="fs-3">
              {{ formatDate(price.date) }}
            </div>

            <div class="d-flex align-items-center">
              <div>
                {{ formatAmount(price.amount) }}

                <span>
                  {{ price.currency?.name }}
                </span>

              </div>

              <div class="btn-actions">
                <button
                  type="button"
                  class="btn btn-action"
                  @click="onEditPrice(price)"
                >
                  <IconPencil
                    size="20"
                    stroke-width="1.5"
                  />
                </button>

                <button
                  type="button"
                  class="btn btn-action"
                  @click="onDeletePrice(price)"
                >
                  <IconTrash
                    size="20"
                    stroke-width="1.5"
                  />
                </button>
              </div>
            </div>
          </div>

          <div
            v-if="!prices.length"
            class="text-center text-secondary py-5"
          >
            История цен пустая
          </div>
        </div>
      </div>
    </div>
  </div>
</template>