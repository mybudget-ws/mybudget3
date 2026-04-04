<script setup>
import api from '~/lib/api';

const DEFAULT_COLOR = 'teal';
const DEFAULT_CURRENCY = 'RUB';
const DEFAULT_POSITION = 1;
const KINDS = [
  { value: 'realty', name: 'Недвижимость' },
  { value: 'transport', name: 'Транспорт' },
  { value: 'other', name: 'Другое' }
];

const { token } = useAuth();
const propertyName = ref('');
const propertyKind = ref(KINDS[0].value);
const propertyCurrency = ref(DEFAULT_CURRENCY);
const propertyPosition = ref(DEFAULT_POSITION);
const propertyAmount = ref('0');
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
      await api.updateProperty(token.value, {
        id: props.item.id,
        name: propertyName.value,
        color: props.item.color || DEFAULT_COLOR,
        kind: propertyKind.value,
        currency: propertyCurrency.value,
        amount: propertyAmount.value,
        position: parseInt(propertyPosition.value),
      });
    } else {
      await api.createProperty(token.value, {
        name: propertyName.value,
        color: DEFAULT_COLOR,
        kind: propertyKind.value,
        currency: propertyCurrency.value,
        amount: propertyAmount.value,
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
    propertyName.value = val?.name ?? '';
    propertyKind.value = val?.kind ?? KINDS[0].value;
    propertyAmount.value = val?.amount?.toString() ?? '0';
    propertyCurrency.value = val?.currency?.name ?? DEFAULT_CURRENCY;
    propertyPosition.value = val?.position ?? DEFAULT_POSITION;
  },
  { immediate: true }
);
</script>

<template>
  <ModalBase id='modal-property' is-focus @close="emit('close')">
    <form autocomplete='off' @submit.prevent='onSubmit'>
      <div class='modal-header'>
        <h5 class="modal-title">
          {{ isEdit ? 'Редактирование имущества' : 'Новое имущество' }}
        </h5>
        <button class='btn-close' type='button' @click="emit('close')" />
      </div>

      <div class='modal-body'>
        <div class='mb-3'>
          <Label required>Название</Label>
          <Input
            v-model='propertyName'
            required
            type='text'
            class='form-control'
            placeholder='Название имущества'
            :disabled='isSubmitting'
          />
        </div>

        <div class='row mb-3'>
          <div :class="isEdit ? 'col-lg-4' : 'col-lg-6'" class='col-md-12'>
            <Label required>Текущая стоимость</Label>
            <div class='input-group input-group-flat'>
              <Input
                v-model='propertyAmount'
                required
                type='string'
                class='form-control'
                placeholder='0'
                :disabled='isSubmitting'
              />
              <span class='input-group-text'>{{ propertyCurrency }}</span>
            </div>
          </div>
          <div :class="isEdit ? 'col-lg-4' : 'col-lg-6'" class='col-md-12'>
            <Label required>Валюта</Label>
            <Input
              v-model='propertyCurrency'
              required
              type='string'
              class='form-control'
              placeholder='Валюта счёта'
              :disabled='isSubmitting'
            />
          </div>
          <div v-if='isEdit' class='col-lg-4 col-md-12'>
            <Label required>Позиция в списке</Label>
            <Input
              v-model='propertyPosition'
              required
              type='number'
              class='form-control'
              placeholder='1'
              :disabled='isSubmitting'
            />
          </div>
        </div>

        <div class='mb-3'>
          <Label required>Тип</Label>
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
                class='form-selectgroup-input'
                :value='kind.value'
                :checked='propertyKind == kind.value'
                @change='propertyKind = kind.value'
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
