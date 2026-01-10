<script setup>
import api from '~/lib/api';
import { evaluate } from 'mathjs';

const { token } = useAuth();

const amount = ref(undefined);
const evaluatedAmount = ref(undefined);
const calculationError = ref('');
const description = ref('');
const date = ref(new Date());
const isSubmitting = ref(false);
const currentAccount = ref(undefined);
const currentAccountIds = ref([]);
const currentCategoryIds = ref([]);
const currentPropertyId = ref(undefined);

const props = defineProps({
  kind: {
    type: String,
    default: 'expense',
  },
  isCopy: {
    type: Boolean,
    default: false,
  },
  item: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['saved', 'close']);

const isEdit = computed(() => !!props.item && !props.isCopy);
const modalTitle = computed(() => {
  // console.log(props);
  // console.log('isEdit', isEdit.value.toString());
  if (props.kind === 'income') {
    return isEdit.value ? 'Редактировать доход' : 'Новый доход';
  } else {
    return isEdit.value ? 'Редактировать расход' : 'Новый расход';
  }
});

const toggleAccountCallback = (account) => {
  // console.log('toggleAccountCallback', account);
  if (account == null) return;
  currentAccount.value = account;
  currentAccountIds.value = [account.id];
}

const toggleCategoryCallback = (categoryIds) => {
  currentCategoryIds.value = [...categoryIds];
}

const togglePropertyCallback = (id) => {
  currentPropertyId.value = id;
}

const currentCurrencyName = computed(() => {
  const account = currentAccount.value;
  return account?.currency?.name || '';
});

watch(amount, (newExpression) => {
  if (!newExpression || newExpression.trim() === '') {
    evaluatedAmount.value = undefined;
    calculationError.value = '';
    return;
  }

  try {
    const result = evaluate(newExpression.replace(/,/g, '.'));
    evaluatedAmount.value = Number.isFinite(result) ? result : undefined;
    calculationError.value = '';
  } catch (error) {
    console.warn('Invalid expression:', error.message);
    evaluatedAmount.value = undefined;
    calculationError.value = 'Неверное выражение';
  }
});

watch(
  () => props.item,
  (val) => {
    amount.value = val?.amount.toString() ?? '';
    const parsedAmount = parseFloat(amount.value);
    // console.log('item', val);
    // console.log('parsedAmount', parsedAmount);
    if (parsedAmount !== NaN && parsedAmount < 0) {
      amount.value = Math.abs(parsedAmount).toString();
    }
    description.value = val?.description ?? '';
    date.value = val?.dateAt && !props.isCopy ?
      new Date(val.dateAt) :
      new Date();
    currentAccount.value = val?.account ?? undefined;
    if (currentAccount.value) {
      currentAccountIds.value = [currentAccount.value.id];
    }
    // console.log('val?.categories', val?.categories);
    // console.log('val?.categories?.length', val?.categories?.length);
    currentCategoryIds.value = val?.categories?.length > 0 ?
      val.categories.map(v => v.id) :
      [];

    // TODO: init: project, property
    // const currentPropertyId = ref(undefined);
  },
  { immediate: true }
);

const onSubmit = async () => {
  if (isSubmitting.value || !token.value) return;

  if (!evaluatedAmount.value && calculationError.value) {
    alert(calculationError.value);
    return;
  }

  isSubmitting.value = true;
  const isIncome = props.kind === 'income';
  try {
    if (isEdit.value) {
      await api.updateTransaction(token.value, {
        id: props.item.id,
        amount: evaluatedAmount.value.toString() || amount.value,
        isIncome,
        date: date.value,
        description: description.value,
        accountId: currentAccount.value.id,
        categoryIds: currentCategoryIds.value,
        projectId: [], // TODO
        propertyId: currentPropertyId.value,
      });

    } else {
      await api.createTransaction(token.value, {
        amount: evaluatedAmount.value.toString() || amount.value,
        isIncome,
        date: date.value,
        description: description.value,
        accountId: currentAccount.value.id,
        categoryIds: currentCategoryIds.value,
        projectId: [], // TODO
        propertyId: currentPropertyId.value,
      });
    }

    emit('saved');
  } finally {
    isSubmitting.value = false
  }
};
</script>

<template>
  <ModalBase id='modal-transaction' is-focus @close="emit('close')">
    <form @submit.prevent='onSubmit' autocomplete='off'>
      <div class='modal-header'>
        <h5 class='modal-title'>{{ modalTitle }}</h5>
        <button class='btn-close' type='button' @click="emit('close')" />
      </div>

      <div class='modal-body'>
        <div class='row mb-3'>
          <div class='col'>
            <Label required>Величина</Label>
            <div class='input-group input-group-flat'>
              <Input
                type='text'
                placeholder='10.2 + 3 * 6'
                required
                :disabled='isSubmitting'
                v-model='amount'
              />
              <span class='input-group-text'>{{ currentCurrencyName }}</span>
            </div>
          </div>
          <div class='col'>
            <Label required>Дата</Label>
            <InputDate v-model='date' :disabled='isSubmitting' />
          </div>
        </div>
        <div class='mb-3'>
          <Label>Комментарий</Label>
          <Input
            type='text'
            class='form-control'
            :disabled='isSubmitting'
            v-model='description'
          />
        </div>

        <div class='row'>
          <div class='col'>
            <FormAccounts
              @toggle-account='toggleAccountCallback'
              :ids='currentAccountIds'
            />
          </div>
          <div class='col'>
            <FormCategories
              @toggle-category='toggleCategoryCallback'
              :ids='currentCategoryIds'
            />
          </div>
        </div>
        <div class='row'>
          <div class='col'>
            <FormProperties @toggle-property='togglePropertyCallback' />
          </div>
          <div class='col'>
          </div>
        </div>
      </div>

      <div class='modal-footer'>
        <button class='btn-link link-secondary me-auto' type='button' @click="emit('close')">
          Отмена
        </button>
        <Button
          type='submit'
          class='btn-primary'
          :loading='isSubmitting'
          :disabled='!token'
        >
          Сохранить
        </Button>
      </div>
    </form>
  </ModalBase>
</template>
