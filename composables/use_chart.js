import { parseNumberArray, parseStringArray } from '~/lib/helper_parsers';
import { useQueryFilters } from '~/composables/use_query_filters';

export const useChart = () => {
  const route = useRoute();
  const router = useRouter();
  const appConfig = useAppConfig();

  const CHART_HEIGHT = 500;
  const CHART_LABEL_COLOR = appConfig.theme.dark ? '#e2e8f0' : '#334155';
  const REPORTS_PERIOD_STORAGE_KEY = 'reports-period';

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

  const getSavedPeriod = () => {
    if (!import.meta.client) return null;

    const savedPeriod = localStorage.getItem(REPORTS_PERIOD_STORAGE_KEY);

    return isPeriodValid(savedPeriod) ? savedPeriod : null;
  };

  const getInitialPeriod = () => {
    if (isPeriodValid(route.query.period)) {
      return route.query.period;
    }

    return getSavedPeriod() || 'CURRENT_MONTH';
  };

  const period = ref(getInitialPeriod());

  const savePeriod = (value) => {
    if (!import.meta.client) return;

    localStorage.setItem(REPORTS_PERIOD_STORAGE_KEY, value);
  };

  const setPeriod = (value) => {
    if (!isPeriodValid(value)) return;

    period.value = value;
    savePeriod(value);

    router.push({
      query: {
        ...route.query,
        period: value,
      },
    });
  };

  const {
    onCategoryClick,
    onAccountClick,
    onProjectClick,
    onPropertyClick,
    onKindClick,
  } = useQueryFilters();

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

  watch(
    () => route.query.period,
    (newPeriod) => {
      if (isPeriodValid(newPeriod) && newPeriod !== period.value) {
        period.value = newPeriod;
        savePeriod(newPeriod);
      }
    }
  );

  return {
    CHART_HEIGHT,
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