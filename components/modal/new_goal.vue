<script setup>
import api from '~/lib/api';

const DEFAULT_POSITION = 1;

const { token } = useAuth();
const goalName = ref('');
const goalAmount = ref('');
const goalDate = ref(new Date());
const goalAccountIds = ref([]);
const goalPosition = ref(DEFAULT_POSITION);
const isSubmitting = ref(false);

const props = defineProps({
  item: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['saved', 'close']);
const isEdit = computed(() => !!props.item);

const toggleAccountCallback = (accountIds) => {
  goalAccountIds.value = [...accountsIds];
}

const onSubmit = async () => {
  if (!token.value) return;

  isSubmitting.value = true
  try {
    if (isEdit.value) {
      await api.updateGoal(token.value, {
        id: props.item.id,
        name: goalName.value,
        amount: (goalAmount.value || '').toString(),
        dueDateOn: goalDate.value,
        accountIds: goalAccountIds.value,
        position: parseInt(goalPosition.value),
      });
    } else {
      await api.createGoal(token.value, {
        name: goalName.value,
        amount: (goalAmount.value || '').toString(),
        dueDateOn: goalDate.value,
        accountIds: goalAccountIds.value,
        position: parseInt(goalPosition.value),
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
    goalName.value = val?.name ?? '';
    goalAmount.value = val?.amount ?? '';
    goalDate.value = val?.dueDateOn ?? new Date();
    goalAccountIds.value = val?.accountIds ?? [];
    goalPosition.value = val?.position ?? DEFAULT_POSITION;
  },
  { immediate: true }
)
</script>

<template>
  <ModalBase id='modal-goal' is-focus @close="emit('close')">
    <form @submit.prevent='onSubmit' autocomplete='off'>
      <div class='modal-header'>
        <h5 class="modal-title">
          {{ isEdit ? 'Редактирование цели' : 'Новая цель' }}
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
              placeholder='Новая цель'
              :disabled='isSubmitting'
              v-model='goalName'
            />
          </div>
          <div class='col-md-12 col-lg-6 mb-3'>
            <Label required>Дата</Label>
            <InputDate
              :disabled='isSubmitting'
              v-model='goalDate'
            />
          </div>
        </div>

        <div class='row'>
          <div class='col-md-12 col-lg-6 mb-3'>
            <Label required>Величина</Label>
            <Input
              required
              type='number'
              class='form-control'
              placeholder='Нужно накопить'
              :disabled='isSubmitting'
              v-model='goalAmount'
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
              v-model='goalPosition'
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
