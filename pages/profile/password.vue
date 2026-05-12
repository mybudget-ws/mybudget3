<script setup>
import api from '~/lib/api';
import { useAuth } from '~/composables/use_auth';
import {
  IconCheck,
  IconAlertCircle,
} from '@tabler/icons-vue';

const { token } = useAuth();

definePageMeta({
  middleware: ['authenticated']
});

const password = ref('');
const newPassword = ref('');

const isSaving = ref(false);
const saveError = ref('');
const saveSuccess = ref(false);

const onSubmit = async () => {
  saveError.value = '';
  saveSuccess.value = false;

  if (newPassword.value.length < 6) {
    saveError.value = 'Пароль должен содержать минимум 6 символов';
    return;
  }

  isSaving.value = true;

  try {
  const result = await api.updatePassword(token.value, {
    password: password.value,
    newPassword: newPassword.value,
  });

  if (!result) {
    saveError.value = 'Неверный текущий пароль';
    return;
  }

  password.value = '';
  newPassword.value = '';

  saveSuccess.value = true;
} catch (error) {
  saveError.value = error?.message || 'Не удалось обновить пароль';
} finally {
  isSaving.value = false;
}
};
</script>

<template>
  <div class="card">
    <div class="row g-0">
      <ProfileMenu />
      <div class="col-sm-12 col-lg-9 col-xl-10">
        <div class="card-body">
          <h1>Изменить пароль</h1>
          <form class="row g-3 col-12 col-md-8 col-lg-6" @submit.prevent="onSubmit">
            <div class="col-12">
              <input
                v-model="password"
                type="password"
                class="form-control"
                placeholder="Текущий пароль"
                required
              >
            </div>
            <div class="col-12">
              <input
                v-model="newPassword"
                type="password"
                class="form-control"
                placeholder="Новый пароль"
                minlength="6"
                required
              >
              <div class="form-hint fs-5 mt-1">
                Минимум 6 символов
              </div>
            </div>
            <div class="col-12">
              <div v-if="saveError" class="alert alert-danger">
                <IconAlertCircle :size="20" class="text-danger" />
                {{ saveError }}
              </div>
              <div v-if="saveSuccess" class="alert alert-success">
                <IconCheck :size="20" class="text-success" />
                <span>Пароль успешно обновлён</span>
              </div>
            </div>
            <div class="col-12">
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="isSaving"
              >
                <span
                  v-if="isSaving"
                  class="spinner-border spinner-border-sm me-2"
                />
                Сохранить
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
