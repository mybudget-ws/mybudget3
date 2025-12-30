<script setup>
import api from '~/lib/api';
import { Modal } from '@tabler/core/dist/js/tabler.min.js'

const { token } = useAuth();

const categoryName = ref('');
const isSubmitting = ref(false);
const itemEventTicks = ref(1);

const props = defineProps({
  expense: {
    type: Boolean,
    default: false,
  },
  income: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['newCategory'])

const modalId = computed(() => (`modal-${modalType.value}`));
const modalType = computed(() => {
  if (props.expense) {
    return 'expense';
  } else if (props.income) {
    return 'income';
  }
  return 'unknown';
});
const modalTitle = computed(() => {
  return props.income ? 'Новый доход' : 'Новый расход';
});
const isDisabledInput = computed(() => (
  isSubmitting.value || !token.value
));

const handleModalShown = () => {
  const modalElement = document.getElementById(modalId.value);
  const firstInput = modalElement.querySelector('input[type="text"]:not([type="hidden"])');
  if (firstInput) {
    firstInput.focus();
  }
};

onMounted(() => {
  const modalElement = document.getElementById(modalId.value);
  if (modalElement) {
    modalElement.addEventListener('shown.bs.modal', handleModalShown);
  }
});

onUnmounted(() => {
  const modalElement = document.getElementById(modalId.value);
  if (modalElement) {
    modalElement.removeEventListener('shown.bs.modal', handleModalShown);
  }
});

const onSubmit = async (event) => {
  event.preventDefault();
  isSubmitting.value = true;

  const result = await api.createCategory(
    token.value,
    {
      name: categoryName.value,
      color: 'white'
    }
  );
  isSubmitting.value = false;
  if (result) {
    document
      .querySelector(`#${modalId.value} .btn-close`)
      .dispatchEvent(new Event('click'));
    categoryName.value = '';
    itemEventTicks.value++;
    emit('newCategory');
  }
};

const onCloseCallback = () => {
  categoryName.value = '';
}
</script>

<template>
  <ModalBase :id='modalId'>
    <form @submit='onSubmit' autocomplete='off' >
      <div class='modal-header'>
        <h5 class='modal-title'>{{ modalTitle }}</h5>
        <button
          type='button'
          class='btn-close'
          data-bs-dismiss='modal'
          aria-label='Close'
          @click='onCloseCallback'
        />
      </div>
      <div class='modal-body'>
        <div class='mb-3'>
          <Label required>Название</Label>
          <Input
            required
            type='text'
            class='form-control'
            :disabled='isDisabledInput'
            v-model='categoryName'
          />
        </div>
      </div>
      <div class='modal-footer'>
        <!-- btn btn-outline-secondary -->
        <button type='button' class='btn-link link-secondary me-auto' data-bs-dismiss='modal'>
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
