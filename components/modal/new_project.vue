<script setup>
import api from '~/lib/api';

const DEFAULT_POSITION = 1;

const { token } = useAuth();
const projectName = ref('');
const projectPosition = ref(DEFAULT_POSITION);
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
      await api.updateProject(token.value, {
        id: props.item.id,
        name: projectName.value,
        position: parseInt(projectPosition.value),
      });
    } else {
      await api.createProject(token.value, {
        name: projectName.value,
        position: parseInt(projectPosition.value),
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
    projectName.value = val?.name ?? '';
    projectPosition.value = val?.position ?? DEFAULT_POSITION;
  },
  { immediate: true }
)
</script>

<template>
  <ModalBase id='modal-category' is-focus @close="emit('close')">
    <form @submit.prevent='onSubmit' autocomplete='off'>
      <div class='modal-header'>
        <h5 class="modal-title">
          {{ isEdit ? 'Редактирование проекта' : 'Новый проект' }}
        </h5>
        <button class="btn-close" type="button" @click="emit('close')" />
      </div>

      <div class='modal-body'>
        <div class='row'>
          <div class='col-md-12 col-lg-6 mb-3'>
            <Label required>Название</Label>
            <Input
              required
              type='text'
              class='form-control'
              placeholder='Новый проект'
              :disabled='isSubmitting'
              v-model='projectName'
            />
          </div>
          <div class='col-md-12 col-lg-6 mb-3'>
            <Label required>Позиция в списке</Label>
            <Input
              required
              type='number'
              class='form-control'
              placeholder='1'
              :disabled='isSubmitting'
              v-model='projectPosition'
            />
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
