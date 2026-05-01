<script setup>
import { useAuth } from '~/composables/use_auth';

definePageMeta({
  middleware: ['authenticated']
});

const { token, isSignedIn, signOut } = useAuth();
</script>

<template>
  <div class="card">
    <div class='row g-0'>
      <ProfileMenu />
      <div class='col-sm-12 col-lg-9 col-xl-10'>
        <div class="card-body">
          <h1>Мой профиль</h1>
          <p class='text-secondary'>TODO</p>
        </div>
      </div>
    </div>
  </div>

  <Button
    v-if='isSignedIn'
    class='btn-primary mt-3'
    @click='signOut()'
  >
    Выход
  </Button>
</template>
