<script setup>
</script>

<template>
  <div class='page page-center'>
    <div class='container container-tight py-4'>
      <div class='card card-md'>
        <div class='card-body'>
          <h2 class='h2 text-center mb-4'>Вход в Мой Бюджет</h2>
          <form action="./" method="get" autocomplete="off" novalidate="">
            <div class='mb-3'>
              <label class='form-label'>Email</label>
              <input
                type='email'
                class='form-control'
                placeholder='мой@email.ru'
                autocomplete='off'
              >
            </div>
            <div class="mb-2">
              <label class="form-label">
                Пароль
                <span class='form-label-description'>
                  <a href='/forgot-password'>Не помню пароль</a>
                </span>
              </label>
              <div class='input-group input-group-flat'>
                <input
                  type='password'
                  class='form-control'
                  placeholder='мой пароль'
                  autocomplete='off'
                >
              </div>
            </div>
            <div class='form-footer'>
              <button type='submit' class='btn btn-primary w-100'>Войти</button>
            </div>
          </form>
        </div>
        <div class="hr-text">Впервые на сайте?</div>
        <div class="card-body">
          <a href="#" class="btn btn-4 w-100">
            Зарегистрироваться
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
