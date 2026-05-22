export const useSelectableFilter = ({
  loadFn,
  queryKey,
  emit,
  route,
  router,
}) => {
  const isLoading = ref(true);
  const items = ref([]);
  const selectedIds = ref(new Set());
  const isShowAll = ref(false);

  const notHiddenItems = computed(() =>
    items.value.filter(v => !v.isHidden)
  );

  const favouriteItems = computed(() =>
    notHiddenItems.value.filter(v => v.isFavourite)
  );

  const hasFavourites = computed(() =>
    favouriteItems.value.length > 0
  );

  const visibleItems = computed(() => {
    if (!hasFavourites.value) return notHiddenItems.value;
    if (isShowAll.value) return notHiddenItems.value;

    return notHiddenItems.value.filter(v =>
      v.isFavourite || selectedIds.value.has(v.id)
    );
  });

  const canToggleShowAll = computed(() => (
    hasFavourites.value
      && favouriteItems.value.length < notHiddenItems.value.length
  ));

  const emitSelected = () => {
    const selected = items.value.filter(i =>
      selectedIds.value.has(i.id)
    );

    emit('update:items', selected);
  };

  const initSelectedItemsByQuery = (query = '') => {
    const queryIds = query?.toString().split(',') || [];

    selectedIds.value = new Set(
      queryIds.map(Number).filter(id => id > 0)
    );

    emitSelected();
  };

  const toggleSelection = (id) => {
    if (id === 0 || id === '0') return;

    if (selectedIds.value.has(id)) {
      selectedIds.value.delete(id);
    } else {
      selectedIds.value.add(id);
    }

    router.replace({
      query: {
        ...route.query,
        [queryKey]: Array.from(selectedIds.value).join(','),
      },
    });

    emitSelected();
  };

  const load = async (isQuiet = false) => {
    if (!isQuiet) {
      isLoading.value = true;
    }

    try {
      const result = await loadFn();

      if (result) {
        items.value = result;

        initSelectedItemsByQuery(
          route.query[queryKey]
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  };

  watch(
    () => route.query[queryKey],
    (value) => {
      initSelectedItemsByQuery(value);
    },
    { immediate: true }
  );

  return {
    isLoading,
    items,
    selectedIds,
    isShowAll,

    visibleItems,
    canToggleShowAll,

    toggleSelection,
    load,
  };
};