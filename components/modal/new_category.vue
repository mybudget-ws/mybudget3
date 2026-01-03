<script setup>
import api from '~/lib/api';

const { token } = useAuth();
const categoryName = ref('');
const isSubmitting = ref(false);
const itemEventTicks = ref(1);

const props = defineProps({
  item: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['newItem'])
const modalId = computed(() => ('modal-category'));
const modalTitle = computed(() => {
  return props.item ?
    'Редактирование категории' :
    'Новая категория';
});

const isDisabledInput = computed(() => (
  isSubmitting.value || !token.value
));

const onSubmit = async (event) => {
  event.preventDefault();
  isSubmitting.value = true;

  const result = await api.createCategory(
    token.value,
    {
      name: categoryName.value,
      color: 'blue'
    }
  );
  isSubmitting.value = false;
  if (result) {
    document
      .querySelector(`#${modalId.value} .btn-close`)
      .dispatchEvent(new Event('click'));
    onCloseCallback();
    itemEventTicks.value++;
    emit('newItem');
  }
};

const onCloseCallback = () => {
  categoryName.value = '';
}
</script>

<template>
  <ModalBase :id='modalId' is-focus>
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
