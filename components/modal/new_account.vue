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
const currencies = ref([]);
const isSubmitting = ref(false);

const props = defineProps({
  item: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['saved', 'close']);

const isEdit = computed(() => !!props.item);

onMounted(async () => {
  const items = await api.currencies();
  currencies.value = items.map(v => (
    {
      value: v.name,
      name: `${v.name} — ${v.description}`,
    }
  ));
});

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
    <form autocomplete='off' @submit.prevent='onSubmit'>
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
            v-model='accountName'
            required
            type='text'
            class='form-control'
            placeholder='Новый счёт'
            :disabled='isSubmitting'
          />
        </div>

        <div class='row mb-3'>
          <div :class="isEdit ? 'col-lg-6' : ''" class='col-md-12'>
            <Label required>Валюта</Label>
            <select
              v-model='accountCurrency'
              class='form-select'
              :disabled='isSubmitting'
              required
            >
              <option
                v-for='item in currencies'
                :key='item.value'
                :value='item.value'
              >
                {{ item.name }}
              </option>
            </select>
          </div>
          <div v-if='isEdit' class='col-lg-6 col-md-12'>
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
