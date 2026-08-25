<script setup>
const props = defineProps({
  error: {
    type: Object,
    default: undefined,
  }
});

const PAGE_NOT_FOUND_STATUS = 404;

const goHome = async () => {
  await clearError({ redirect: '/' });
};

const title = computed(() => {
  if (props.error?.statusCode === PAGE_NOT_FOUND_STATUS) {
    return 'Страница не найдена';
  }

  return 'Произошла ошибка';
});

const description = computed(() => {
  if (props.error?.statusCode === PAGE_NOT_FOUND_STATUS) {
    return 'Такой страницы не существует, или она была перемещена';
  }

  return 'Попробуйте повторить попытку позже';
});
</script>

<template>
  <div class='page'>
    <div class='container container-tight py-4'>
      <div class='empty'>
        <div class='empty-header'>
          {{ error.statusCode }}
        </div>

        <h1 class='empty-title'>
          {{ title }}
        </h1>

        <p class='empty-subtitle text-secondary'>
          {{ description }}
        </p>

        <div class='empty-action'>
          <button
            type='button'
            class='btn btn-primary btn-indigo'
            @click='goHome'
          >
            На главную
          </button>
        </div>
      </div>
    </div>
  </div>
</template>