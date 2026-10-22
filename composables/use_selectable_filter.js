import { parseNumberArray } from '~/lib/helper_parsers';

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

  const initSelectedItemsByQuery = (query) => {
    selectedIds.value = new Set(parseNumberArray(query));

    emitSelected();
  };

  const toggleSelection = (id) => {
    if (!id) return;

    const next = new Set(selectedIds.value);

    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }

    const nextQuery = { ...route.query };

    if (next.size > 0) {
      nextQuery[queryKey] = Array.from(next).join(',');
    } else {
      delete nextQuery[queryKey];
    }

    // selectedIds и emit('update:items') обновит watch ниже,
    // когда изменится route.query[queryKey].
    router.replace({ query: nextQuery });
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
