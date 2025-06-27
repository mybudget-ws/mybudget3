<script setup>
  import { useAuth } from '~/composables/use_auth';
  const { token, isSignedIn, signOut } = useAuth();

  const exit = () => {
    signOut();
    navigateTo('/');
  };
</script>

<template>
  <div>
    <h1>Мой профиль</h1>
    <h2>Is signed in:</h2>
    <div>{{ isSignedIn }}</div>
    <h2>Token:</h2>
    <div>{{ token }}</div>

    <Button
      class='btn-primary'
      @click='exit'
    >
      Выход
    </Button>
  </div>
</template>
