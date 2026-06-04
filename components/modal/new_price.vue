<script setup>
import api from '~/lib/api';

const { token } = useAuth();

const props = defineProps({
  property: {
    type: Object,
    required: true,
  },

  item: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['saved', 'close']);

const isEdit = computed(() => !!props.item);

const amount = ref('');
const date = ref('');
const comment = ref('');

const isSubmitting = ref(false);

const onSubmit = async () => {
  if (!token.value) {
    return;
  }

  try {
    isSubmitting.value = true;

    if (isEdit.value) {
      await api.updatePropertyPrice(token.value, {
        propertyId: props.property.id,
        id: props.item.id,

        amount: String(amount.value),
        date: date.value,
        description: comment.value,
      });
    } else {
      await api.createPropertyPrice(token.value, {
        propertyId: props.property.id,

        amount: String(amount.value),
        date: date.value,
        description: comment.value,
      });
    }

    emit('saved');
  } finally {
    isSubmitting.value = false;
  }
};

watch(
  () => props.item,
  (val) => {
    amount.value = val?.amount ?? '';
    comment.value = val?.description ?? '';

    date.value =
      val?.date?.slice(0, 10) ??
      new Date().toISOString().slice(0, 10);
  },
  { immediate: true },
);
</script>

<template>
  <ModalBase
    id="modal-property-price"
    is-focus
    @close="emit('close')"
  >
    <form
      autocomplete="off"
      @submit.prevent="onSubmit"
    >
      <div class="modal-header">
        <h5 class="modal-title">
          {{ isEdit ? 'Редактирование цены' : 'Новая цена' }}
        </h5>

        <button
          type="button"
          class="btn-close"
          @click="emit('close')"
        />
      </div>

      <div class="modal-body">
        <div class="row">
          <div class="col-12 mb-3">
            <Label required>
              Величина
            </Label>

            <Input
              v-model="amount"
              required
              type="number"
              class="form-control"
              :disabled="isSubmitting"
            />
          </div>

          <div class="col-12 mb-3">
            <Label required>
              Дата
            </Label>

            <Input
              v-model="date"
              required
              type="date"
              class="form-control"
              :disabled="isSubmitting"
            />
          </div>

          <div class="col-12">
            <Label>
              Комментарий
            </Label>

            <textarea
              v-model="comment"
              rows="4"
              class="form-control"
              placeholder="Комментарий..."
              :disabled="isSubmitting"
            />
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button
          type="button"
          class="btn-link link-secondary me-auto"
          @click="emit('close')"
        >
          Отмена
        </button>

        <Button
          type="submit"
          class="btn-primary"
          :loading="isSubmitting"
          :disabled="!token"
        >
          {{ isEdit ? 'Сохранить' : 'Создать' }}
        </Button>
      </div>
    </form>
  </ModalBase>
</template>