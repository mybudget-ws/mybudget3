import { GraphQLClient } from 'graphql-request';
import { DEFAULT_CURRENCY } from '~/lib/consts';

// useRuntimeConfig нельзя вызывать на уровне модуля — вызываем лениво и запоминаем результат
let endpoint = null;
/**
 * Получает URL эндпоинта GraphQL API.
 * @returns {string} URL эндпоинта.
 */
function getEndpoint() {
  if (!endpoint) {
    endpoint = useRuntimeConfig().public.apiBaseUrl + '/graphql';
  }
  return endpoint;
}

// ---------------------
// Кэш: память -> localStorage -> сеть
// ---------------------
const CACHE_PREFIX = 'api-cache:';
const CACHE_TTL = 60 * 60 * 1000; // 1 час

// В Nuxt код может выполняться на сервере (SSR), где localStorage нет
const hasStorage = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

// Храним не сам токен, а его хэш, чтобы не дублировать секрет в localStorage.
// Это лишь идентификатор владельца данных, а не защита.
/**
 * Создаёт простой хэш от строки (токен).
 * Используется для проверки владения кэшем без хранения самого токена.
 * @param {string} token - строка для хэширования.
 * @returns {string} хэш строки.
 */
function hashToken(token) {
  let hash = 5381;
  for (let i = 0; i < token.length; i++) {
    hash = ((hash << 5) + hash + token.charCodeAt(i)) | 0;
  }
  return String(hash);
}

/**
 * Читает данные из localStorage, если они валидны и не просрочены.
 * @param {string} name - ключ кэша.
 * @param {string} token - токен для проверки владения данными.
 * @returns {{data: any, ts: number}|null} объект с данными и временной меткой или null.
 */
function readStorage(name, token) {
  if (!hasStorage || !token) return null;
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + name);
    if (!raw) return null;

    const { tokenHash, ts, data } = JSON.parse(raw);
    if (tokenHash !== hashToken(token) || Date.now() - ts > CACHE_TTL) {
      localStorage.removeItem(CACHE_PREFIX + name);
      return null;
    }
    return { data, ts };
  } catch {
    return null;
  }
}

/**
 * Записывает данные в localStorage с привязкой к хэшу токена и временной меткой.
 * @param {string} name - ключ кэша.
 * @param {string} token - токен для создания хэша.
 * @param {any} data - данные для сохранения.
 * @param {number} ts - временная метка (timestamp).
 */
function writeStorage(name, token, data, ts) {
  if (!hasStorage || !token) return;
  try {
    localStorage.setItem(
      CACHE_PREFIX + name,
      JSON.stringify({ tokenHash: hashToken(token), ts, data })
    );
  } catch {
    // переполнение квоты или приватный режим — просто работаем без кэша
  }
}

/**
 * Удаляет запись из localStorage.
 * @param {string} name - ключ кэша.
 */
function removeStorage(name) {
  if (!hasStorage) return;
  try {
    localStorage.removeItem(CACHE_PREFIX + name);
  } catch {
    // ничего не делаем
  }
}

/**
 * Создаёт загрузчик с двухуровневым кэшем: память -> localStorage -> сеть.
 * Одновременные вызовы делят один запрос.
 * На сервере (SSR) кэш не используется: модульное состояние там общее для всех пользователей.
 * @param {string} name - ключ кэша.
 * @param {(token: string) => Promise<any>} fetcher - функция загрузки данных.
 */
function createCachedLoader(name, fetcher) {
  let cache = null;
  let cacheToken = null;
  let cacheTs = 0;
  let promise = null;
  let generation = 0; // защита от записи устаревших данных после invalidate / смены токена
  let requestId = 0; // идентификатор запроса, чтобы не трогать состояние более нового запроса

  return {
    async load(token) {
      if (import.meta.server) return fetcher(token);

      if (cache && cacheToken === token && Date.now() - cacheTs <= CACHE_TTL) return cache;
      if (promise && cacheToken === token) return promise;

      // Токен сменился: всё, что лежит в памяти или летит в сети, принадлежит другому пользователю
      if (cacheToken !== token) {
        generation++;
        cache = null;
        promise = null;
      }

      const stored = readStorage(name, token);
      if (stored) {
        cache = stored.data;
        cacheTs = stored.ts;
        cacheToken = token;
        return cache;
      }

      cacheToken = token;
      const myGeneration = generation;
      const myRequest = ++requestId;

      const current = (async () => {
        const data = await fetcher(token);
        if (myGeneration === generation && cacheToken === token) {
          cache = data;
          cacheTs = Date.now();
          writeStorage(name, token, data, cacheTs);
        }
        return data;
      })();
      promise = current;

      try {
        return await current;
      } catch (error) {
        if (requestId === myRequest) {
          cache = null;
          cacheToken = null;
        }
        throw error;
      } finally {
        if (requestId === myRequest) promise = null;
      }
    },

    invalidate() {
      generation++;
      cache = null;
      cacheToken = null;
      cacheTs = 0;
      promise = null;
      removeStorage(name);
    }
  };
}

/**
 * Создаёт новый клиент GraphQL.
 * @param {string} [token] - токен авторизации.
 * @returns {GraphQLClient} клиент с настроенными заголовками.
 */
function client(token) {
  return new GraphQLClient(getEndpoint(), {
    headers: token ? { authorization: `Bearer ${token}` } : {}
  });
}

/**
 * Логирует GraphQL запрос и ответ в консоль в режиме разработки.
 * @param {string} label - подпись (текст запроса или имя метода).
 * @param {any} data - данные ответа.
 */
function log(label, data) {
  if (import.meta.dev) {
    console.log('[GraphQL]', label, data);
  }
}

/**
 * Единая точка выполнения GraphQL-запросов.
 * @param {string|undefined} token - токен авторизации.
 * @param {string} query - текст запроса.
 * @param {Object} [vars] - переменные.
 * @param {Object} [options]
 * @param {string} [options.label] - подпись для лога (по умолчанию текст запроса).
 * @param {boolean} [options.silent] - не логировать ответ (для auth-запросов с токенами).
 */
async function request(token, query, vars, { label = query, silent = false } = {}) {
  const data = await client(token).request(query, vars);
  if (!silent) log(label, data);
  return data;
}

// null/undefined -> null, остальное (включая 0) -> строка
const toStr = (value) => (value != null ? String(value) : null);

const categoriesLoader = createCachedLoader('categories', async (token) => {
  const query = '{ items:categories { id name color isFavourite isHidden } }';
  const data = await request(token, query);
  return data.items;
});

const projectsLoader = createCachedLoader('projects', async (token) => {
  const query = `
    {
      items:projects {
        id
        name
        isHidden
        position
      }
    }
  `;
  const data = await request(token, query);
  return data.items;
});

const propertiesLoader = createCachedLoader('properties', async (token) => {
  const query = `{
    items:properties {
      id
      name
      kind
      isHidden
      position
      amount:price
      currency { name }
      isTransactionPresent
    }
  }`;
  const data = await request(token, query);
  return data.items;
});

const accountsLoader = createCachedLoader('accounts', async (token) => {
  const query = `{
    items:accounts {
      id
      name
      color
      kind
      isFavourite
      isHidden
      balance
      balanceBase
      position
      description
      currency { name }
      isTransactionPresent
    }
  }`;
  const data = await request(token, query);
  return data.items;
});

const invalidateCategoriesCache = () => categoriesLoader.invalidate();
const invalidateProjectsCache = () => projectsLoader.invalidate();
const invalidatePropertiesCache = () => propertiesLoader.invalidate();
const invalidateAccountsCache = () => accountsLoader.invalidate();

function clearAllCaches() {
  invalidateCategoriesCache();
  invalidateProjectsCache();
  invalidatePropertiesCache();
  invalidateAccountsCache();
}

/**
 * Базовая функция для получения данных графиков.
 * @param {string} token - токен авторизации.
 * @param {Object} filters - фильтры для графика.
 * @param {string} [filters.period] - период ('CURRENT_MONTH', 'DAYS_30' и т.д.).
 * @param {number[]} [filters.accountIds] - список ID счетов.
 * @param {number[]} [filters.categoryIds] - список ID категорий.
 * @param {number[]} [filters.projectIds] - список ID проектов.
 * @param {number[]} [filters.propertyIds] - список ID активов.
 * @param {string[]} [filters.kinds] - типы операций ('INCOME', 'EXPENSE', 'TRANSFER').
 * @param {string} queryName - имя поля в GraphQL схеме для этого графика.
 * @returns {Promise<any>} данные графика.
 */
async function chartBase(token, filters, queryName) {
  const query = `
    query(
      $period: ChartPeriod,
      $accountIds:[Int!],
      $categoryIds:[Int!],
      $projectIds:[Int!],
      $propertyIds:[Int!],
      $kinds:[TransactionKind!]
    ) {
      chart:${queryName}(
        period: $period,
        accountIds: $accountIds,
        categoryIds: $categoryIds,
        projectIds: $projectIds,
        propertyIds: $propertyIds,
        kinds: $kinds,
      )
    }
  `;
  const { period, accountIds, categoryIds, projectIds, propertyIds, kinds } = filters;
  const vars = { period, accountIds, categoryIds, projectIds, propertyIds, kinds };
  const data = await request(token, query, vars);
  return data.chart;
}

const api = {
  /**
   * Очищает кэш категорий, проектов, активов и счетов (в памяти и в localStorage).
   * Вызывай при выходе пользователя из системы.
   */
  clearCache: clearAllCaches,

  /**
   * Выполняет вход пользователя в систему.
   * @param {string} email - email пользователя.
   * @param {string} password - пароль пользователя.
   * @returns {Promise<{email: string, token: string, defaultCurrency: {name: string}}>}
   */
  async login(email, password) {
    const query = `
      query($email:String!, $password:String!) {
        user:signIn(email: $email, password: $password) {
          email
          token
          defaultCurrency { name }
        }
      }
    `;
    const data = await request(undefined, query, { email, password }, { silent: true });
    return data.user;
  },

  /**
   * Регистрирует нового пользователя.
   * @param {string} email - email пользователя.
   * @param {string} password - пароль пользователя.
   * @returns {Promise<{user: {email: string, token: string}, error: string}|null>}
   */
  async registration(email, password) {
    const query = `
      mutation($email:String!, $password:String!) {
        action:signUp(input: {
          email: $email,
          password: $password
        }) {
          user { email token }
          error
        }
      }
    `;
    const { action } = await request(undefined, query, { email, password }, { silent: true });
    return action;
  },

  /**
   * Получает полный профиль пользователя.
   * @param {string} token - токен авторизации.
   * @returns {Promise<{email: string, defaultCurrency: {id: number, name: string}}>}
   */
  async fetchProfile(token) {
    const query = `
      query {
        user:fullProfile {
          email
          defaultCurrency { id name }
        }
      }
    `;
    const data = await request(token, query, undefined, { label: 'fetchProfile' });
    return data.user;
  },

  /**
   * Обновляет профиль пользователя (например, валюту по умолчанию).
   * @param {string} token - токен авторизации.
   * @param {Object} params
   * @param {string} params.currency - код валюты.
   * @returns {Promise<{email: string, token: string, defaultCurrency: {id: number, name: string}}>}
   */
  async updateProfile(token, { currency }) {
    const query = `
      mutation($currency:String!) {
        action:updateUserProfile(
          currency: $currency
        ) { email token defaultCurrency { id name } }
      }
    `;
    const data = await request(token, query, { currency }, { silent: true });
    // От валюты по умолчанию зависят balanceBase / currencyBase у счетов
    invalidateAccountsCache();
    return data.action;
  },

  // Если ошибка в параметрах, то вернется ошибка в `error`.
  /**
   * Обновляет email пользователя.
   * @param {string} token - токен авторизации.
   * @param {Object} params
   * @param {string} params.password - текущий пароль пользователя.
   * @param {string} params.newEmail - новый email.
   * @returns {Promise<{user: {email: string, token: string}, error: string}|null>}
   */
  async updateEmail(token, { password, newEmail }) {
    const query = `
      mutation($password:String!, $newEmail:String!) {
        action:updateUserEmail(input: {
          password: $password,
          newEmail: $newEmail
        }) {
          user { email token }
          error
        }
      }
    `;
    const { action } = await request(token, query, { password, newEmail }, { silent: true });
    return action;
  },

  // Если старый пароль не верный, то метод вернет null.
  /**
   * Обновляет пароль пользователя.
   * @param {string} token - токен авторизации.
   * @param {Object} params
   * @param {string} params.password - текущий пароль пользователя.
   * @param {string} params.newPassword - новый пароль.
   * @returns {Promise<{email: string, token: string}|null>}
   */
  async updatePassword(token, { password, newPassword }) {
    const query = `
      mutation($oldPassword:String!, $newPassword:String!) {
        action:updateUserPassword(
          oldPassword: $oldPassword,
          newPassword: $newPassword
        ) { email token }
      }
    `;
    const vars = { oldPassword: password, newPassword };
    const data = await request(token, query, vars, { silent: true });
    return data.action;
  },

  // ---------------------
  // Reports | Charts
  // ---------------------
  // Возможные значения period:
  // 'CURRENT_MONTH' - Текущий месяц
  // 'DAYS_30' - 30 дней
  // 'YEARS_1' - 1 год
  // 'YEARS_2' - 2 года
  // 'YEARS_5' - 5 лет
  // 'ALL' - Всё время
  /**
   * Получает данные для графика балансов.
   * @param {string} token - токен авторизации.
   * @param {Object} filters - см. chartBase.
   * @returns {Promise<any>} данные графика балансов.
   */
  async chartBalances(token, filters) {
    return chartBase(token, filters, 'chartBalances');
  },

  /**
   * Получает данные для графика транзакций.
   * @param {string} token - токен авторизации.
   * @param {Object} filters - см. chartBase.
   * @returns {Promise<any>} данные графика транзакций.
   */
  async chartTransactions(token, filters) {
    return chartBase(token, filters, 'chartTransactions');
  },

  // ---------------------
  // Dashboard
  // ---------------------
  /**
   * Получает данные для панели управления (dashboard).
   * @param {string} token - токен авторизации.
   * @returns {Promise<any>} объект с данными дашборда.
   */
  async dashboard(token) {
    // TODO: по итогу дизайна Dashboard решить, какие тут нужно оставить поля:
    const transactionsProps = `
      id
      amount
      description
      dateAt
      account {
        id
        name
        currency { name }
      }
      categories { id name }
      project { id name }
      property { id name }
    `;
    const query = `
      query {
        dashboard {
          currentMonth
          expenses {
            ${transactionsProps}
          }
          incomes {
            ${transactionsProps}
          }
          accounts {
            id
            name
            balance
            balanceBase
            currency { name }
            currencyBase { name }
          }
          assets {
            id
            name
            tag
            amount
            amountBase
            currency { name }
            currencyBase { name }
          }
          incomesChart
          expensesChart
          accountsChart
          assetsChart
        }
      }`;
    const data = await request(token, query);
    return data.dashboard;
  },

  // ---------------------
  // Transactions
  // ---------------------

  /**
   * Получает операцию.
   */
  async transaction(token, id) {
    const query = `
      query($id:ID!) {
        item:transaction(id: $id) {
          id
          amount
          description
          dateAt
          account {
            id
            name
            color
            currency { name }
          }
          categories { id name color }
          project { id name color }
          property { id name color }
          isTransfer
        }
      }
    `;
    const data = await request(token, query, { id }, { label: 'transaction' });
    return data.item;
  },

  // Возможные параметры для filters.kinds: ['INCOME', 'EXPENSE', 'TRANSFER']
  // Можно передать пустой массив, тогда будут все операции (без фильтрации),
  // а можно передать любую комбинацию:
  //
  // 1. Только доходы - filters.kinds: ['INCOME']
  // 2. Только расходы - filters.kinds: ['EXPENSE']
  // 3. Только переводы - filters.kinds: ['TRANSFER']
  // 4. Можно передать несколько разных вариантов, например для доходов
  //    и расходов будет - filters.kinds: ['INCOME', 'EXPENSE'] и т.д.
  //
  // Период, может быть:
  // 'TODAY' - 'Сегодня'
  // 'YESTERDAY' - 'Вчера'
  // 'WEEK' - 'Неделя'
  // 'MONTH' - 'Месяц'
  // 'YEAR' - 'Год'
  // 'CUSTOM' - 'Свой интервал'
  /**
   * Получает список операций с поддержкой пагинации и фильтрации.
   * @param {string} token - токен авторизации.
   * @param {Object} params - параметры запроса.
   * @param {number} [params.page] - номер страницы.
   * @param {number} [params.perPage] - количество элементов на страницу.
   * @param {Object} params.filters - фильтры (accountIds, categoryIds, projectIds,
   *   propertyIds, kinds, description, period, customPeriodFrom, customPeriodTo).
   * @returns {Promise<Array<Object>>} список операций.
   */
  async transactions(token, { page, perPage, filters }) {
    const query = `
      query(
        $page:Int, $perPage:Int,
        $accountIds:[Int!],
        $categoryIds:[Int!],
        $projectIds:[Int!],
        $propertyIds:[Int!],
        $kinds:[TransactionKind!],
        $description:String,
        $period:TransactionPeriod,
        $customPeriodFrom:String,
        $customPeriodTo:String,
      ) {
        items:transactions(
          page: $page,
          perPage: $perPage,
          accountIds: $accountIds,
          categoryIds: $categoryIds,
          projectIds: $projectIds,
          propertyIds: $propertyIds,
          kinds: $kinds,
          description: $description,
          period: $period,
          customPeriodFrom: $customPeriodFrom,
          customPeriodTo: $customPeriodTo,
        ) {
          id
          amount
          description
          dateAt
          account { id name color currency { name } }
          categories { id name color }
          project { id name color }
          property { id name color }
          isTransfer
        }
      }
    `;
    const vars = {
      page,
      perPage,
      accountIds: filters.accountIds,
      categoryIds: filters.categoryIds,
      projectIds: filters.projectIds,
      propertyIds: filters.propertyIds,
      kinds: filters.kinds,
      description: filters.description,
      period: filters.period,
      customPeriodFrom: filters.customPeriodFrom,
      customPeriodTo: filters.customPeriodTo,
    };
    const data = await request(token, query, vars, { label: 'transactions' });
    return data.items;
  },

  /**
   * Создаёт новую операцию.
   * @param {string} token - токен авторизации.
   * @param {Object} params - параметры операции.
   * @param {string} params.amount - сумма операции.
   * @param {boolean} params.isIncome - является ли операция доходом.
   * @param {string} params.date - дата операции.
   * @param {string} [params.description] - описание операции.
   * @param {number|string} params.accountId - ID счёта.
   * @param {number[]} params.categoryIds - список ID категорий.
   * @param {number|string} [params.projectId] - ID проекта.
   * @param {number|string} [params.propertyId] - ID актива.
   * @returns {Promise<any>} результат создания операции.
   */
  async createTransaction(
    token,
    { amount, isIncome, date, description, accountId, categoryIds, projectId, propertyId }
  ) {
    const query = `
      mutation(
        $amount:String!,
        $isIncome:Boolean!,
        $date:String!,
        $categoryIds:[Int!]!,
        $description:String,
        $accountId:String!,
        $projectId:String,
        $propertyId:String
      ) {
        action:createTransaction(
          amount: $amount,
          isIncome: $isIncome,
          date: $date,
          categoryIds: $categoryIds,
          description: $description,
          accountId: $accountId,
          projectId: $projectId,
          propertyId: $propertyId
        )
      }
    `;
    const vars = {
      amount,
      isIncome,
      date,
      categoryIds,
      description,
      accountId: toStr(accountId),
      projectId: toStr(projectId),
      propertyId: toStr(propertyId)
    };
    const data = await request(token, query, vars, { label: 'createTransaction' });
    invalidateAccountsCache();
    return data.action;
  },

  /**
   * Обновляет существующую операцию.
   * @param {string} token - токен авторизации.
   * @param {Object} params - параметры обновления (см. createTransaction, плюс id).
   * @returns {Promise<{id: string}>} обновлённая операция.
   */
  async updateTransaction(
    token,
    { id, amount, isIncome, date, description, accountId, categoryIds, projectId, propertyId }
  ) {
    const query = `
      mutation(
        $id:ID!,
        $amount:String!,
        $isIncome:Boolean!,
        $date:String!,
        $categoryIds:[Int!]!,
        $description:String,
        $accountId:String!,
        $projectId:String,
        $propertyId:String
      ) {
        action:updateTransaction(
          id: $id,
          amount: $amount,
          isIncome: $isIncome,
          date: $date,
          categoryIds: $categoryIds,
          description: $description,
          accountId: $accountId,
          projectId: $projectId,
          propertyId: $propertyId
        ) { id }
      }
    `;
    const vars = {
      id,
      amount,
      isIncome,
      date,
      categoryIds,
      description,
      accountId: toStr(accountId),
      projectId: toStr(projectId),
      propertyId: toStr(propertyId)
    };
    const data = await request(token, query, vars, { label: 'updateTransaction' });
    invalidateAccountsCache();
    return data.action;
  },

  /**
   * Удаляет операцию.
   * @param {string} token - токен авторизации.
   * @param {string|number} id - ID операции.
   * @returns {Promise<{id: string}>} результат удаления операции.
   */
  async destroyTransaction(token, id) {
    const query = `
      mutation($id:ID!) { action:destroyTransaction(id: $id) { id } }
    `;
    const data = await request(token, query, { id }, { label: 'destroyTransaction' });
    invalidateAccountsCache();
    return data.action;
  },

  /**
   * Создаёт перевод между двумя счетами.
   * @param {string} token - токен авторизации.
   * @param {Object} params - параметры перевода.
   * @param {string} params.amountSrc - сумма со счёта-источника.
   * @param {string} params.amountDst - сумма на счёт-назначение.
   * @param {number|string} params.accountIdSrc - ID счёта-источника.
   * @param {number|string} params.accountIdDst - ID счёта-назначения.
   * @param {string} params.date - дата перевода.
   * @param {string} [params.description] - описание перевода.
   * @returns {Promise<any>} результат создания перевода.
   */
  async createTransactionTransfer(
    token,
    { amountSrc, amountDst, accountIdSrc, accountIdDst, date, description }
  ) {
    const query = `
      mutation(
        $amountSrc:String!,
        $amountDst:String!,
        $accountIdSrc:String!,
        $accountIdDst:String!,
        $date:String!,
        $description:String
      ) {
        action:createTransactionTransfer(
          amountSrc: $amountSrc,
          amountDst: $amountDst,
          accountIdSrc: $accountIdSrc,
          accountIdDst: $accountIdDst,
          date: $date,
          description: $description
        )
      }
    `;
    const vars = {
      amountSrc,
      amountDst,
      accountIdSrc: toStr(accountIdSrc),
      accountIdDst: toStr(accountIdDst),
      date,
      description
    };
    const data = await request(token, query, vars, { label: 'createTransactionTransfer' });
    // Перевод меняет балансы счетов
    invalidateAccountsCache();
    return data.action;
  },

  // ---------------------
  // Accounts
  // ---------------------
  /**
   * Получает список счетов пользователя (с кэшем).
   * @param {string} token - токен авторизации.
   * @returns {Promise<Array<Object>>} список счетов.
   */
  async accounts(token) {
    return accountsLoader.load(token);
  },

  /**
   * Создаёт новый счёт.
   * @param {string} token - токен авторизации.
   * @param {Object} params - параметры создания счёта.
   * @param {string} params.name - название счёта.
   * @param {string} params.color - цвет счёта.
   * @param {string} params.kind - тип счёта (debit/credit).
   * @param {string} params.currency - код валюты.
   * @param {string} [params.description] - описание счёта.
   * @param {number} [params.position] - позиция в списке.
   * @returns {Promise<{id: string}>} созданный счёт.
   */
  async createAccount(token, { name, color, kind, currency, description, position }) {
    const query = `
      mutation(
        $name:String!,
        $color:String!,
        $kind:String!,
        $currency:String!,
        $description:String,
        $position:Int
      ) {
        createAccount(
          name: $name,
          color: $color,
          kind: $kind,
          description: $description,
          currency: $currency
          position: $position
        ) { id }
      }
    `;
    const vars = { name, color, kind, currency, description, position };
    const data = await request(token, query, vars, { label: 'createAccount' });
    invalidateAccountsCache();
    return data.createAccount;
  },

  /**
   * Обновляет существующий счёт.
   * @param {string} token - токен авторизации.
   * @param {Object} params - параметры обновления (см. createAccount, плюс id; position обязателен).
   * @returns {Promise<{id: string}>} обновлённый счёт.
   */
  async updateAccount(token, { id, name, color, kind, currency, description, position }) {
    const query = `
      mutation(
        $id:ID!,
        $name:String!,
        $color:String!,
        $kind:String!,
        $currency:String!,
        $description:String,
        $position:Int!
      ) {
        action:updateAccount(
          id: $id,
          name: $name,
          color: $color,
          kind: $kind,
          currency: $currency,
          description: $description,
          position: $position
        ) { id }
      }
    `;
    const vars = { id, name, color, kind, currency, description, position };
    const data = await request(token, query, vars, { label: 'updateAccount' });
    invalidateAccountsCache();
    return data.action;
  },

  /**
   * Удаляет счёт.
   * @param {string} token - токен авторизации.
   * @param {string|number} id - ID счёта.
   * @returns {Promise<{id: string}>} результат удаления.
   */
  async destroyAccount(token, id) {
    const query = `
      mutation($id:ID!) { action:destroyAccount(id: $id) { id } }
    `;
    const data = await request(token, query, { id }, { label: 'destroyAccount' });
    invalidateAccountsCache();
    return data.action;
  },

  // ---------------------
  // Categories
  // ---------------------
  /**
   * Получает список категорий пользователя (с кэшем).
   * @param {string} token - токен авторизации.
   * @returns {Promise<Array<Object>>} список категорий.
   */
  async categories(token) {
    return categoriesLoader.load(token);
  },

  async createCategory(token, { name, color }) {
    const query = `
      mutation($name:String!, $color:String!) {
        action:createCategory(
          name: $name,
          color: $color
        ) { id name color }
      }
    `;
    const data = await request(token, query, { name, color }, { label: 'createCategory' });
    invalidateCategoriesCache();
    return data.action;
  },

  async updateCategory(token, { id, name, color }) {
    const query = `
      mutation($id:ID!, $name:String!, $color:String!) {
        action:updateCategory(
          id: $id,
          name: $name,
          color: $color
        ) { id name color }
      }
    `;
    const data = await request(token, query, { id, name, color }, { label: 'updateCategory' });
    invalidateCategoriesCache();
    return data.action;
  },

  async destroyCategory(token, id) {
    const query = 'mutation($id:ID!) { action:destroyCategory(id: $id) { id } }';
    const data = await request(token, query, { id }, { label: 'destroyCategory' });
    invalidateCategoriesCache();
    return data.action;
  },

  // ---------------------------------
  // Goal
  // ---------------------------------
  async goals(token) {
    const query = `
      {
        items:goals {
          id
          name
          accounts { id name color }
          amount
          amountPerMonth
          currency { name }
          dueDateOn
          dueMonths
          percentage
          balance
          isHidden
          position
        }
      }
    `;
    const data = await request(token, query);
    return data.items;
  },

  async createGoal(token, { name, amount, dueDateOn, accountIds, position }) {
    const query = `
      mutation(
        $name:String!,
        $amount:String!,
        $dueDateOn:String!,
        $accountIds:[Int!]!,
        $position:Int
      ) {
        action:createGoal(
          name: $name,
          amount: $amount,
          dueDateOn: $dueDateOn,
          accountIds: $accountIds,
          position: $position
        ) { id }
      }
    `;
    const vars = { name, amount, dueDateOn, accountIds, position };
    const data = await request(token, query, vars, { label: 'createGoal' });
    return data.action;
  },

  async updateGoal(token, { id, name, amount, dueDateOn, accountIds, position }) {
    const query = `
      mutation(
        $id:ID!,
        $name:String!,
        $amount:String!,
        $dueDateOn:String!,
        $accountIds:[Int!]!,
        $position:Int!
      ) {
        action:updateGoal(
          id: $id,
          name: $name,
          amount: $amount,
          dueDateOn: $dueDateOn,
          accountIds: $accountIds,
          position: $position
        ) { id }
      }
    `;
    const vars = { id, name, amount, dueDateOn, accountIds, position };
    const data = await request(token, query, vars, { label: 'updateGoal' });
    return data.action;
  },

  async destroyGoal(token, id) {
    const query = 'mutation($id:ID!) { action:destroyGoal(id: $id) { id } }';
    const data = await request(token, query, { id }, { label: 'destroyGoal' });
    return data.action;
  },

  // ---------------------------------
  // Project
  // ---------------------------------
  async projects(token) {
    return projectsLoader.load(token);
  },

  async projectsWithBalances(token) {
    const query = `
      {
        items:projects {
          id
          name
          isHidden
          position
          budget
          budgetCurrency {
            id
            name
            displayName
          }
          balances {
            amount amountBase
            currency { name }
            currencyBase { name }
          }
          isTransactionPresent
        }
      }
    `;
    const data = await request(token, query);
    return data.items;
  },

  /**
   * Создаёт новый проект.
   * @param {string} token - токен авторизации.
   * @param {Object} params - параметры создания проекта.
   * @param {string} params.name - название проекта.
   * @param {number} [params.position] - позиция проекта.
   * @param {number} [params.budget] - бюджет проекта.
   * @param {number} [params.budgetCurrencyId] - ID валюты бюджета проекта.
   * @returns {Promise<any>} созданный проект.
   */
  async createProject(token, { name, position, budget, budgetCurrencyId }) {
    const query = `
      mutation(
        $name:String!,
        $position:Int,
        $budget:Float,
        $budgetCurrencyId:Int
      ) {
        action:createProject(
          name: $name,
          position: $position,
          budget: $budget,
          budgetCurrencyId: $budgetCurrencyId
        ) { id }
      }
    `;
    const vars = { name, position, budget, budgetCurrencyId };
    const data = await request(token, query, vars, { label: 'createProject' });
    invalidateProjectsCache();
    return data.action;
  },

  /**
   * Обновляет существующий проект.
   * @param {string} token - токен авторизации.
   * @param {Object} params - параметры обновления проекта (position обязателен).
   * @returns {Promise<any>} обновлённый проект.
   */
  async updateProject(token, { id, name, position, budget, budgetCurrencyId }) {
    const query = `
      mutation(
        $id:ID!,
        $name:String!,
        $position:Int!,
        $budget:Float,
        $budgetCurrencyId:Int
      ) {
        action:updateProject(
          id: $id,
          name: $name,
          position: $position,
          budget: $budget,
          budgetCurrencyId: $budgetCurrencyId
        ) { id }
      }
    `;
    const vars = { id, name, position, budget, budgetCurrencyId };
    const data = await request(token, query, vars, { label: 'updateProject' });
    invalidateProjectsCache();
    return data.action;
  },

  async destroyProject(token, id) {
    const query = `
      mutation($id:ID!) { action:destroyProject(id: $id) { id } }
    `;
    const data = await request(token, query, { id }, { label: 'destroyProject' });
    invalidateProjectsCache();
    return data.action;
  },

  async project(token, { id }) {
    const query = `query($id:ID!) {
      item:project(id:$id) {
        id
        name
        isHidden
        position
        budget
        budgetCurrency {
          id
          name
          displayName
        }
        currency { name }
        totalIncome
        totalExpense
        budgetUsagePercent
        projectItems {
          id name position isDone
        }
      }
    }`;
    const data = await request(token, query, { id });
    return data.item;
  },

  /**
   * Создаёт новый элемент проекта.
   * @param {string} token - токен авторизации.
   * @param {Object} params
   * @param {string|number} params.projectId - ID проекта.
   * @param {string} params.name - название элемента.
   * @returns {Promise<{projectItem: Object, errors: string[]}>}
   */
  async createProjectItem(token, { projectId, name }) {
    const query = `
      mutation($projectId:ID!, $name:String!) {
        action:createProjectItem(
          input: {
            projectId: $projectId,
            name: $name
          }
        ) {
          projectItem {
            id
            name
            position
          }
          errors
        }
      }
    `;
    const vars = { projectId: toStr(projectId), name };
    const data = await request(token, query, vars);
    return data.action;
  },

  /**
   * Обновляет существующий элемент проекта.
   * @param {string} token - токен авторизации.
   * @param {Object} params
   * @param {string|number} params.id - ID элемента.
   * @param {string} [params.name] - новое название.
   * @param {number} [params.position] - новая позиция.
   * @param {boolean} [params.isDone] - статус выполнения элемента.
   * @returns {Promise<{projectItem: Object, errors: string[]}>}
   */
  async updateProjectItem(token, { id, name, position, isDone }) {
    const query = `
      mutation($id:ID!, $name:String, $position:Int, $isDone:Boolean) {
        action:updateProjectItem(
          input: {
            id: $id,
            name: $name,
            position: $position,
            isDone: $isDone
          }
        ) {
          projectItem {
            id
            name
            position
            isDone
          }
          errors
        }
      }
    `;
    const vars = { id: toStr(id), name, position, isDone };
    const data = await request(token, query, vars);
    return data.action;
  },

  /**
   * Удаляет элемент проекта.
   * @param {string} token - токен авторизации.
   * @param {string|number} id - ID элемента.
   * @returns {Promise<{success: boolean, errors: string[]}>}
   */
  async destroyProjectItem(token, id) {
    const query = `
      mutation($id:ID!) {
        action:destroyProjectItem(
          input: {
            id: $id
          }
        ) {
          success
          errors
        }
      }
    `;
    const data = await request(token, query, { id: toStr(id) });
    return data.action;
  },

  // ---------------------------------
  // Properties
  // ---------------------------------
  async properties(token) {
    return propertiesLoader.load(token);
  },

  async createProperty(token, { name, color, kind, currency, amount }) {
    const query = `
      mutation($name:String!, $color:String!, $kind:String!, $currency:String!, $amount:String!) {
        action:createProperty(
          name: $name,
          color: $color,
          kind: $kind,
          currency: $currency,
          amount: $amount
        ) { id name color kind price currency { name } }
      }
    `;
    const vars = { name, color, kind, currency, amount };
    const data = await request(token, query, vars);
    invalidatePropertiesCache();
    return data.action;
  },

  async updateProperty(token, { id, name, color, kind, currency, amount, position }) {
    const query = `
      mutation(
        $id:ID!,
        $name:String!,
        $color:String!,
        $kind:String!,
        $currency:String!,
        $amount:String!,
        $position:Int!
      ) {
        action:updateProperty(
          id: $id,
          name: $name,
          color: $color,
          kind: $kind,
          currency: $currency,
          amount: $amount,
          position: $position
        ) { id }
      }
    `;
    const vars = { id, name, color, kind, currency, amount, position };
    const data = await request(token, query, vars);
    invalidatePropertiesCache();
    return data.action;
  },

  async destroyProperty(token, id) {
    const query = `
      mutation($id:ID!) { action:destroyProperty(id: $id) { id } }
    `;
    const data = await request(token, query, { id });
    invalidatePropertiesCache();
    return data.action;
  },

  async property(token, { id }) {
    const query = `query($id:ID!) {
      item:property(id:$id) {
        id name color kind amount:price currency { name }
        position
        totalIncome
        totalExpense
        prices {
          id
          date:dateOn
          amount
          description
          currency { name }
        }
        pricesChart
      }
    }`;
    const data = await request(token, query, { id });
    return data.item;
  },

  // ---------------------------------
  // Property Prices
  // ---------------------------------
  async createPropertyPrice(token, { amount, date, propertyId, description }) {
    const query = `
      mutation($propertyId:ID!, $amount:String!, $date:String!, $description:String) {
        action:createPropertyPrice(
          propertyId: $propertyId,
          date: $date,
          amount: $amount,
          description: $description
        ) { id }
      }
    `;
    const vars = { amount, date, propertyId, description };
    const data = await request(token, query, vars);
    invalidatePropertiesCache();
    return data.action;
  },

  async updatePropertyPrice(token, { amount, date, propertyId, id, description }) {
    const query = `
      mutation($propertyId:ID!, $id:ID!, $amount:String!, $date:String!, $description:String) {
        action:updatePropertyPrice(
          propertyId: $propertyId,
          id: $id,
          date: $date,
          amount: $amount,
          description: $description
        ) { id }
      }
    `;
    const vars = { amount, date, propertyId, id, description };
    const data = await request(token, query, vars);
    invalidatePropertiesCache();
    return data.action;
  },

  async destroyPropertyPrice(token, { propertyId, id }) {
    const query = `
      mutation($propertyId:ID!, $id:ID!) {
        action:destroyPropertyPrice(
          propertyId: $propertyId,
          id: $id
        ) { id }
      }
    `;
    const data = await request(token, query, { propertyId, id });
    invalidatePropertiesCache();
    return data.action;
  },

  // ---------------------------------
  // Favourite
  // ---------------------------------

  async toggleIsFavourite(token, id, model) {
    const query = `
      mutation($id:Int!, $model:String!) {
        action:toggleIsFavourite(id: $id, model: $model)
      }
    `;
    const data = await request(token, query, { id, model }, { label: 'toggleIsFavourite' });
    // Мутация меняет isFavourite у категорий/проектов/активов/счетов — сбрасываем кэш
    clearAllCaches();
    return data.action;
  },

  // ---------------------------------
  // Hidden
  // ---------------------------------

  async toggleIsHidden(token, id, model) {
    const query = `
      mutation($id:Int!, $model:String!) {
        action:toggleIsHidden(id: $id, model: $model)
      }
    `;
    const data = await request(token, query, { id, model }, { label: 'toggleIsHidden' });
    // Мутация меняет isHidden у категорий/проектов/активов/счетов — сбрасываем кэш
    clearAllCaches();
    return data.action;
  },

  // ---------------------------------
  // Common
  // ---------------------------------

  async currencies(base = DEFAULT_CURRENCY) {
    const query = `
      query($base:String!) {
        items:currencies(base: $base) {
          id
          name
          displayName
          description
          usdRate
          baseRate
        }
      }
    `;
    const data = await request(undefined, query, { base });
    return data.items;
  },

  async colors() {
    const query = '{ items:colors { id name } }';
    const data = await request(undefined, query);
    return data.items;
  },
};

export default api;
