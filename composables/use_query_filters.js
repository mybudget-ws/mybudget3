import { parseNumberArray, parseStringArray } from '~/lib/helper_parsers';

// Переключение значений фильтров, которые хранятся в query-параметрах
// (accounts, categories, projects, properties, kinds).
// Используется и на страницах отчётов (через useChart), и на странице операций.
export const useQueryFilters = () => {
  const route = useRoute();
  const router = useRouter();

  const toggleQueryFilter = (
    queryKey,
    id,
    parser,
    formatter = (arr) => arr.join(',')
  ) => {
    const current = parser(route.query[queryKey]);
    const newValues = current.includes(id)
      ? current.filter(item => item !== id)
      : [...current, id];

    const nextQuery = { ...route.query };

    if (newValues.length) nextQuery[queryKey] = formatter(newValues);
    else delete nextQuery[queryKey];

    router.replace({ query: nextQuery });
  };

  const onCategoryClick = (id) => {
    toggleQueryFilter('categories', id, parseNumberArray);
  };

  const onAccountClick = (id) => {
    toggleQueryFilter('accounts', id, parseNumberArray);
  };

  const onProjectClick = (id) => {
    toggleQueryFilter('projects', id, parseNumberArray);
  };

  const onPropertyClick = (id) => {
    toggleQueryFilter('properties', id, parseNumberArray);
  };

  const onKindClick = (id) => {
    toggleQueryFilter('kinds', id, parseStringArray);
  };

  return {
    toggleQueryFilter,
    onCategoryClick,
    onAccountClick,
    onProjectClick,
    onPropertyClick,
    onKindClick,
  };
};