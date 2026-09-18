<script setup>
import api from '~/lib/api';

const route = useRoute();
const { token } = useAuth();

const isLoading = ref(true);
const items = ref([]);
const selectedId = ref(undefined);
const emit = defineEmits(['toggleProperty'])

const props = defineProps({
  label: {
    type: String,
    default: 'Имущество',
  },
  id: {
    type: Number,
    default: undefined,
  },
});

const load = async () => {
  isLoading.value = true
  try {
    const result = await api.properties(token.value);
    if (result) {
      items.value = result;
      // initSelectedIds(route.query.properties);
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

const options = computed(() => (
  [
    { value: undefined, label: '' },
    ...visibleItems.value.map(v => ({ value: v.id, label: v.name }))
  ]
));

const initSelectedIds = (properties = '') => {
  if (props.id === undefined) {
    const queryIds = properties?.toString().split(',') || [];
    const queryId = queryIds.map(id => Number(id)).filter(id => id > 0)[0];
    if (queryId != selectedId.value) {
      selectedId.value = queryId;
    }
  } else {
    selectedId.value = props.id;
  }
  emit('toggleProperty', selectedId.value);
}

watch(
  () => token.value,
  (val) => {
    if (val) load();
  },
  { immediate: true }
);

watch(() => route, (newRoute) => {
  initSelectedIds(newRoute.query.properties);
}, { immediate: true, deep: true })

watch(selectedId, (newId) => {
  emit('toggleProperty', newId);
});
watch(
  () => props.id,
  (newId) => {
    if (newId !== undefined) {
      selectedId.value = newId;
    }
  },
);
</script>

<template>
  <PlaceholderLoadingFilters v-if='isLoading' />

  <div
    v-if='!isLoading && visibleItems.length > 0'
    class='mt-3'
  >
    <Label>{{props.label}}</Label>
    <SingleSelect
      v-model='selectedId'
      :options='options'
    />
  </div>
</template>

<style scoped>
.content-scroll {
  max-height: 50vh;
  overflow: scroll;
}
</style>
