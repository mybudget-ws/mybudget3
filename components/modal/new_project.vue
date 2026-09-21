<script setup>
import api from '~/lib/api';

const DEFAULT_POSITION = 1;

const { token } = useAuth();

const projectName = ref('');
const projectPosition = ref(DEFAULT_POSITION);
const isSubmitting = ref(false);
const projectBudget = ref(null);
const projectBudgetCurrency = ref(null);
const currencies = ref([]);

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

  isSubmitting.value = true;
  try {
    if (isEdit.value) {
      await api.updateProject(token.value, {
        id: props.item.id,
        name: projectName.value,
        position: projectPosition.value,
        budget: projectBudget.value ? Number(projectBudget.value) : null,
        budgetCurrencyId: projectBudgetCurrency.value,
      });
    } else {
      await api.createProject(token.value, {
        name: projectName.value,
        position: projectPosition.value,
        budget: projectBudget.value ? Number(projectBudget.value) : null,
        budgetCurrencyId: projectBudgetCurrency.value,
      });
    }

    emit('saved');
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(async () => {
  currencies.value = await api.currencies();

  if (!isEdit.value && !projectBudgetCurrency.value) {
    projectBudgetCurrency.value = currencies.value.find(
      currency => currency.name === 'RUB'
    )?.id ?? null;
  }
});

watch(
  () => props.item,
  (val) => {
    projectName.value = val?.name ?? '';
    projectPosition.value = val?.position ?? DEFAULT_POSITION;
    projectBudget.value = val?.budget ?? null;
    projectBudgetCurrency.value = val?.budgetCurrency?.id ?? null;
  },
  { immediate: true }
);
</script>

<template>
  <ModalBase id='modal-category' is-focus @close='emit("close")'>
    <form autocomplete='off' @submit.prevent='onSubmit'>
      <div class='modal-header'>
        <h5 class='modal-title'>
          {{ isEdit ? 'Редактирование проекта' : 'Новый проект' }}
        </h5>
        <button class='btn-close' type='button' @click='emit("close")' />
      </div>

      <div class='modal-body'>
        <div class='row'>
          <div class='col-md-12 col-lg-6 mb-3'>
            <Label required>Название</Label>
            <Input
              v-model='projectName'
              required
              type='text'
              class='form-control'
              placeholder='Новый проект'
              :disabled='isSubmitting'
            />
          </div>
          <div class='col-md-12 col-lg-6 mb-3'>
            <Label required>Позиция в списке</Label>
            <Input
              v-model='projectPosition'
              required
              type='number'
              class='form-control'
              placeholder='1'
              :disabled='isSubmitting'
            />
          </div>
        </div>
        <div class='row'>
          <div class='col-md-12 col-lg-6 mb-3'>
            <Label>Бюджет</Label>
            <div class='input-group input-group-flat'>
              <Input
                v-model='projectBudget'
                type='text'
                placeholder='опционально'
                :disabled='isSubmitting'
              />
            </div>
          </div>

          <div class='col-md-12 col-lg-6 mb-3'>
            <Label>Валюта бюджета</Label>
            <select
              v-model='projectBudgetCurrency'
              class='form-select'
              :disabled='isSubmitting'
            >
              <option disabled value=''>Выберите валюту</option>
              <option
                v-for='currency in currencies'
                :key='currency.id'
                :value='currency.id'
              >
                {{ currency.displayName }} — {{ currency.description }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class='modal-footer'>
        <button class='btn-link link-secondary me-auto' type='button' @click='emit("close")'>
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
