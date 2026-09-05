<script setup>
import api from '~/lib/api';
import { evaluate } from 'mathjs';
import { nextTick } from 'vue';
import { KIND_EXPENSE } from '~/lib/consts';

const route = useRoute();
const router = useRouter();
const { token } = useAuth();

const amountInputRef = ref(null);
const isLoaded = ref(false);
const amount = ref(undefined);
const evaluatedAmount = ref(undefined);
const calculationError = ref('');
const description = ref('');
const date = ref(new Date());
const isSubmitting = ref(false);
const currentAccount = ref(undefined);
const currentAccountIds = ref([]);
const currentCategoryIds = ref([]);
const currentProjectId = ref(undefined);
const currentPropertyId = ref(undefined);
const propertyIdParam = computed(() => {
  const id = Number(route.query.property_id);
  return Number.isInteger(id) && id > 0 ? id : undefined;
});
const transactionId = computed(() => {
  const id = Number(route.query.id);

  return Number.isInteger(id) && id > 0 ? id : undefined;
});

const copyId = computed(() => {
  const id = Number(route.query.copy_id);

  return Number.isInteger(id) && id > 0 ? id : undefined;
});

const isEdit = computed(() => !!transactionId.value);
const isCopy = computed(() => !!copyId.value);

if (!isEdit.value && !isCopy.value) {
  currentPropertyId.value = propertyIdParam.value;
}

const loadItem = async () => {
  const id = transactionId.value || copyId.value;

  if (!id || !token.value) return;

  const item = await api.transaction(token.value, id);

  if (!item) return;

  amount.value = Math.abs(Number(item.amount)).toString();
  description.value = item.description || '';

  date.value = isCopy.value
    ? new Date()
    : new Date(item.dateAt);

  currentAccount.value = item.account;
  currentAccountIds.value = item.account
    ? [item.account.id]
    : [];

  currentCategoryIds.value = item.categories?.map(category => category.id) || [];
  currentProjectId.value = item.project?.id;
  currentPropertyId.value = item.property?.id ?? propertyIdParam.value;
};

const kind = computed(() => {
  return route.query.kind?.toString() || KIND_EXPENSE;
});

const backUrl = computed(() => {
  const value = route.query.back_url?.toString();

  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/transactions';
  }

  return value;
});

const isAccountEmpty = computed(() => {
  if (!isLoaded.value) return false;

  return !currentAccount.value?.id;
});

const isSubmitDisabled = computed(() => (
  !token.value ||
  !isLoaded.value ||
  isAccountEmpty.value
));

const pageTitle = computed(() => {
  if (isEdit.value) {
    return kind.value === 'income' ? 'Редактировать доход' : 'Редактировать расход';
  }

  return kind.value === 'income' ? 'Новый доход' : 'Новый расход';
});

const toggleAccountCallback = (account) => {
  if (account == null) return;

  currentAccount.value = account;
  currentAccountIds.value = [account.id];
};

const toggleCategoryCallback = (categoryIds) => {
  currentCategoryIds.value = [...categoryIds];
};

const toggleProjectCallback = (id) => {
  currentProjectId.value = Number(id);
};

const togglePropertyCallback = (id) => {
  currentPropertyId.value = Number(id);
};

const currentCurrencyName = computed(() => {
  return currentAccount.value?.currency?.name || '';
});

watch(amount, (newExpression) => {
  if (!newExpression || newExpression.trim() === '') {
    evaluatedAmount.value = undefined;
    calculationError.value = '';
    return;
  }

  try {
    const result = evaluate(
      newExpression
        .replace(/\s+/g, '')
        .replace(/,/g, '.')
    );

    evaluatedAmount.value = Number.isFinite(result) ? result : undefined;
    calculationError.value = '';
  } catch (error) {
    console.warn('Invalid expression:', error.message);
    evaluatedAmount.value = undefined;
    calculationError.value = 'Неверное выражение';
  }
});

const onClose = () => {
  router.push(backUrl.value);
};

const onSubmit = async () => {
  if (isSubmitting.value || !token.value) return;

  if (!Number.isFinite(evaluatedAmount.value)) {
    alert(calculationError.value || 'Введите корректную величину');
    return;
  }

  isSubmitting.value = true;

  try {
    const transactionData = {
      amount: evaluatedAmount.value !== undefined
        ? evaluatedAmount.value.toString()
        : amount.value,
      isIncome: kind.value === 'income',
      date: date.value,
      description: description.value,
      accountId: currentAccount.value.id,
      categoryIds: currentCategoryIds.value,
      projectId: currentProjectId.value,
      propertyId: currentPropertyId.value,
    };

    if (isEdit.value) {
      await api.updateTransaction(token.value, {
        id: transactionId.value,
        ...transactionData,
      });
    } else {
      await api.createTransaction(token.value, transactionData);
    }

    await router.push(backUrl.value);
  } finally {
    isSubmitting.value = false;
  }
};

nextTick(() => {
  amountInputRef.value?.focus?.();
});

watch(
  [token, transactionId, copyId],
  ([newToken, newTransactionId, newCopyId]) => {
    if (newToken && (newTransactionId || newCopyId)) {
      loadItem();
    }
  },
  { immediate: true }
);
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
              {{ pageTitle }}
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
              <Label required>Величина</Label>

              <div class='input-group input-group-flat'>
                <Input
                  ref='amountInputRef'
                  v-model='amount'
                  type='text'
                  placeholder='10.2 + 3 * 6'
                  required
                  :disabled='isSubmitting'
                />

                <span class='input-group-text'>
                  {{ currentCurrencyName }}
                </span>
              </div>
            </div>

            <div class='mb-3'>
              <Label required>Дата</Label>

              <InputDate
                v-model='date'
                :disabled='isSubmitting'
              />

              <div class='mt-1'>
                <DateButtons v-model='date' />
              </div>
            </div>

            <div class='mb-3'>
              <Label>Комментарий</Label>

              <Input
                v-model='description'
                type='text'
                class='form-control'
                :disabled='isSubmitting'
              />
            </div>

            <div class='mb-3'>
              <FormAccounts
                :ids='currentAccountIds'
                @toggle-account='toggleAccountCallback'
                @loaded='isLoaded = true'
              />

              <AlertWarning
                v-if='isAccountEmpty'
                title='Невозможно создать операцию без&nbsp;счета'
                button-text='Создайте счет'
              />
            </div>

            <div class='mb-3'>
              <FormCategories
                :ids='currentCategoryIds'
                @toggle-category='toggleCategoryCallback'
              />
            </div>

            <div class='mb-3'>
              <FormProjects
                :id='currentProjectId'
                @toggle-project='toggleProjectCallback'
              />
            </div>

            <div>
              <FormProperties
                :id='currentPropertyId'
                @toggle-property='togglePropertyCallback'
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