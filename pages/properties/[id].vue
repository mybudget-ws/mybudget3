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

const prices = computed(() => {
  return [...(property.value?.prices || [])]
    .sort((a, b) => new Date(b.date) - new Date(a.date));
});

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
const isShowTransactionModal = ref(false);

const onCreateTransaction = () => {
  editingTransaction.value = null;
  isShowTransactionModal.value = true;
};

const onTransactionSaved = async () => {
  isShowTransactionModal.value = false;

  await loadProperty();
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

const editingTransaction = ref(null);

const onEditTransaction = (transaction) => {
  editingTransaction.value = transaction;
  isShowTransactionModal.value = true;
};

const onDeleteTransaction = async (transaction) => {
  const confirmed = confirm('Удалить операцию?');

  if (!confirmed) {
    return;
  }

  try {
    await api.destroyTransaction(token.value, {
      id: transaction.id,
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
  <ModalNewTransaction
    v-if="isShowTransactionModal"
    kind="expense"
    :item="editingTransaction"
    :property-id="property?.id"
    @saved="onTransactionSaved"
    @close="isShowTransactionModal = false"
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

    <template v-else>
      <div class="card mb-4">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h1 class="h3 mb-1">
                {{ property?.name || 'Имущество' }}
              </h1>

              <div class="text-secondary">
                Имущество
              </div>
            </div>

            <div
              v-if="prices.length"
              class="fs-1 text-end"
            >
              <div
                v-if="prices.length"
                class="fs-2 text-end"
              >
                <Amount
                  :value="prices[0].amount"
                  :currency="prices[0].currency?.name"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class='row'>
        <div class='col'>
          <AlertWarning
            class='mt-1 mb-5'
            title='В разработке'
            description='Не обращайте внимание'
          />
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="d-flex align-items-center mb-4">
            <h2 class="h4 mb-0">
              История изменения цены
            </h2>

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
                  <div>
                    <Amount
                      :value="price.amount"
                      :currency="price.currency?.name"
                    />
                  </div>
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
      <div class="card mt-4">
        <div class="card-body">
          <div class="d-flex align-items-center mb-4">
            <h2 class="h4 mb-0">
              Операции
            </h2>

            <button
              class="btn btn-primary ms-3"
              @click="onCreateTransaction"
            >
              <IconPlus :size="20" />
            </button>
          </div>

          <div
            v-if="!property?.transactions?.length"
            class="text-center text-secondary py-5"
          >
            Операций пока нет
          </div>

          <div
            v-else
            class="border-top"
          >
            <div
              v-for="transaction in property?.transactions || []"
              :key="transaction.id"
              class="
                d-flex
                align-items-center
                justify-content-between
                py-4
                border-bottom
              "
            >
              <div>
                <div class="fw-medium">
                  {{ transaction.description || 'Без названия' }}
                </div>

                <div class="text-secondary small mt-1">
                  {{ formatDate(transaction.dateAt) }}
                </div>
              </div>

              <div class="d-flex align-items-center">
                <div
                  :class="{
                    'text-success': transaction.isIncome,
                    'text-danger': !transaction.isIncome,
                  }"
                >
                  <Amount
                    :value="transaction.amount"
                    :currency="transaction.account?.currency?.name"
                  />
                </div>

                <div class="btn-actions">
                  <button
                    type="button"
                    class="btn btn-action"
                    @click="onEditTransaction(transaction)"
                  >
                    <IconPencil
                      size="20"
                      stroke-width="1.5"
                    />
                  </button>

                  <button
                    type="button"
                    class="btn btn-action"
                    @click="onDeleteTransaction(transaction)"
                  >
                    <IconTrash
                      size="20"
                      stroke-width="1.5"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>