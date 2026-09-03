<script setup>
import api from '~/lib/api';

const route = useRoute();
const router = useRouter();
const { token } = useAuth();

const accountIdParam = computed(() => {
  const id = Number(route.query.account_id);
  return Number.isInteger(id) && id > 0 ? id : undefined;
});

const amountFrom = ref(undefined);
const amountTo = ref(undefined);
const description = ref('');
const date = ref(new Date());

const isSubmitting = ref(false);

const currentAccountFrom = ref(undefined);
const currentAccountTo = ref(undefined);

const amountFromError = ref('');
const amountToError = ref('');
const sameAccountError = ref('');

const isAccountFromLoaded = ref(false);
const isAccountToLoaded = ref(false);

const backUrl = computed(() => {
  const value = route.query.back_url?.toString();

  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/transactions';
  }

  return value;
});

const isAccountsLoaded = computed(() => {
  return isAccountFromLoaded.value && isAccountToLoaded.value;
});

const isAccountEmpty = computed(() => {
  if (!isAccountsLoaded.value) return false;

  return !currentAccountFrom.value || !currentAccountTo.value;
});

const isSameAccountError = computed(() => sameAccountError.value !== '');
const isAmountFromError = computed(() => amountFromError.value !== '');
const isAmountToError = computed(() => amountToError.value !== '');

const isSubmitDisabled = computed(() => {
  return !token.value || isAccountEmpty.value;
});

const currentCurrencyNameFrom = computed(() => {
  return currentAccountFrom.value?.currency?.name || '';
});

const currentCurrencyNameTo = computed(() => {
  return currentAccountTo.value?.currency?.name || '';
});

const toggleAccountFromCallback = (account) => {
  if (!account) return;

  currentAccountFrom.value = account;
};

const toggleAccountToCallback = (account) => {
  if (!account) return;

  currentAccountTo.value = account;
};

const onClose = () => {
  router.push(backUrl.value);
};

const onSubmit = async () => {
  if (isSubmitting.value || !token.value) return;

  sameAccountError.value = '';
  amountFromError.value = '';
  amountToError.value = '';

  const amountSrc = parseFloat(
    amountFrom.value?.replace(/,/g, '.')
  );

  const amountDst = parseFloat(
    amountTo.value?.replace(/,/g, '.')
  );

  if (!Number.isFinite(amountSrc) || amountSrc <= 0) {
  amountFromError.value = 'Значение должно быть больше 0';
  return;
    }

    if (!Number.isFinite(amountDst) || amountDst <= 0) {
      amountToError.value = 'Значение должно быть больше 0';
      return;
    }

  if (
    currentAccountFrom.value?.id ===
    currentAccountTo.value?.id
  ) {
    sameAccountError.value =
      'Невозможно создать перевод на этот же счёт';

    return;
  }

  isSubmitting.value = true;

  try {
    const transferData = {
      amountSrc,
      amountDst,
      date: date.value,
      accountIdSrc: currentAccountFrom.value.id,
      accountIdDst: currentAccountTo.value.id,
      description: description.value,
    };

    await api.createTransactionTransfer(
      token.value,
      transferData
    );

    await router.push(backUrl.value);
  } catch (error) {
    console.error('Failed to save transfer:', error);
    alert('Не удалось сохранить перевод. Попробуйте еще раз.');
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
  <form
    class='d-flex flex-column min-vh-100'
    autocomplete='off'
    @submit.prevent='onSubmit'
  >
    <div class='page-header'>
      <div class='container-xl'>
        <div class='row align-items-center'>
          <div class='col'>
            <h2 class='page-title'>
              Новый перевод
            </h2>
          </div>
        </div>
      </div>
    </div>

    <div class='page-body flex-grow-1'>
      <div class='container-xl'>
        <div class='card'>
          <div class='card-body'>

            <div class='mb-3'>
              <FormAccounts
                label='Откуда'
                radio-group-name='accountFrom'
                :ids='accountIdParam ? [accountIdParam] : []'
                @toggle-account='toggleAccountFromCallback'
                @loaded='isAccountFromLoaded = true'
              />
            </div>

            <div class='mb-3'>
              <FormAccounts
                label='Куда'
                radio-group-name='accountTo'
                @toggle-account='toggleAccountToCallback'
                @loaded='isAccountToLoaded = true'
              />
            </div>

            <div
              v-if='isSameAccountError'
              class='mb-3'
            >
              <AlertWarning :title='sameAccountError' />
            </div>

            <div
              v-if='isAccountEmpty'
              class='mb-3'
            >
              <AlertWarning
                title='Невозможно создать перевод без&nbsp;счетов'
                button-text='Создайте счет'
              />
            </div>

            <div class='mb-3'>
              <Label required>
                Величина (источник)
              </Label>

              <div class='input-group input-group-flat'>
                <Input
                  v-model='amountFrom'
                  type='text'
                  placeholder='0.00'
                  required
                  :disabled='isSubmitting'
                  :is-error='isAmountFromError'
                />

                <span
                  class='input-group-text'
                  :class='isAmountFromError ? "border-danger" : ""'
                >
                  {{ currentCurrencyNameFrom }}
                </span>
              </div>

              <div
                v-if='isAmountFromError'
                class='text-danger mt-1'
              >
                {{ amountFromError }}
              </div>
            </div>

            <div class='mb-3'>
              <Label required>
                Величина (получатель)
              </Label>

              <div class='input-group input-group-flat'>
                <Input
                  v-model='amountTo'
                  type='text'
                  placeholder='0.00'
                  required
                  :disabled='isSubmitting'
                  :is-error='isAmountToError'
                />

                <span
                  class='input-group-text'
                  :class='isAmountToError ? "border-danger" : ""'
                >
                  {{ currentCurrencyNameTo }}
                </span>
              </div>

              <div
                v-if='isAmountToError'
                class='text-danger mt-1'
              >
                {{ amountToError }}
              </div>
            </div>

            <div class='mb-3'>
              <Label required>
                Дата
              </Label>

              <InputDate
                v-model='date'
                :disabled='isSubmitting'
              />

              <div class='mt-1'>
                <DateButtons v-model='date' />
              </div>
            </div>

            <div>
              <Label>
                Комментарий
              </Label>

              <Input
                v-model='description'
                type='text'
                class='form-control'
                :disabled='isSubmitting'
              />
            </div>

          </div>
        </div>
      </div>
    </div>

    <div class='position-sticky bottom-0 bg-body py-3'>
      <div class='container-xl'>
        <div class='d-flex gap-2'>
          <button
            class='btn-link link-secondary me-auto'
            type='button'
            :disabled='isSubmitting'
            @click='onClose'
          >
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
      </div>
    </div>
  </form>
</template>

<style scoped>
.date-button {
  height: 20px !important;
  padding: 0 8px;
  font-size: 11px;
  line-height: 20px;
}
</style>