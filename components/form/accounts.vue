<script setup>
import api from '~/lib/api';

const TYPE_RADIO = 'radio';

const route = useRoute();
const { token } = useAuth();

const isLoading = ref(true);
const items = ref([]);
const selectedIds = ref([]);
const emit = defineEmits(['toggleAccount', 'toggleAccountIds']);

const props = defineProps({
  label: {
    type: String,
    default: 'Счёт',
  },
  radioGroupName: {
    type: String,
    default: 'form-account',
  },
  type: {
    type: String,
    default: TYPE_RADIO,
  },
  ids: {
    type: Array,
    default: [],
  },
});

const load = async () => {
  isLoading.value = true
  try {
    const result = await api.accounts(token.value);
    if (result) {
      items.value = result;
      initSelectedIds();
    } else {
      console.log('TODO: error');
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false
  }
};

const initSelectedIds = (query = route.query) => {
  if (props.ids.length === 0) {
    const queryIds = query.accounts?.toString().split(',').filter(v => v !== '') || [];
    selectedIds.value = queryIds.map(id => Number(id)).filter(id => id > 0);
  } else {
    selectedIds.value = props.ids;
  }
  if (selectedIds.value.length === 0 && visibleItems.value.length > 0) {
    selectedIds.value = [visibleItems.value[0].id];
  }
  emit('toggleAccount', findItem(selectedIds.value[0]));
  emit('toggleAccountIds', selectedIds.value);
}

const toggleSelection = (id) => {
  if (props.type == TYPE_RADIO) {
    selectedIds.value = [id];
    emit('toggleAccount', findItem(id));

  } else {
    if (isSelected(id)) {
      selectedIds.value = selectedIds.value.filter(v => v !== id);
    } else {
      selectedIds.value = Array.from(new Set([id, ...selectedIds.value]));
    }
    emit('toggleAccountIds', selectedIds.value);
  }
};

const visibleItems = computed(() => (
  items.value.filter(v => v.isHidden === false)
));

const findItem = (id) => items.value.find(v => v.id === id);
const isSelected = (id) => (
  !!selectedIds.value.find(v => v === id)
);

watch(
  () => token.value,
  (val) => {
    if (val) load();
  },
  { immediate: true }
);

watch(() => route, (newRoute) => {
  initSelectedIds(newRoute.query.accounts);
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
            :type='type'
            :name='radioGroupName'
            value='item.id'
            class='form-selectgroup-input'
            :checked='isSelected(item.id)'
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
