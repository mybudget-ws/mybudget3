<script setup>
const props = defineProps({
  error: Object,
});

const goHome = async () => {
  await clearError({ redirect: '/' });
};

const title = computed(() => {
  if (props.error?.statusCode === 404) {
    return 'Страница не найдена';
  }

  if (props.error?.statusCode === 500) {
    return 'Внутренняя ошибка сервера';
  }

  return 'Произошла ошибка';
});

const description = computed(() => {
  if (props.error?.statusCode === 404) {
    return 'Такой страницы не существует или она была перемещена.';
  }

  if (props.error?.statusCode === 500) {
    return 'На сервере произошла ошибка. Попробуйте повторить попытку позже.';
  }

  return props.error?.statusMessage;
});
</script>

<template>
  <div class='page'>
    <div class='container container-tight py-4'>
      <div class='empty'>
        <div class='empty-header'>
          {{ error.statusCode }}
        </div>

        <p class='empty-title'>
          {{ title }}
        </p>

        <p class='empty-subtitle text-secondary'>
          {{ description }}
        </p>

        <div class='empty-action'>
          <button
            type='button'
            class='btn btn-primary'
            @click='goHome'
          >
            На главную
          </button>
        </div>
      </div>
    </div>
  </div>
</template>