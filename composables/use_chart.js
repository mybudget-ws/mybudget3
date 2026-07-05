import { parseNumberArray, parseStringArray } from '~/lib/helper_parsers';

export const useChart = () => {
  const route = useRoute();
  const router = useRouter();
  const appConfig = useAppConfig();

  const CHART_HEIGTH = 500;
  const CHART_LABEL_COLOR = appConfig.theme.dark ? '#e2e8f0' : '#334155';

  const currentMonthLabel = new Intl.DateTimeFormat('ru-RU', {
    month: 'long',
  }).format(new Date());

  const PERIODS = computed(() => ({
    CURRENT_MONTH: currentMonthLabel.charAt(0).toUpperCase() + currentMonthLabel.slice(1),
    DAYS_30: '30 дней',
    DAYS_60: '60 дней',
    YEARS_1: 'Год',
    YEARS_2: 'Два года',
    YEARS_5: 'Пять лет',
    ALL: 'Всё время',
  }));
  const isPeriodValid = (value) => Boolean(PERIODS.value[value]);
  const period = ref(isPeriodValid(route.query.period) ? route.query.period : 'CURRENT_MONTH');

  const setPeriod = (value) => {
    period.value = value;

    router.push({
      query: {
        ...route.query,
        period: value,
      },
    });
  };

  const toggleQueryFilter = (queryKey, id, parser, formatter = (arr) => arr.join(',')) => {
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

  const filters = computed(() => {
    return {
      period: period.value,
      accountIds: parseNumberArray(route.query.accounts),
      categoryIds: parseNumberArray(route.query.categories),
      projectIds: parseNumberArray(route.query.projects),
      propertyIds: parseNumberArray(route.query.properties),
      kinds: parseStringArray(route.query.kinds),
    };
  });

  watch(() => route.query.period, (newPeriod) => {
    if (isPeriodValid(newPeriod) && newPeriod !== period.value) {
      period.value = newPeriod;
    }
  });

  return {
    CHART_HEIGTH,
    CHART_LABEL_COLOR,
    PERIODS,
    period,
    setPeriod,
    filters,
    onCategoryClick,
    onAccountClick,
    onProjectClick,
    onPropertyClick,
    onKindClick,
  };
};
