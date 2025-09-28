<script setup>
import api from '~/lib/api';
import { Modal } from '@tabler/core/dist/js/tabler.min.js'

const { token } = useAuth();

const amount = ref(undefined);
const description = ref('');
const date = ref(new Date());
const isSubmitting = ref(false);
const currentAccount = ref(undefined);
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

const modalId = 'modal-transfer';
const isDisabledInput = computed(() => (
  isSubmitting.value || !token.value
));

const toggleAccountCallback = (account) => {
  if (account == null) return;
  currentAccount.value = account;
}

const currentCurrencyName = computed(() => {
  const account = currentAccount.value;
  return account?.currency?.name || '';
});

const onSubmit = async (event) => {
  event.preventDefault();
  isSubmitting.value = true;
  const result = await api.createTransaction(
    token.value,
    {
      amount: amount.value,
      isIncome: props.income,
      date: date.value,
      description: description.value,
      accountId: currentAccount.value.id,
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
    transactionEventTicks.value++;
    emit('newTransaction');
  }
};
</script>

<template>
  <ModalBase :id='modalId'>
    <form @submit='onSubmit' autocomplete='off' >
      <div class='modal-header'>
        <h5 class='modal-title'>Новый перевод</h5>
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
        </div>
        <div class='row mb-3'>
          <div class='col'>
            <Label required>Дата</Label>
            <InputDate v-model='date' :disabled='isDisabledInput' />
          </div>
          <div class='col'>
            <Label>Комментарий</Label>
            <Input
              type='text'
              class='form-control'
              :disabled='isDisabledInput'
              v-model='description'
            />
          </div>
        </div>

        <div class='row'>
          <div class='col'>
            <FormAccounts @toggle-account='toggleAccountCallback' />
          </div>
          <div class='col'>
            <FormAccounts @toggle-account='toggleAccountCallback' />
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
