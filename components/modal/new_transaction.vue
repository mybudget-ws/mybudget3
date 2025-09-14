<script setup>
import api from '~/lib/api';
import { Modal } from '@tabler/core/dist/js/tabler.min.js'

const { token } = useAuth();

const amount = ref(undefined);
const description = ref('');
const date = ref(new Date());
const isSubmitting = ref(false);
const currentAccount = ref(undefined);
const currentCategoriesIds = ref([]);
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
  transfer: {
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
  } else if (props.transfer) {
    return 'transfer';
  }
  return 'unknown';
});
const modalTitle = computed(() => {
  if (props.income) {
    return 'Новый доход';
  } else if (props.transfer) {
    return 'Новый перевод';
  }
  return 'Новый расход';
});
const isDisabledInput = computed(() => (
  isSubmitting.value || !token.value
));

const formatDateForInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const parseDateFromInput = (value) => {
  const [year, month, day] = value.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day));
}

const toggleAccountCallback = (account) => {
  if (account == null) return;
  currentAccount.value = account;
}

const toggleCategoryCallback = (categoryIds) => {
  currentCategoriesIds.value = [...categoryIds];
}

const currentCurrencyName = computed(() => {
  const account = currentAccount.value;
  return account?.currency?.name || '';
});

const onSubmit = async (event) => {
  event.preventDefault();
  isSubmitting.value = true;
  console.log('currentCategoriesIds.value', currentCategoriesIds.value);
  const result = await api.createTransaction(
    token.value,
    {
      amount: amount.value,
      isIncome: props.income,
      date: date.value,
      description: description.value,
      accountId: currentAccount.value.id,
      categoryIds: currentCategoriesIds.value,
      projectId: [], // TODO
      propertyId: [] // TODO
    }
  );
  isSubmitting.value = false;
  if (result) {
    document
      .querySelector(`#${modalId.value} .btn-close`)
      .dispatchEvent(new Event('click'));
    amount.value = undefined;
    currentCategoriesIds.value = [];
    transactionEventTicks.value++;
    emit('newTransaction');
  }
};
</script>

<template>
  <ModalBase :id='modalId'>
    <form @submit='onSubmit' autocomplete='off' >
      <div class='modal-header'>
        <h5 class='modal-title'>{{ modalTitle }}</h5>
        <button
          type='button'
          class='btn-close'
          data-bs-dismiss='modal'
          aria-label='Close'
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
            <input
              type='date'
              class='form-control'
              :value='formatDateForInput(date)'
              :disabled='isDisabledInput'
              @input='date.value = parseDateFromInput($event.target.value)'
            />
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
