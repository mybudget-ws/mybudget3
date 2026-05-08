<script setup>
import { useAuth } from '~/composables/use_auth';
import api from '~/lib/api';

definePageMeta({
  middleware: ['authenticated']
});

const { token, isSignedIn, signOut } = useAuth();
const email = ref('');
const currencies = ref([]);
const selectedCurrency = ref(null);
const isLoading = ref(true);

const onSignOut = () => {
  signOut();
  navigateTo('/');
}

onMounted(async () => {
  isLoading.value = true;
  try {
    // const profile = await api.fetchProfile(token.value);
    // const currencyList = await api.currencies();
    const [profile, currencyList] = await Promise.all([
      api.fetchProfile(token.value),
      api.currencies()
    ]);
    currencies.value = currencyList.map(c => ({
      value: c.id,
      label: `${c.name} — ${c.description}`
    }));
    selectedCurrency.value = profile.defaultCurrency?.id;
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
                    v-for='c in currencies'
                    :key='c.value'
                    :value='c.value'
                  >
                    {{ c.label }}
                  </option>
                </select>
              </div>
            </div>
            <button class='btn btn-primary'>
              Сохранить
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
