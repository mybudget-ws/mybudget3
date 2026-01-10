<script setup>
import api from '~/lib/api';

const DEFAULT_COLOR = 'teal';
const DEFAULT_CURRENCY = 'RUB';
const DEFAULT_POSITION = 1;
const KINDS = [
  { value: 'debit', name: 'Дебетовый, наличные' },
  { value: 'credit', name: 'Кредитный' },
];

const { token } = useAuth();
const accountName = ref('');
const accountKind = ref(KINDS[0].value);
const accountCurrency = ref(DEFAULT_CURRENCY);
const accountPosition = ref(DEFAULT_POSITION);
const isSubmitting = ref(false);

const props = defineProps({
  item: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['saved', 'close']);

const isEdit = computed(() => !!props.item);

const onSubmit = async () => {
  if (isSubmitting.value || !token.value) return;

  isSubmitting.value = true
  try {
    if (isEdit.value) {
      await api.updateAccount(token.value, {
        id: props.item.id,
        name: accountName.value,
        color: props.item.color || DEFAULT_COLOR,
        currency: accountCurrency.value,
        kind: accountKind.value,
        position: parseInt(accountPosition.value),
      });
    } else {
      await api.createAccount(token.value, {
        name: accountName.value,
        color: DEFAULT_COLOR,
        currency: accountCurrency.value,
        kind: accountKind.value,
        position: parseInt(accountPosition.value),
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
    accountKind.value = val?.kind ?? KINDS[0].value;
    accountCurrency.value = val?.currency?.name ?? DEFAULT_CURRENCY;
    accountPosition.value = val?.position ?? DEFAULT_POSITION;
  },
  { immediate: true }
);
</script>

<template>
  <ModalBase id='modal-account' is-focus @close="emit('close')">
    <form @submit.prevent='onSubmit' autocomplete='off'>
      <div class='modal-header'>
        <h5 class="modal-title">
          {{ isEdit ? 'Редактирование счёта' : 'Новый счёт' }}
        </h5>
        <button class="btn-close" type="button" @click="emit('close')" />
      </div>

      <div class='modal-body'>
        <div class='mb-3'>
          <Label required>Название</Label>
          <Input
            required
            type='text'
            class='form-control'
            placeholder='Новый счёт'
            :disabled='isSubmitting'
            v-model='accountName'
          />
        </div>

        <div class='row mb-3'>
          <div class='col-lg-6 col-md-12'>
            <Label required>Валюта</Label>
            <Input
              required
              type='string'
              class='form-control'
              placeholder='Валюта счёта'
              :disabled='isSubmitting'
              v-model='accountCurrency'
            />
          </div>
          <div class='col-lg-6 col-md-12'>
            <Label required>Позиция в списке</Label>
            <Input
              required
              type='number'
              class='form-control'
              placeholder='1'
              :disabled='isSubmitting'
              v-model='accountPosition'
            />
          </div>
        </div>

        <div class='mb-3'>
          <Label>Тип счёта</Label>
          <div class='form-selectgroup form-selectgroup-boxes d-flex'>
            <label
              v-for='item in KINDS'
              :key='item.value'
              class='form-selectgroup-item'
              style='flex: 1 1 0;'
            >
              <input
                type='radio'
                name='kinds'
                value='item.value'
                class='form-selectgroup-input'
                :checked='accountKind == item.value'
                @change='accountKind = item.value'
              />
              <div class='form-selectgroup-label d-flex align-items-center'>
                <div class='me-3'>
                  <span class='form-selectgroup-check' />
                </div>
                <div>
                  {{ item.name }}
                </div>
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
