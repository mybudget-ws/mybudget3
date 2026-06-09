<script setup>
import api from '~/lib/api';
import { evaluate } from 'mathjs';
import { nextTick } from 'vue';

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
  propertyId: {
    type: Number,
    default: undefined,
  },
});

const emit = defineEmits(['saved', 'close', 'accountNew']);

const isEdit = computed(() => !!props.item && !props.isCopy);
const isAccountEmpty = computed(() => {
  if (!isLoaded.value) return false;
  return !currentAccount.value?.id;
});
const isSubmitDisabled = computed(() => !token || !isLoaded.value || isAccountEmpty.value);
const modalTitle = computed(() => {
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

const toggleProjectCallback = (id) => currentProjectId.value = Number(id);
const togglePropertyCallback = (id) => currentPropertyId.value = Number(id);

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

watch(
  () => props.item,
  (val) => {
    amount.value = val?.amount?.toString() ?? '';
    const parsedAmount = parseFloat(amount.value);
    if (!isNaN(parsedAmount) && parsedAmount < 0) {
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
    currentCategoryIds.value = val?.categories?.length > 0 ?
      val.categories.map(v => v.id) :
      [];

    if (props.item) {
      currentProjectId.value = val?.project?.id;
      currentPropertyId.value = val?.property?.id;
    }
    if (props.isCopy) {
      nextTick(() => {
        if (amountInputRef.value?.selectAll) {
          amountInputRef.value.selectAll();
        }
      });
    }
  },
  { immediate: true }
);

watch(
  () => [props.propertyId, props.item],
  ([id, item]) => {
    if (item?.property?.id) {
      currentPropertyId.value = item.property.id;
    } else if (id) {
      currentPropertyId.value = id;
    }
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
        projectId: currentProjectId.value,
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
        projectId: currentProjectId.value,
        propertyId: currentPropertyId.value,
      });
    }

    currentAccount.value = undefined;
    currentAccountIds.value = [];
    currentCategoryIds.value = [];
    currentProjectId.value = undefined;
    currentPropertyId.value = undefined;
    emit('saved');
  } finally {
    isSubmitting.value = false
  }
};
</script>

<template>
  <ModalBase id='modal-transaction' is-focus @close='emit("close")'>
    <form autocomplete='off' @submit.prevent='onSubmit'>
      <div class='modal-header'>
        <h5 class='modal-title'>{{ modalTitle }}</h5>
        <button class='btn-close' type='button' @click='emit("close")' />
      </div>

      <div class='modal-body'>
        <div class='row mb-3'>
          <div class='col'>
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
            v-model='description'
            type='text'
            class='form-control'
            :disabled='isSubmitting'
          />
        </div>

        <div class='row'>
          <div class='col'>
            <FormAccounts
              :ids='currentAccountIds'
              @toggle-account='toggleAccountCallback'
              @loaded='isLoaded = true'
            />
            <AlertWarning
              v-if='isAccountEmpty'
              title='Невозможно создать операцию без&nbsp;счета'
              button-text='Создайте счет'
              @action='emit("accountNew")'
            />
          </div>
          <div class='col'>
            <FormCategories
              :ids='currentCategoryIds'
              @toggle-category='toggleCategoryCallback'
            />
          </div>
        </div>
        <div class='row'>
          <div class='col'>
            <FormProjects
              :id='currentProjectId'
              @toggle-project='toggleProjectCallback'
            />
          </div>
          <div class='col'>
            <FormProperties
              :id='currentPropertyId'
              @toggle-property='togglePropertyCallback'
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
