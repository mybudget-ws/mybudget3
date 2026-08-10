<script setup>
import api from '~/lib/api';
import { useDevice } from '~/composables/use_device';
import {
  IconArrowDown,
  IconArrowUp,
  IconCoins,
} from '@tabler/icons-vue';
const route = useRoute();
const { token } = useAuth();
const { isMobile } = useDevice();

const project = ref(null);
const isLoading = ref(true);
const isError = ref(false);
const balance = computed(() =>
  (project.value?.totalIncome || 0) + (project.value?.totalExpense || 0)
);
const load = async () => {
  isLoading.value = true;
  isError.value = false;

  try {
    const result = await api.project(token.value, {
      id: route.params.id,
    });

    if (result) {
      project.value = result;
    } else {
      isError.value = true;
    }
  } catch (err) {
    console.error(err);
    isError.value = true;
  } finally {
    isLoading.value = false;
  }
};

onMounted(load);
</script>

<template>
  <div v-if='isLoading'>
    <div class='card mb-4'>
      <div class='card-body text-center'>
        <PlaceholderLoading />
      </div>
    </div>
  </div>

  <div v-else-if='isError' class='alert alert-danger'>
    Ошибка загрузки проекта
  </div>

  <template v-else>
    <div class='card mb-4'>
      <div
        class='card-body'
        :class='isMobile
          ? "d-flex flex-column gap-3"
          : "d-flex justify-content-between align-items-center"'
      >
        <div>
          <h2 class='mb-1'>
            {{ project?.name || 'Проект' }}
          </h2>

          <div class='text-secondary'>
            Проект
          </div>
        </div>

        <div
          v-if='project'
          :class='isMobile ? "d-flex flex-column gap-3 w-100" : "d-flex gap-4"'
        >
          <div class='d-flex align-items-center gap-2'>
            <div class='bg-green-lt avatar shadow-none'>
              <IconArrowUp size='24' />
            </div>

            <div>
              <Amount
                class='fw-medium'
                :value='project.totalIncome'
                :currency='project.currency?.name'
                copyable
              />

              <div class='text-secondary small'>
                Доходы
              </div>
            </div>
          </div>

          <div class='d-flex align-items-center gap-2'>
            <div class='bg-red-lt avatar shadow-none'>
              <IconArrowDown size='24' />
            </div>

            <div>
              <Amount
                class='fw-medium'
                :value='Math.abs(project.totalExpense)'
                :currency='project.currency?.name'
                copyable
              />

              <div class='text-secondary small'>
                Расходы
              </div>
            </div>
          </div>

          <div class='d-flex align-items-center gap-2'>
            <div class='bg-primary-lt avatar shadow-none'>
              <IconCoins size='24' />
            </div>

            <div>
              <Amount
                class='fw-medium'
                :value='balance'
                :currency='project.currency?.name'
                copyable
              />

              <div class='text-secondary small'>
                Баланс
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>