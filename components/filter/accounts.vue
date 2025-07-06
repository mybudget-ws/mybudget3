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

const visibleItems = computed(() => (
  items.value.filter(v => v.isHidden === false)
));

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

    <div v-else class='card-body pb-0'>
      <div class='subheader mb-3'>Счета</div>
      <div v-for='item in visibleItems' :key='item.id'>
        <label class="form-check">
          <input class="form-check-input" type="checkbox" checked="">
          <span class="form-check-label">
            {{ item.name }}
            <Amount
              class='d-block text-secondary fs-5'
              :value='item.balance'
              :currency='item.currency.name'
            />
          </span>
        </label>
      </div>
    </div>
  </div>
</template>
