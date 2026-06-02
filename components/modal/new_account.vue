<script setup>
import api from '~/lib/api';
import { useAuth } from '~/composables/use_auth';
import { currenciesDisplayItems } from '~/lib/helper_ui';
import {
  DEFAULT_CURRENCY,
  DEFAULT_COLOR,
} from '~/lib/consts';

const { token } = useAuth();

const DEFAULT_POSITION = 1;
const KINDS = [
  { value: 'debit', name: 'Дебетовый, наличные' },
  { value: 'credit', name: 'Кредитный' },
];
const accountName = ref('');
const accountKind = ref(KINDS[0].value);
const accountCurrency = ref(DEFAULT_CURRENCY);
const accountPosition = ref(DEFAULT_POSITION);
const accountDescription = ref('');
const currencies = ref([]);
const isSubmitting = ref(false);
const profileCurrency = ref(null);

const props = defineProps({
  item: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['saved', 'close']);

const isEdit = computed(() => !!props.item);

const currenciesOptions = computed(
  () => currenciesDisplayItems(currencies.value)
);

onMounted(async () => {
  const [items, profile] = await Promise.all([
    api.currencies(),
    api.fetchProfile(token.value).catch(() => null)
  ]);

  currencies.value = items;
  profileCurrency.value = profile?.defaultCurrency?.name ?? null;
});

const onSubmit = async () => {
  if (isSubmitting.value || !token.value) return;

  isSubmitting.value = true
  try {
    if (isEdit.value) {
      await api.updateAccount(token.value, {
        id: props.item.id,
        name: accountName.value,
        description: accountDescription.value,
        color: props.item.color || DEFAULT_COLOR,
        currency: accountCurrency.value,
        kind: accountKind.value,
        position: Number(accountPosition.value) || DEFAULT_POSITION,
      });
    } else {
      await api.createAccount(token.value, {
        name: accountName.value,
        description: accountDescription.value,
        color: DEFAULT_COLOR,
        currency: accountCurrency.value,
        kind: accountKind.value,
        position: Number(accountPosition.value) || DEFAULT_POSITION,
      });
    }

    emit('saved');
  } finally {
    isSubmitting.value = false
  }
};

watch(
  () => props.item,
  (val) => {
    accountName.value = val?.name ?? '';
    accountDescription.value = val?.description ?? '';
    accountKind.value = val?.kind ?? KINDS[0].value;
    accountPosition.value = val?.position ?? DEFAULT_POSITION;

    if (val) {
      accountCurrency.value = val?.currency?.name ?? DEFAULT_CURRENCY;
    } else {
      accountCurrency.value = profileCurrency.value ?? DEFAULT_CURRENCY;
    }
  },
  { immediate: true }
);

watch(profileCurrency, (val) => {
  if (!isEdit.value && val) {
    accountCurrency.value = val;
  }
});
</script>

<template>
  <ModalBase id='modal-account' is-focus @close="emit('close')">
    <form autocomplete='off' @submit.prevent='onSubmit'>
      <div class='modal-header'>
        <h5 class="modal-title">
          {{ isEdit ? 'Редактирование счёта' : 'Новый счёт' }}
        </h5>
        <button class="btn-close" type="button" @click="emit('close')" />
      </div>

      <div class='modal-body'>
        <div class='row mb-3'>
          <div class='col-md-6'>
            <Label required>Название</Label>
            <Input
              v-model='accountName'
              required
              type='text'
              class='form-control'
              placeholder='Новый счёт'
              :disabled='isSubmitting'
            />
          </div>

          <div class='col-md-6'>
            <Label>Описание</Label>
            <Input
              v-model='accountDescription'
              type='text'
              class='form-control'
              placeholder='Описание счёта'
              :disabled='isSubmitting'
            />
          </div>
        </div>
        <div class='row mb-3'>
          <div class='col-md-6'>
            <Label required>Валюта</Label>
            <select
              v-model='accountCurrency'
              class='form-select'
              :disabled='isSubmitting'
              required
            >
              <option
                v-for='c in currenciesOptions'
                :key='c.value'
                :value='c.value'
              >
                {{ c.label }}
              </option>
            </select>
          </div>
          <div class='col-md-6'>
            <Label required>Позиция в списке</Label>
            <Input
              v-model='accountPosition'
              required
              type='number'
              class='form-control'
              placeholder='1'
              :disabled='isSubmitting'
            />
          </div>
        </div>
        <div class='mb-3'>
          <Label>Тип счёта</Label>
          <div class='form-selectgroup form-selectgroup-boxes d-flex'>
            <label
              v-for='kind in KINDS'
              :key='kind.value'
              class='form-selectgroup-item'
              style='flex: 1 1 0;'
            >
              <input
                type='radio'
                name='kinds'
                :value='kind.value'
                class='form-selectgroup-input'
                :checked='accountKind == kind.value'
                @change='accountKind = kind.value'
              >
              <div class='form-selectgroup-label d-flex align-items-center'>
                <div class='me-3'>
                  <span class='form-selectgroup-check' />
                </div>
                <div>{{ kind.name }}</div>
              </div>
            </label>
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
