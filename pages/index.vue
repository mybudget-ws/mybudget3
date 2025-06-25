<template>
  <div>
    <h1 class='display-4 fw-medium'>Домашняя бухгалтерия</h1>
    <h2 class='display-6 fw-normal text-secondary'>Инструмент для учета повседневных доходов и расходов</h2>
    <div class='row mb-4'>
      <div class='col'>
        <span class='badge bg-orange text-orange-fg me-1'>Версия III</span>
        <span class='badge bg-green text-green-fg'>В разработке</span>
      </div>
    </div>
    <div class='row'>
      <div class='col-auto'>
        <NuxtLink class='btn btn-primary' to='/sign_up'>
          Регистрация
        </NuxtLink>
      </div>
      <div class='col-auto'>
        <NuxtLink class='btn btn-4' to='/sign_in'>
          Вход
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
