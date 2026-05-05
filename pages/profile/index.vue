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
          <h1>Ваш профиль</h1>
          <div class="col-4">
            <div class="mb-3">
              <input
                type="email"
                class="form-control"
                placeholder="E-mail"
              >
            </div>
          </div>
          <button type="submit" class="btn btn-primary">Сохранить</button>
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
