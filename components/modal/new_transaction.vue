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
const currentCategoriesIds = ref([]);
const currentPropertyId = ref(undefined);
const transactionEventTicks = ref(1);

const props = defineProps({
  expense: {
    type: Boolean,
    default: false,
  },
  income: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['newTransaction'])

const modalId = computed(() => (`modal-${modalType.value}`));
const modalType = computed(() => {
  if (props.expense) {
    return 'expense';
  } else if (props.income) {
    return 'income';
  }
  return 'unknown';
});
const modalTitle = computed(() => {
  return props.income ? 'Новый доход' : 'Новый расход';
});
const isDisabledInput = computed(() => (
  isSubmitting.value || !token.value
));

const toggleAccountCallback = (account) => {
  if (account == null) return;
  currentAccount.value = account;
}

const toggleCategoryCallback = (categoryIds) => {
  currentCategoriesIds.value = [...categoryIds];
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

// const handleModalShown = () => {
//   const modalElement = document.getElementById(modalId.value);
//   const firstInput = modalElement.querySelector('input[type="text"]:not([type="hidden"])');
//   // Для выделения текста, если это будте нужно в будущем,
//   // например, при редактировании операции дополнительно:
//   // `firstInput.select();`
//   if (firstInput) firstInput.focus();
// };

const onSubmit = async (event) => {
  event.preventDefault();
  isSubmitting.value = true;

  if (!evaluatedAmount.value && calculationError.value) {
    alert(calculationError.value);
    isSubmitting.value = false;
    return;
  }

  const result = await api.createTransaction(
    token.value,
    {
      amount: evaluatedAmount.value.toString() || amount.value,
      isIncome: props.income,
      date: date.value,
      description: description.value,
      accountId: currentAccount.value.id,
      categoryIds: currentCategoriesIds.value,
      projectId: [], // TODO
      propertyId: currentPropertyId.value,
    }
  );
  isSubmitting.value = false;
  if (result) {
    document
      .querySelector(`#${modalId.value} .btn-close`)
      .dispatchEvent(new Event('click'));
    amount.value = undefined;
    description.value = '';
    currentCategoriesIds.value = [];
    transactionEventTicks.value++;
    emit('newTransaction');
  }
};

const onCloseCallback = () => {
  amount.value = undefined;
  description.value = '';
  currentCategoriesIds.value = [];
}
</script>

<template>
  <ModalBase :id='modalId' is-focus>
    <form @submit='onSubmit' autocomplete='off' >
      <div class='modal-header'>
        <h5 class='modal-title'>{{ modalTitle }}</h5>
        <button
          type='button'
          class='btn-close'
          data-bs-dismiss='modal'
          aria-label='Close'
          @click='onCloseCallback'
        />
      </div>
      <div class='modal-body'>
        <div class='row mb-3'>
          <div class='col'>
            <Label required>Величина</Label>
            <div class='input-group input-group-flat'>
              <Input
                type='text'
                placeholder='10.5 + 3 * 2'
                required
                :disabled='isDisabledInput'
                v-model='amount'
              />
              <span class='input-group-text'>{{ currentCurrencyName }}</span>
            </div>
          </div>
          <div class='col'>
            <Label required>Дата</Label>
            <InputDate v-model='date' :disabled='isDisabledInput' />
          </div>
        </div>
        <div class='mb-3'>
          <Label>Комментарий</Label>
          <Input
            type='text'
            class='form-control'
            :disabled='isDisabledInput'
            v-model='description'
          />
        </div>

        <div class='row'>
          <div class='col'>
            <FormAccounts @toggle-account='toggleAccountCallback' />
          </div>
          <div class='col'>
            <FormCategories
              @toggle-category='toggleCategoryCallback'
              :reload='transactionEventTicks'
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
        <button type='button' class='btn-link link-secondary me-auto' data-bs-dismiss='modal'>
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
