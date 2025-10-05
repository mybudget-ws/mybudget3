<script setup>
import api from '~/lib/api';

const route = useRoute();
const { token } = useAuth();

const isLoading = ref(true);
const items = ref([]);
const selectedId = ref();
const emit = defineEmits(['toggleAccount'])

const props = defineProps({
  label: {
    type: String,
    default: 'Счёт',
  },
  radioGroupName: {
    type: String,
    default: 'form-account',
  },
});

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
  emit('toggleAccount', selectedItem.value);
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
  emit('toggleAccount', selectedItem.value);
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
  <PlaceholderLoadingFilters v-if='isLoading' />

  <div v-else>
    <Label>{{props.label}}</Label>
    <div class='content-scroll pe-1'>
      <div class='form-selectgroup form-selectgroup-boxes d-flex flex-column'>
        <label v-for='item in visibleItems' :key='item.id' class="form-selectgroup-item flex-fill">
          <input
            type='radio'
            :name='radioGroupName'
            value='item.id'
            class='form-selectgroup-input'
            :checked='selectedId == item.id'
            @change='toggleSelection(item.id)'
          />
          <div class='form-selectgroup-label d-flex align-items-center ps-3 p-2'>
            <div class='me-3'>
              <span class='form-selectgroup-check' />
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

<style scoped>
.content-scroll {
  max-height: 50vh;
  overflow: scroll;
}
</style>
