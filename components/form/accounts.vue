<script setup>
import api from '~/lib/api';

const route = useRoute();
const { token } = useAuth();

const isLoading = ref(true);
const items = ref([]);
const selectedIds = ref(new Set());

const load = async () => {
  isLoading.value = true
  try {
    const result = await api.accounts(token.value);
    if (result) {
      items.value = result;
      const queryIds = route.query.accounts?.toString().split(',') || [];
      selectedIds.value = new Set(queryIds.map(id => Number(id)).filter(id => id > 0));
      if (selectedIds.value.size === 0) {
        selectedIds.value.add(visibleItems.value[0]?.id);
      }
    } else {
      console.log('TODO: error');
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false
  }
};

const toggleSelection = (id) => {
  selectedIds.value.clear();
  selectedIds.value.add(id);
};

const visibleItems = computed(() => (
  items.value.filter(v => v.isHidden === false)
));

// const selectedItem = computed(() => (
//   items.value.filter(v => v.id === selectedIds.value
// ));

watch(
  () => token.value,
  (val) => {
    if (val) load();
  },
  { immediate: true }
);

watch(() => route, (newRoute) => {
  const queryIds = newRoute.query.accounts?.toString().split(',') || [];
  selectedIds.value = new Set(queryIds.map(id => Number(id)).filter(id => id > 0));
}, { immediate: true, deep: true })
</script>

<template>
  <div class='mb-3'>
    <PlaceholderLoadingFilters v-if='isLoading' />

    <div v-else>
      <Label>Счёт</Label>
      <div class="form-selectgroup form-selectgroup-boxes d-flex flex-column">
        <label v-for='item in visibleItems' :key='item.id' class="form-selectgroup-item flex-fill">
          <input
            type="radio" name="form-payment" value="visa" class="form-selectgroup-input"
            :checked='selectedIds.has(item.id)'
            @change='toggleSelection(item.id)'
          />
          <div class="form-selectgroup-label d-flex align-items-center p-3">
            <div class="me-3">
              <span class="form-selectgroup-check"></span>
            </div>
            <div>
              <!--span class="payment payment-provider-visa payment-xs me-2"></span>
              ending in <strong>7998</strong-->
              {{item.name}}
            </div>
          </div>
        </label>
      </div>
    </div>
  </div>
</template>

