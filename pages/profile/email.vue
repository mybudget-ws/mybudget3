<script setup>
import api from '~/lib/api'
import { useAuth } from '~/composables/use_auth'

definePageMeta({
  middleware: ['authenticated']
})

const { token } = useAuth()

const currentEmail = ref('')
const newEmail = ref('')
const password = ref('')

const isLoading = ref(false)
const isSaving = ref(false)

const errorMessage = ref('')
const successMessage = ref('')

const onSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  isSaving.value = true

  try {
    const res = await api.updateEmail(token.value, {
      password: password.value,
      newEmail: newEmail.value,
    })

    if (res.error) {
      errorMessage.value = res.error
      return
    }

    successMessage.value = 'E-mail успешно обновлён'

    if (res.user?.email) {
      currentEmail.value = res.user.email
    }

    newEmail.value = ''
    password.value = ''
  } catch (e) {
    errorMessage.value = 'Ошибка сервера'
  } finally {
    isSaving.value = false
  }
};

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
});
</script>

<template>
  <div class="card">
    <div class="row g-0">
      <ProfileMenu />
      <div class="col-sm-12 col-lg-9 col-xl-10">
        <div class="card-body">
          <h1>Изменить E-mail</h1>
          <div v-if="isLoading" class="spinner-border" />
          <div v-else>
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
            <div v-if="errorMessage" class="text-danger mb-2">
              {{ errorMessage }}
            </div>
            <div v-if="successMessage" class="text-success mb-2">
              {{ successMessage }}
            </div>
            <button
              class="btn btn-primary"
              :disabled="isSaving"
              @click="onSubmit"
            >
              {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>