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
const isSaving = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)
const isLoading = ref(false)

const showError = (message) => {
  saveError.value = message

  setTimeout(() => {
    saveError.value = ''
  }, 3000)
}

const showSuccess = () => {
  saveSuccess.value = true

  setTimeout(() => {
    saveSuccess.value = false
  }, 3000)
}

const onSubmit = async () => {
  saveError.value = ''
  saveSuccess.value = false
  const normalizedNewEmail = newEmail.value.trim()

  if (!normalizedNewEmail) {
    showError('Введите новый E-mail')
    return
  }
  if (!password.value) {
    showError('Введите пароль')
    return
  }
  if (normalizedNewEmail === currentEmail.value) {
    showError('Новый E-mail должен отличаться от текущего')
    return
  }
  if (!newEmail.value || !password.value) {
    showError('Заполните все поля')
    return
  }

  isSaving.value = true

  try {
    const result = await api.updateEmail(token.value, {
      password: password.value,
      newEmail: normalizedNewEmail,
    })

    if (!result) {
      showError('Не удалось изменить e-mail')
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

    showSuccess()
  } catch {
    showError('Не удалось обновить e-mail')
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
    saveError.value = 'Не удалось загрузить профиль'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class='card'>
    <div class='row g-0'>
      <ProfileMenu />
      <div class='col-sm-12 col-lg-9 col-xl-10'>
        <div class='card-body'>
          <h1>Изменить E-mail</h1>
          <PlaceholderLoading v-if='isLoading' />
          <form v-else @submit.prevent='onSubmit'>
            <div class='row mb-3'>
              <div class='col-md-6 col-lg-4'>
                <Input
                  v-model='currentEmail'
                  type='email'
                  disabled
                />
              </div>
            </div>
            <div class='row mb-3'>
              <div class='col-md-6 col-lg-4'>
                <Input
                  v-model='newEmail'
                  type='email'
                  placeholder='Новый E-mail'
                />
              </div>
            </div>
            <div class='row mb-3'>
              <div class='col-md-6 col-lg-4'>
                <Input
                  v-model='password'
                  type='password'
                  placeholder='Пароль'
                />
              </div>
            </div>
            <div v-if='saveError || saveSuccess' class='row mb-3'>
              <div class='col-md-6 col-lg-4'>
                <AlertDanger
                  v-if='saveError'
                  :description='saveError'
                />
                <AlertSuccess
                  v-if='saveSuccess'
                  description='E-mail успешно обновлён'
                />
              </div>
            </div>

            <Button
              type='submit'
              class='btn-primary'
              :loading='isSaving'
            >
              Сохранить
            </Button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>