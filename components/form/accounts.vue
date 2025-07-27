<script setup>
import api from '~/lib/api';

const route = useRoute();
const { token } = useAuth();

const isLoading = ref(true);
const items = ref([]);
const selectedId = ref();

const load = async () => {
  isLoading.value = true
  try {
    const result = await api.accounts(token.value);
    if (result) {
      items.value = result;
      initSelectedAccountByQuery(route.query.accounts);
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
  selectedId.value = id;
};

const visibleItems = computed(() => (
  items.value.filter(v => v.isHidden === false)
));

const selectedItem = computed(() => (
  items.value.find(v => v.id === selectedId.value)
));

const initSelectedAccountByQuery = (accounts = '') => {
  const queryIds = accounts?.toString().split(',') || [];
  selectedId.value = queryIds.map(id => Number(id)).filter(id => id > 0)[0];
  if (selectedId.value === undefined) {
    selectedId.value = visibleItems.value[0]?.id;
  }
}

watch(
  () => token.value,
  (val) => {
    if (val) load();
  },
  { immediate: true }
);

watch(() => route, (newRoute) => {
  initSelectedAccountByQuery(newRoute.query.accounts);
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
            :checked='selectedId == item.id'
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
              <!--span class='text-secondary fw-light fs-6'>{{item.currency.name}}</span-->
              <Amount
                class='d-block text-secondary fs-6'
                :value='item.balance'
                :currency='item.currency.name'
              />
            </div>
          </div>
        </label>
      </div>
    </div>
  </div>
</template>

