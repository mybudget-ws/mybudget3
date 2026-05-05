<script setup>
import { useAuth } from '~/composables/use_auth';

definePageMeta({
  middleware: ['authenticated']
});

const { token, isSignedIn, signOut } = useAuth();
const email = ref('');

const onSignOut = () => {
  signOut();
  navigateTo('/');
}
</script>

<template>
  <div class="card">
    <div class='row g-0'>
      <ProfileMenu />
      <div class='col-sm-12 col-lg-9 col-xl-10'>
        <div class="card-body">
          <h1>Ваш профиль</h1>
          <div class='row mb-3'>
            <div class='col-sm-12 col-md-6 col-lg-6 col-xl-4'>
              <Input
                type='email'
                placeholder='мой@email.ru'
                v-model='email'
                :disabled=true
              />
            </div>
          </div>
          <button type="submit" class="btn btn-primary">Сохранить</button>
        </div>
      </div>
    </div>
  </div>

  <div class='d-flex justify-content-end'>
    <Button
      v-if='isSignedIn'
      class='btn-outline-danger  mt-3'
      @click='onSignOut()'
    >
      Выход
    </Button>
  </div>
</template>
