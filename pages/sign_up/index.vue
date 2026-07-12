<script setup>
  import api from '~/lib/api';
  import { useAuth } from '~/composables/use_auth';

  definePageMeta({
    middleware: ['authenticated']
  });

  const { signIn } = useAuth();
  const email = ref('');
  const password = ref('');
  const error = ref(null);
  const isSubmitting = ref(false);
  const isApiError = ref(false);

  const isError = computed(() => {
    return isApiError.value || error.value !== null;
  });

  const errorMessage = computed(() => {
    if (isApiError.value) {
      return 'Ошибка сервера. Попробуйте повторить операцию, или обратитесь в поддержку.';
    }
    if (error.value !== null) {
      return error.value;
    }
    return undefined;
  });

  const onSubmit = async (event) => {
    event.preventDefault();
    isSubmitting.value = true
    isApiError.value = false;
    error.value = null;

    try {
      const result = await api.registration(email.value, password.value);
      if (result && result.user && result.user.token) {
        signIn(result.user.token);
        navigateTo('/');
      } else {
        error.value = result.error;
      }
    } catch (err) {
      console.error(err);
      isApiError.value = true;
    } finally {
      isSubmitting.value = false
    }
  }
</script>

<template>
  <div class='page page-center'>
    <div class='container container-tight py-4'>
      <div class='card card-md'>
        <div class='card-body'>
          <h2 class='h2 text-center mb-4'>Регистрация</h2>
          <form autocomplete='off' @submit='onSubmit'>
            <div class='mb-3'>
              <Label required>Email</Label>
              <Input
                v-model='email'
                type='email'
                placeholder='мой@email.ru'
                required
                :disabled='isSubmitting'
                :is-error='isError'
              />
            </div>
            <div class='mb-2'>
              <Label required>Пароль</Label>
              <Input
                v-model='password'
                type='password'
                placeholder='мой пароль'
                required
                :disabled='isSubmitting'
                :is-error='isError'
                :error-text='errorMessage'
              />
            </div>
            <div class='form-footer'>
              <Button
                type='submit'
                class='btn-primary w-100'
                :loading='isSubmitting'
              >
                Создать Мой Бюджет
              </Button>
            </div>
          </form>
        </div>
        <div class='hr-text'>Уже есть аккаунт?</div>
        <div class='card-body'>
          <NuxtLink to='/sign_in' class='btn btn-4 w-100'>
            Войти
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
