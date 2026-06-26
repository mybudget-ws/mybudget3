<script setup>
import {
  IconPlus,
  IconPencil,
  IconEyeOff,
  IconTrash,
} from '@tabler/icons-vue';

import api from '~/lib/api';
import { DEFAULT_LOCALE } from '~/lib/helper_date';
import { useAuth } from '~/composables/use_auth';

const { token } = useAuth();
const isError = ref(false);
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

const isShowFooter = computed(() => isEmpty.value || isError.value);

const load = async (isQuite = false) => {
  isError.value = false;
  if (isQuite) {
    isQuiteLoading.value = true
  } else {
    isLoading.value = true
  }

  try {
    const result = await api.goals(token.value);
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

const rest = ({ amount, balance }) => {
  if (balance >= amount) { return 0.0; }
  return Math.round(amount - balance);
};

const displayCurrency = ({ currency }) => {
  return currency ? currency.name : '';
};

const isGoalFinish = ({ percentage }) => (percentage >= 100);
const isGoalFail = ({ dueDateOn }) => (new Date(dueDateOn) < new Date());

const toggleHidden = async ({ id }) => {
  isQuiteLoading.value = true;
  await api.toggleIsHidden(token.value, id, 'goal');
  await load(true);
};

const destroy = async ({ id }) => {
  if (confirm('Вы уверены, что хотите удалить цель, операция необратима?')) {
    isQuiteLoading.value = true;
    await api.destroyGoal(token.value, id);
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
  <ModalNewGoal
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
                <h2 class='mb-0'>Цели</h2>
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
          <div v-else class='advanced-table'>
            <div class='table-responsive'>
              <table class='table table-vcenter table-selectable'>
                <thead>
                  <tr>
                    <th>Название</th>
                    <th>Прогресс</th>
                    <th>Счёт</th>
                    <th class='w-1 text-end'>В месяц</th>
                    <th class='w-1'>Дата</th>
                    <th class='w-1'/>
                  </tr>
                </thead>
                <tbody class='table-tbody'>
                  <tr v-for='item in visibleItems' :key='item.id'>
                    <td>
                      <div>
                        <div class='text-nowrap mb-1'>
                          {{ item.name }}
                        </div>

                        <Amount
                          :class='{
                            "text-success": isGoalFinish(item),
                            "text-secondary": !isGoalFinish(item),
                          }'
                          :value='item.amount'
                          :currency='displayCurrency(item)'
                        />
                      </div>
                    </td>

                    <td style='min-width: 260px;'>
                      <div class='d-flex justify-content-between'>
                        <div
                          :class='{
                            "text-success": isGoalFinish(item),
                            "text-secondary": !isGoalFinish(item),
                            "text-danger": isGoalFail(item),
                          }'
                        >
                          {{ item.percentage }} %
                        </div>
                        <Amount
                          class='text-secondary'
                          :value='item.balance'
                          :currency='displayCurrency(item)'
                        />
                      </div>

                      <div class='progress mt-1'>
                        <div
                          class='progress-bar'
                          :class='{
                            "bg-success": isGoalFinish(item),
                            "bg-danger": isGoalFail(item),
                          }'
                          :style='{ width: `${Math.min(item.percentage, 100)}%` }'
                        />
                      </div>
                    </td>

                    <td>
                      <div class='badges-list'>
                        <span
                          v-for='v in item.accounts'
                          :key='v.id'
                          class='badge'
                        >
                          {{ v.name }}
                        </span>
                      </div>
                    </td>

                    <td class='text-nowrap text-end'>
                      <Amount
                        v-tooltip:bottom='`Осталось накопить ${rest(item)}\u00A0${displayCurrency(item)} за\u00A0${item.dueMonths}\u00A0месяцев(а)`'
                        :class='{
                          "text-success": isGoalFinish(item),
                        }'
                        :value='item.amountPerMonth'
                        :currency='displayCurrency(item)'
                      />
                    </td>

                    <td>
                      <span
                        :class='{
                          "text-danger": isGoalFail(item),
                        }'
                      >
                        {{ new Date(item.dueDateOn).toLocaleDateString(DEFAULT_LOCALE) }}
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
                          v-tooltip:bottom='"Скрыть цель"'
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
            <div
              v-if='isShowFooter'
              class='card-footer d-flex align-items-center'
            >
              <i v-if='isEmpty' class='text-secondary'>
                Похоже таких целей ещё нет
              </i>
              <i v-if='isError' class='text-danger'>
                Ошибка: не удалось загрузить цели.
                Попробуйте повторить операцию, или обратитесь в поддержку.
              </i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
