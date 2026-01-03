<script setup>
import api from '~/lib/api';

const { token } = useAuth();
const accountName = ref('');
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
      await api.updateAccount(token.value, {
        id: props.item.id,
        name: accountName.value,
        color: 'blue',
      });
    } else {
      await api.createAccount(token.value, {
        name: accountName.value,
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
    accountName.value = val?.name ?? ''
  },
  { immediate: true }
)
</script>

<template>
  <ModalBase id='modal-category' is-focus @close="emit('close')">
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
