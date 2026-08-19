<script setup>
import api from '~/lib/api';
import { useDevice } from '~/composables/use_device';

const { isMobile } = useDevice();
const { token } = useAuth();

const amountFrom = ref(undefined);
const amountTo = ref(undefined);
const description = ref('');
const date = ref(new Date());
const isSubmitting = ref(false);
const currentAccountFrom = ref(undefined);
const currentAccountTo = ref(undefined);
const amountFromRef = ref(null);
const amountFromError = ref('');
const amountToError = ref('');
const sameAccountError = ref('');

const props = defineProps({
  initialAccountId: {
    type: Number,
    default: undefined,
  },
});

const isAccountFromLoaded = ref(false);
const isAccountToLoaded = ref(false);

const isAccountsLoaded = computed(() => {
  return isAccountFromLoaded.value && isAccountToLoaded.value;
});

const isAccountEmpty = computed(() => {
  if (!isAccountsLoaded.value) return false;

  return !currentAccountFrom.value || !currentAccountTo.value;
});

const emit = defineEmits(['saved', 'close', 'accountNew']);

const isSameAccountError = computed(() => sameAccountError.value !== '');
const isAmountFromError = computed(() => amountFromError.value !== '');
const isAmountToError = computed(() => amountToError.value !== '');

const focusAmountFrom = () => {
  if (isMobile.value) return;

  nextTick(() => {
    if (amountFromRef.value?.focus) amountFromRef.value.focus();
  });
};

const toggleAccountFromCallback = (account) => {
  if (!account) return;

  currentAccountFrom.value = account;
  focusAmountFrom();
};

const toggleAccountToCallback = (account) => {
  if (!account) return;

  currentAccountTo.value = account;
  focusAmountFrom();
};

const currentCurrencyNameFrom = computed(() => {
  const account = currentAccountFrom.value;
  return account?.currency?.name || '';
});

const currentCurrencyNameTo = computed(() => {
  const account = currentAccountTo.value;
  return account?.currency?.name || '';
});

const isSubmitDisabled = computed(() => {
  return !token.value || isAccountEmpty.value;
});

const onSubmit = async () => {
  if (isSubmitting.value || !token.value) return;

  sameAccountError.value = '';
  amountFromError.value = '';
  amountToError.value = '';

  const amountSrc = parseFloat(amountFrom.value?.replace(/,/g, '.'));
  const amountDst = parseFloat(amountTo.value?.replace(/,/g, '.'));

  if (amountSrc <= 0 || amountDst <= 0) {
    if (amountSrc <= 0) amountFromError.value = 'Значение должно быть больше 0';
    if (amountDst <= 0) amountToError.value = 'Значение должно быть больше 0';
    return;
  }

  if (currentAccountFrom.value?.id === currentAccountTo.value?.id) {
    sameAccountError.value = 'Невозможно создать перевод на этот же счёт';
    return;
  }

  isSubmitting.value = true;
  const transferData = {
    amountSrc: amountFrom.value.replace(/,/g, '.'),
    amountDst: amountTo.value.replace(/,/g, '.'),
    date: date.value,
    accountIdSrc: currentAccountFrom.value.id,
    accountIdDst: currentAccountTo.value.id,
    description: description.value,
  };

  try {
    await api.createTransactionTransfer(token.value, transferData);
    emit('saved');
  } finally {
    isSubmitting.value = false;
  }
};

watch(amountFrom, (newValue) => {
  if (newValue !== undefined && newValue !== '') {
    amountTo.value = newValue;
  }
});
</script>

<template>
  <ModalBase id='modal-transaction' @close='emit("close")'>
    <form autocomplete='off' @submit.prevent='onSubmit'>
      <div class='modal-header'>
        <h5 class='modal-title'>Новый перевод</h5>
        <button class='btn-close' type='button' @click='emit("close")' />
      </div>

      <div class='modal-body'>
        <div class='row mb-3'>
          <div class='col-12 col-md-6 mb-3 mb-md-0'>
            <FormAccounts
              label='Откуда'
              radio-group-name='accountFrom'
              :initial-selected-id='props.initialAccountId'
              @toggle-account='toggleAccountFromCallback'
              @loaded='isAccountFromLoaded = true'
            />
          </div>
          <div class='col-12 col-md-6'>
            <FormAccounts
              label='Куда'
              radio-group-name='accountTo'
              @toggle-account='toggleAccountToCallback'
              @loaded='isAccountToLoaded = true'
            />
          </div>
        </div>

        <div v-if='isSameAccountError' class='row mb-3'>
          <div class='col'>
            <AlertWarning :title='sameAccountError' />
          </div>
        </div>

        <div v-if='isAccountEmpty' class='row mb-3'>
          <div class='col'>
            <AlertWarning
              title='Невозможно создать перевод без&nbsp;счетов'
              button-text='Создайте счет'
              @action='emit("accountNew")'
            />
          </div>
        </div>

        <div class='row mb-3'>
          <div class='col-12 col-md-6 mb-3 mb-md-0'>
            <Label required>Величина (источник)</Label>
            <div class='input-group input-group-flat'>
              <Input
                ref='amountFromRef'
                v-model='amountFrom'
                type='text'
                placeholder='0.00'
                required
                :disabled='isSubmitting'
                :is-error='isAmountFromError'
              />
              <span class='input-group-text' :class='isAmountFromError ? "border-danger" : ""'>
                {{ currentCurrencyNameFrom }}
              </span>
            </div>
            <div v-if='isAmountFromError' class='text-danger mt-1'>
              {{ amountFromError }}
            </div>
          </div>

          <div class='col-12 col-md-6'>
            <Label required>Величина (получатель)</Label>
            <div class='input-group input-group-flat'>
              <Input
                v-model='amountTo'
                type='text'
                placeholder='0.00'
                required
                :disabled='isSubmitting'
                :is-error='isAmountToError'
              />
              <span class='input-group-text' :class='isAmountToError ? "border-danger" : ""'>
                {{ currentCurrencyNameTo }}
              </span>
            </div>
            <div v-if='isAmountToError' class='text-danger mt-1'>
              {{ amountToError }}
            </div>
          </div>
        </div>

        <div class='row'>
          <div class='col-12 col-md-6 mb-3 mb-md-0'>
            <Label required>Дата</Label>
            <InputDate v-model='date' :disabled='isSubmitting' />
            <div class='mt-1'>
              <DateButtons v-model='date' />
            </div>
          </div>
          <div class='col-12 col-md-6'>
            <Label>Комментарий</Label>
            <Input
              v-model='description'
              type='text'
              class='form-control'
              :disabled='isSubmitting'
            />
          </div>
        </div>
      </div>

      <div class='modal-footer'>
        <button class='btn-link link-secondary me-auto' type='button' @click='emit("close")'>
          Отмена
        </button>
        <Button
          type='submit'
          class='btn-primary'
          :loading='isSubmitting'
          :disabled='isSubmitDisabled'
        >
          Сохранить
        </Button>
      </div>
    </form>
  </ModalBase>
</template>

<style scoped>
.date-button {
  height: 20px !important;
  padding: 0 8px;
  font-size: 11px;
  line-height: 20px;
}
</style>