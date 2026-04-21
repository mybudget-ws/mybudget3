<script setup>
import {
  IconAlertTriangle,
} from '@tabler/icons-vue';

import api from '~/lib/api';

const { token } = useAuth();

const amountFrom = ref(undefined);
const amountTo = ref(undefined);
const description = ref('');
const date = ref(new Date());
const isLoaded = ref(false);
const isSubmitting = ref(false);
const currentAccountFrom = ref(undefined);
const currentAccountTo = ref(undefined);
const amountFromRef = ref(null);
const submitError = ref('');

const emit = defineEmits(['saved', 'close', 'accountNew']);

const focusAmountFrom = () => {
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

const isAccountEmpty = computed(() => {
  if (!isLoaded.value) return;
  return !currentAccountFrom.value || !currentAccountTo.value;
});

const isSubmitDisabled = computed(() => {
  return !token.value || isAccountEmpty.value;
});

const onSubmit = async () => {
  if (isSubmitting.value || !token.value) return;

  submitError.value = '';

  const amountSrc = parseFloat(amountFrom.value?.replace(/,/g, '.'));
  const amountDst = parseFloat(amountTo.value?.replace(/,/g, '.'));

  if (amountSrc === 0 || amountDst === 0) {
    submitError.value = 'Значение должно быть больше 0';
    return;
  }

  if (currentAccountFrom.value?.id === currentAccountTo.value?.id) {
    submitError.value = 'Нельзя переводить на тот же счет';
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
  <ModalBase id='modal-transaction' @close="emit('close')">
    <form @submit.prevent='onSubmit' autocomplete='off'>
      <div class='modal-header'>
        <h5 class='modal-title'>Новый перевод</h5>
        <button class='btn-close' type='button' @click="emit('close')" />
      </div>

      <div class='modal-body'>
        <div class='row mb-3'>
          <div class='col'>
            <FormAccounts
              label='Откуда'
              radioGroupName='accountFrom'
              @toggle-account='toggleAccountFromCallback'
              @loaded="isLoaded = true"
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

        <div v-if='isAccountEmpty' class='row mb-3'>
          <div class='col'>
            <AlertWarning
              title="Невозможно создать перевод без&nbsp;счетов"
              button-text="Создайте счет"
              @action="emit('accountNew')"
            />
          </div>
        </div>

        <div class='row mb-3'>
          <div class='col'>
            <Label required>Величина (источник)</Label>
            <div class='input-group input-group-flat'>
              <Input
                ref='amountFromRef'
                type='text'
                placeholder='0.00'
                required
                :disabled='isSubmitting'
                v-model='amountFrom'
              />
              <span class='input-group-text'>{{ currentCurrencyNameFrom }}</span>
            </div>
            <div v-if="submitError" class="mt-3">
              <AlertWarning :title="submitError" />
            </div>
          </div>
          <div class='col'>
            <Label required>Величина (получатель)</Label>
            <div class='input-group input-group-flat'>
              <Input
                type='text'
                placeholder='0.00'
                required
                :disabled='isSubmitting'
                v-model='amountTo'
              />
              <span class='input-group-text'>{{ currentCurrencyNameTo }}</span>
            </div>
          </div>
        </div>

        <div class='row'>
          <div class='col'>
            <Label required>Дата</Label>
            <InputDate v-model='date' :disabled='isSubmitting' />
          </div>
          <div class='col'>
            <Label>Комментарий</Label>
            <Input
              type='text'
              class='form-control'
              :disabled='isSubmitting'
              v-model='description'
            />
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
          :disabled='isSubmitDisabled'
        >
          Сохранить
        </Button>
      </div>
    </form>
  </ModalBase>
</template>
