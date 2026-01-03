<script setup>
import api from '~/lib/api';

const { token } = useAuth();
const categoryName = ref('');
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
  if (!token.value) return;

  isSubmitting.value = true
  try {
    if (isEdit.value) {
      await api.updateCategory(token.value, {
        id: props.item.id,
        name: categoryName.value,
        color: 'blue',
      });
    } else {
      await api.createCategory(token.value, {
        name: categoryName.value,
        color: 'blue',
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
    categoryName.value = val?.name ?? ''
  },
  { immediate: true }
)
</script>

<template>
  <ModalBase id='modal-category' is-focus @close="emit('close')">
    <form @submit.prevent='onSubmit' autocomplete='off'>
      <div class='modal-header'>
        <h5 class="modal-title">
          {{ isEdit ? 'Редактирование категории' : 'Новая категория' }}
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
            :disabled='isSubmitting'
            v-model='categoryName'
          />
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
