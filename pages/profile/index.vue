<script setup>
import { useAuth } from '~/composables/use_auth';
import { currenciesDisplayItems } from '~/lib/helper_ui';
import api from '~/lib/api';

definePageMeta({
  middleware: ['authenticated']
});

const { token, isSignedIn, signOut } = useAuth();
const email = ref('');
const currencies = ref([]);
const selectedCurrency = ref(null);
const isLoading = ref(true);
const isSaving = ref(false);
const saveError = ref('');
const saveSuccess = ref(false);

const onSignOut = () => {
  signOut();
  navigateTo('/');
};

let errorTimeoutId;
let successTimeoutId;

const currenciesOptions = computed(
  () => currenciesDisplayItems(currencies.value)
);

const showError = (message) => {
  saveError.value = message;

  if (errorTimeoutId) {
    clearTimeout(errorTimeoutId);
  }

  errorTimeoutId = setTimeout(() => {
    saveError.value = '';
  }, 3000);
};

const showSuccess = () => {
  saveSuccess.value = true;

  if (successTimeoutId) {
    clearTimeout(successTimeoutId);
  }

  successTimeoutId = setTimeout(() => {
    saveSuccess.value = false;
  }, 3000);
};

onBeforeUnmount(() => {
  if (errorTimeoutId) {
    clearTimeout(errorTimeoutId);
  }

  if (successTimeoutId) {
    clearTimeout(successTimeoutId);
  }
});

const onSubmit = async () => {
  saveError.value = '';
  saveSuccess.value = false;

  isSaving.value = true;

  try {
    await api.updateProfile(token.value, {
      currency: selectedCurrency.value
    });

    showSuccess();

  } catch (e) {
    console.error(e);
    showError('Не удалось сохранить изменения');
  } finally {
    isSaving.value = false;
  }
};

onMounted(async () => {
  isLoading.value = true;

  try {
    const [profile, currencyList] = await Promise.all([
      api.fetchProfile(token.value),
      api.currencies()
    ]);

    currencies.value = currencyList;
    selectedCurrency.value = profile.defaultCurrency?.name;
    email.value = profile.email;

  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class='card'>
    <div class='row g-0'>
      <ProfileMenu />
      <div class='col-sm-12 col-lg-9 col-xl-10'>
        <div class='card-body'>
          <h1>Ваш профиль</h1>
          <div v-if='isLoading' class='spinner-border' />
          <div v-else>
            <div class='row mb-3'>
              <div class='col-md-6 col-lg-4'>
                <Input
                  type='email'
                  v-model='email'
                  disabled
                />
              </div>
            </div>
            <div class='row mb-3'>
              <div class='col-md-6 col-lg-4'>
                <select v-model='selectedCurrency' class='form-select'>
                  <option disabled value="">Выберите валюту</option>
                  <option
                    v-for='c in currenciesOptions'
                    :key='c.value'
                    :value='c.value'
                  >
                    {{ c.label }}
                  </option>
                </select>

                <AlertDanger
                  v-if="saveError"
                  class="mt-2"
                  :description="saveError"
                />
                <AlertSuccess
                  v-if="saveSuccess"
                  class="mt-2"
                  description="Валюта успешно сохранена"
                />
              </div>
            </div>
            <button
              class='btn btn-primary'
              :disabled='isSaving'
              @click='onSubmit'
            >
              {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class='d-flex justify-content-end'>
    <Button
      v-if='isSignedIn'
      class='btn-outline-danger mt-3'
      @click='onSignOut'
    >
      Выход
    </Button>
  </div>
</template>
