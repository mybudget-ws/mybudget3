<script setup>
import api from '~/lib/api'
import { useAuth } from '~/composables/use_auth'
import {
  IconCheck,
  IconAlertCircle,
} from '@tabler/icons-vue';

definePageMeta({
  middleware: ['authenticated']
})

const { token } = useAuth()
const currentEmail = ref('')
const newEmail = ref('')
const password = ref('')
const isSaving = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)
const isLoading = ref(false)

const onSubmit = async () => {
  saveError.value = ''
  saveSuccess.value = false
  const normalizedNewEmail = newEmail.value.trim()

  if (!normalizedNewEmail) {
    saveError.value = 'Введите новый E-mail'
    return
  }
  if (!password.value) {
    saveError.value = 'Введите пароль'
    return
  }
  if (normalizedNewEmail === currentEmail.value) {
    saveError.value = 'Новый E-mail должен отличаться от текущего'
    return
  }
  if (!newEmail.value || !password.value) {
    saveError.value = 'Заполните все поля'
    return
  }

  isSaving.value = true

  try {
    const result = await api.updateEmail(token.value, {
      password: password.value,
      newEmail: normalizedNewEmail,
    })

    if (!result) {
      saveError.value = 'Не удалось изменить e-mail'
      return
    }

    if (result.error) {
      saveError.value = result.error
      return
    }

    if (result.user?.email) {
      currentEmail.value = result.user.email
    }

    newEmail.value = ''
    password.value = ''

    saveSuccess.value = true
  } catch (error) {
    saveError.value = error?.message || 'Не удалось обновить e-mail'
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  isLoading.value = true

  try {
    const profile = await api.fetchProfile(token.value)
    currentEmail.value = profile.email
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="card">
    <div class="row g-0">
      <ProfileMenu />
      <div class="col-sm-12 col-lg-9 col-xl-10">
        <div class="card-body">
          <h1>Изменить E-mail</h1>
          <div v-if="isLoading" class="spinner-border" />
          <form v-else @submit.prevent="onSubmit">
            <div class="row mb-3">
              <div class="col-md-6 col-lg-4">
                <Input
                  type="email"
                  v-model="currentEmail"
                  disabled
                />
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6 col-lg-4">
                <Input
                  type="email"
                  v-model="newEmail"
                  placeholder="Новый E-mail"
                />
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6 col-lg-4">
                <Input
                  type="password"
                  v-model="password"
                  placeholder="Пароль"
                />
              </div>
            </div>
            <div v-if="saveError || saveSuccess" class="row mb-3">
              <div class="col-md-6 col-lg-4">
                <div v-if="saveError" class="alert alert-danger">
                  <IconAlertCircle :size="20" class="text-danger" />
                  {{ saveError }}
                </div>
                <div v-if="saveSuccess" class="alert alert-success flex items-center gap-2 text-green-lt-fg">
                  <IconCheck :size="20" class="text-success" />
                  <span>E-mail успешно обновлён</span>
                </div>
              </div>
            </div>

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
          </form>
        </div>
      </div>
    </div>
  </div>
</template>