<script setup>
import api from '~/lib/api';

const route = useRoute();
const { token } = useAuth();

const isLoading = ref(true);
const items = ref([]);
const selectedId = ref(undefined);
const emit = defineEmits(['toggleProject'])

const props = defineProps({
  label: {
    type: String,
    default: 'Проекты',
  },
  id: {
    type: Number,
    default: undefined,
  },
});

const load = async () => {
  isLoading.value = true
  try {
    const result = await api.projects(token.value);
    if (result) {
      items.value = result;
      // initSelectedIds(route.query.projects);
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

const initSelectedIds = (projects = '') => {
  if (props.id === undefined) {
    const queryIds = projects?.toString().split(',') || [];
    const queryId = queryIds.map(id => Number(id)).filter(id => id > 0)[0];
    if (queryId != selectedId.value) {
      selectedId.value = queryId;
    }
  } else {
    selectedId.value = props.id;
  }
  emit('toggleProject', selectedId.value);
}

watch(
  () => token.value,
  (val) => {
    if (val) load();
  },
  { immediate: true }
);

watch(() => route, (newRoute) => {
  initSelectedIds(newRoute.query.projects);
}, { immediate: true, deep: true })

watch(selectedId, (newId) => {
  emit('toggleProject', newId);
});
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
