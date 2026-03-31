<script setup>
  definePageMeta({
    middleware: ['authenticated']
  });

  import api from '~/lib/api';
  import { useAuth } from '~/composables/use_auth';

  const { signIn } = useAuth();
  const email = ref('');
  const password = ref('');
  const isSubmitting = ref(false);
  const authError = ref(false);
  const authErrorMessage = 'Неправильный email или пароль';

  const onSubmit = async (event) => {
    event.preventDefault();

    isSubmitting.value = true;
    authError.value = false; 

    try {
      const user = await api.login(email.value, password.value);

      if (user && user.token) {
        signIn(user.token);
        navigateTo('/');
      } else {
        authError.value = true;
      }
    } catch (err) {
      console.error(err);
      authError.value = true;
    } finally {
      isSubmitting.value = false;
    }
  };
</script>

<template>
  <div class='page page-center'>
    <div class='container container-tight py-4'>
      <div class='card card-md'>
        <div class='card-body'>
          <h2 class='h2 text-center mb-4'>
            Вход в Мой Бюджет
          </h2>
          <form @submit='onSubmit' autocomplete='off'>
            <div class='mb-3'>
              <Label required>Email</Label>
              <Input
                type='email'
                placeholder='мой@email.ru'
                required
                :disabled='isSubmitting'
                v-model='email'
                :isError='authError'
              />
            </div>
            <div class='mb-2'>
              <Label required>
                Пароль
                <span class='form-label-description'>
                  <a href='/forgot-password'>Не помню пароль</a>
                </span>
              </Label>
              <Input
                type='password'
                placeholder='мой пароль'
                required
                :disabled='isSubmitting'
                v-model='password'
                :isError='authError'
                :errorText='authErrorMessage'
              />
            </div>
            <div class='form-footer'>
              <Button
                type='submit'
                class='btn-primary w-100'
                :loading='isSubmitting'
              >
                Войти
              </Button>
            </div>
          </form>
        </div>
        <div class="hr-text">Впервые на сайте?</div>
        <div class="card-body">
          <NuxtLink to='/sign_up' class='btn btn-4 w-100'>
            Зарегистрироваться
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
