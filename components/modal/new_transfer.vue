<script setup>
import api from '~/lib/api';

const { token } = useAuth();

const amountFrom = ref(undefined);
const amountTo = ref(undefined);
const description = ref('');
const date = ref(new Date());
const isSubmitting = ref(false);
const currentAccountFrom = ref(undefined);
const currentAccountTo = ref(undefined);
const transactionEventTicks = ref(1);

const emit = defineEmits(['newTransaction'])

const modalId = 'modal-transfer';
const isDisabledInput = computed(() => (
  isSubmitting.value || !token.value
));

const toggleAccountFromCallback = (account) => {
  if (account == null) return;
  currentAccountFrom.value = account;
}

const toggleAccountToCallback = (account) => {
  if (account == null) return;
  currentAccountTo.value = account;
}

const currentCurrencyNameFrom = computed(() => {
  const account = currentAccountFrom.value;
  return account?.currency?.name || '';
});

const currentCurrencyNameTo = computed(() => {
  const account = currentAccountTo.value;
  return account?.currency?.name || '';
});

const onSubmit = async (event) => {
  event.preventDefault();
  isSubmitting.value = true;

  const transferData = {
    amountSrc: amountFrom.value.replace(/,/g, '.'),
    amountDst: amountTo.value.replace(/,/g, '.'),
    date: date.value,
    accountIdSrc: currentAccountFrom.value.id,
    accountIdDst: currentAccountTo.value.id,
    description: description.value,
  };

  const result = await api.createTransactionTransfer(
    token.value,
    transferData
  );
  isSubmitting.value = false;
  if (result) {
    document
      .querySelector(`#${modalId} .btn-close`)
      .dispatchEvent(new Event('click'));
    amountFrom.value = undefined;
    amountTo.value = undefined;
    description.value = '';
    transactionEventTicks.value++;
    emit('newTransaction');
  }
};

const onCloseCallback = () => {
  amountFrom.value = undefined;
  amountTo.value = undefined;
  description.value = '';
}

watch(amountFrom, (newValue) => {
  if (newValue !== undefined && newValue !== '') {
    amountTo.value = newValue;
  }
});
</script>

<template>
  <ModalBaseOld :id='modalId'>
    <form @submit='onSubmit' autocomplete='off' >
      <div class='modal-header'>
        <h5 class='modal-title'>Новый перевод</h5>
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
            <FormAccounts
              label='Откуда'
              radioGroupName='accountFrom'
              @toggle-account='toggleAccountFromCallback'
            />
          </div>
          <div class='col'>
            <FormAccounts
              label='Куда'
              radioGroupName='accountTo'
              @toggle-account='toggleAccountToCallback'
            />
          </div>
        </div>

        <div class='row mb-3'>
          <div class='col'>
            <Label required>Величина (источник)</Label>
            <div class='input-group input-group-flat'>
              <Input
                type='text'
                placeholder='0.00'
                required
                :disabled='isDisabledInput'
                v-model='amountFrom'
              />
              <span class='input-group-text'>{{ currentCurrencyNameFrom }}</span>
            </div>
          </div>
          <div class='col'>
            <Label required>Величина (получатель)</Label>
            <div class='input-group input-group-flat'>
              <Input
                type='text'
                placeholder='0.00'
                required
                :disabled='isDisabledInput'
                v-model='amountTo'
              />
              <span class='input-group-text'>{{ currentCurrencyNameTo }}</span>
            </div>
          </div>
        </div>

        <div class='row'>
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
  </ModalBaseOld>
</template>
