export const useSelectableFilter = ({
  loadFn,
  queryKey,
  emit,
  route,
  router,
  filterVisible = (item) => !item.isHidden,
  withFavourites = false,
}) => {
  const isLoading = ref(true);

  const items = ref([]);
  const selectedIds = ref(new Set());

  const isShowAll = ref(false);

  const visibleBaseItems = computed(() =>
    items.value.filter(filterVisible)
  );

  const favouriteItems = computed(() =>
    visibleBaseItems.value.filter(v => v.isFavourite)
  );

  const hasFavourites = computed(() =>
    favouriteItems.value.length > 0
  );

  const visibleItems = computed(() => {
    if (!withFavourites) {
      return visibleBaseItems.value;
    }

    if (!hasFavourites.value) {
      return visibleBaseItems.value;
    }

    if (isShowAll.value) {
      return visibleBaseItems.value;
    }

    return visibleBaseItems.value.filter(v =>
      v.isFavourite || selectedIds.value.has(v.id)
    );
  });

  const canToggleShowAll = computed(() => (
    withFavourites
    && hasFavourites.value
    && favouriteItems.value.length < visibleBaseItems.value.length
  ));

  const emitSelected = () => {
    const selected = items.value.filter(i =>
      selectedIds.value.has(i.id)
    );

    emit('update:items', selected);
  };

  const initSelectedItemsByQuery = (query = '') => {
    const queryIds = query
      ?.toString()
      .split(',')
      .map(Number)
      .filter(Boolean) || [];

    selectedIds.value = new Set(queryIds);

    emitSelected();
  };

  const toggleSelection = (id) => {
    if (!id) return;

    if (selectedIds.value.has(id)) {
      selectedIds.value.delete(id);
    } else {
      selectedIds.value.add(id);
    }

    const nextQuery = { ...route.query };

    const ids = Array.from(selectedIds.value);

    if (ids.length > 0) {
      nextQuery[queryKey] = ids.join(',');
    } else {
      delete nextQuery[queryKey];
    }

    router.replace({
      query: nextQuery,
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