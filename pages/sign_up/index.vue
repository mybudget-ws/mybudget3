<script setup>
</script>

<template>
  <div class='page page-center'>
    <div class='container container-tight py-4'>
      <div class='card card-md'>
        <div class='card-body'>
          <h2 class='h2 text-center mb-4'>Регистрация</h2>
          <form action='./' method='get' autocomplete='off'>
            <div class='mb-3'>
              <Label required>Email</Label>
              <input
                type='email'
                class='form-control'
                placeholder='мой@email.ru'
                autocomplete='off'
                required
              >
            </div>
            <div class='mb-2'>
              <Label required>Пароль</Label>
              <div class='input-group input-group-flat'>
                <input
                  type='password'
                  class='form-control'
                  placeholder='мой пароль'
                  autocomplete='off'
                  required
                >
              </div>
            </div>
            <div class='form-footer'>
              <button
                type='submit'
                class='btn btn-primary w-100'
              >
                Создать Мой Бюджет
              </button>
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
