<script setup>
import api from '~/lib/api';
const { token } = useAuth();
const isLoading = ref(true);
const items = ref([]);

const load = async () => {
  isLoading.value = true
  try {
    const result = await api.accounts(token.value);
    if (result) {
      items.value = result
    } else {
      console.log('TODO: error');
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false
  }
};

watch(
  () => token.value,
  (val) => {
    if (val) {
      load();
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class='card mb-3'>
    <PlaceholderLoadingFilters v-if='isLoading' />

    <div v-else class='card-body p-3'>
      <div class='subheader'>Счета</div>
      <div v-for='item in items' :key='item.id'>
        {{ item.name }}
      </div>
    </div>
  </div>
</template>
