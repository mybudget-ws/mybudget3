<script setup>
const amount = ref();
const date = ref(new Date());
const isSubmitting = ref(false);

const props = defineProps({
  expense: {
    type: Boolean,
    default: false,
  },
  income: {
    type: Boolean,
    default: false,
  },
  transfer: {
    type: Boolean,
    default: false,
  },
});

const modalId = computed(() => (`modal-${modalType.value}`));
const modalType = computed(() => {
  if (props.expense) {
    return 'expense';
  } else if (props.income) {
    return 'income';
  } else if (props.transfer) {
    return 'transfer';
  }
  return 'unknown';
});
const modalTitle = computed(() => {
  if (props.income) {
    return 'Новый доход';
  } else if (props.transfer) {
    return 'Новый перевод';
  }
  return 'Новый расход';
});

const formatDateForInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const parseDateFromInput = (value) => {
  const [year, month, day] = value.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day));
}
</script>

<template>
  <ModalBase :id='modalId'>
    <div class='modal-header'>
      <h5 class='modal-title'>{{ modalTitle }}</h5>
      <button
        type='button'
        class='btn-close'
        data-bs-dismiss='modal'
        aria-label='Close'
      />
    </div>
    <div class='modal-body'>
      <div class='mb-3'>
        <Label required>Величина, TODO: CURRENCY</Label>
        <Input
          type='text'
          placeholder='Значение или фомрула (например 10 + 3 * 2)'
          required
          :disabled='isSubmitting'
          v-model='amount'
        />
      </div>
      <div class='mb-3'>
        <Label required>Дата</Label>
        <input
          type='date'
          class='form-control'
          :value='formatDateForInput(date)'
          @input='date.value = parseDateFromInput($event.target.value)'
        />
      </div>
    </div>
    <div class='modal-footer'>
      <button type='button' class='btn-link link-secondary me-auto' data-bs-dismiss='modal'>
        Отмена
      </button>
      <button type="button" class="btn btn-primary"
        data-bs-dismiss="modal">Save changes</button>
    </div>
  </ModalBase>
</template>
