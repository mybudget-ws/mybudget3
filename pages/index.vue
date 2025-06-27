<script setup>
  import { useAuth } from '~/composables/use_auth';
  const { isSignedIn } = useAuth();
</script>

<template>
  <div>
    <div v-if='!isSignedIn' class='hero'>
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
          <NuxtLink to='/sign_up' class='btn btn-primary'>
            Регистрация
          </NuxtLink>
        </div>
        <div class='col-auto'>
          <NuxtLink to='/sign_in' class='btn btn-4'>
            Вход
          </NuxtLink>
        </div>
      </div>
    </div>

    <div v-if='isSignedIn' class='dashboard'>
      <div>TODO: Dashboard</div>
    </div>
  </div>
</template>
