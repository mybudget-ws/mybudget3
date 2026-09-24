import { GraphQLClient } from 'graphql-request';
import { DEFAULT_CURRENCY } from '~/lib/consts';

const config = useRuntimeConfig();
const ENDPOINT = config.public.apiBaseUrl + '/graphql';

/**
 * Создаёт новый клиент GraphQL.
 * @param {string} token - токен авторизации.
 * @returns {GraphQLClient} клиент с настроенными заголовками.
 */
function client(token) {
  return new GraphQLClient(ENDPOINT, {
    headers: token ? { authorization: `Bearer ${token}` } : {}
  })
}

/**
 * Логирует GraphQL запрос и ответ в консоль, если запущена среда разработки.
 * @param {string} query - текст GraphQL запроса.
 * @param {any} data - данные ответа.
 */
function log(query, data) {
  if (import.meta.env.MODE === 'development') {
    console.log('[GraphQL]', query, data)
  }
}

/**
 * Базовая функция для получения данных графиков.
 * @param {string} token - токен авторизации.
 * @param {Object} filters - фильтры для графика.
 * @param {string} [filters.period] - период (например, 'CURRENT_MONTH', 'DAYS_30' и т.д.).
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
  const data = await client(token).request(query, vars);
  log(query, data);
  return data.chart;
}

const api = {
  /**
   * Выполняет вход пользователя в систему.
   * @param {string} email - email пользователя.
   * @param {string} password - пароль пользователя.
   * @returns {Promise<{email: string, token: string, defaultCurrency: {name: string}}>}
   *   объект пользователя с токеном и валютой по умолчанию.
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
    const vars = { email, password }
    const data = await client().request(query, vars)
    log('login', data)
    return data.user
  },

  /**
   * Регистрирует нового пользователя.
   * @param {string} email - email пользователя.
   * @param {string} password - пароль пользователя.
   * @returns {Promise<{user: {email: string, token: string}, error: string}|null>}
   *   результат регистрации: данные пользователя или сообщение об ошибке.
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
    const vars = { email, password }
    const { action } = await client().request(query, vars);
    log('signUp', action);
    return action;

  },

  /**
   * Получает полный профиль пользователя.
   * @param {string} token - токен авторизации.
   * @returns {Promise<{email: string, defaultCurrency: {id: number, name: string}}>}
   *   данные профиля пользователя.
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
    const data = await client(token).request(query)
    log('fetchProfile', data)
    return data.user
  },

  /**
   * Обновляет профиль пользователя (например, валюту по умолчанию).
   * @param {string} token - токен авторизации.
   * @param {Object} params - параметры обновления.
   * @param {string} params.currency - код валюты.
   * @returns {Promise<{email: string, token: string, defaultCurrency: {id: number, name: string}}>}
   *   обновленные данные пользователя.
   */
  async updateProfile(token, { currency }) {
    const query = `
      mutation($currency:String!) {
        action:updateUserProfile(
          currency: $currency
        ) { email token defaultCurrency { id name } }
      }
    `;
    const vars = { currency };
    const data = await client(token).request(query, vars);
    log('updateProfile', data);
    return data.action;
  },

  // Если ошибка в параметрах, то вернется ошибка в `error`.
  /**
   * Обновляет email пользователя.
   * @param {string} token - токен авторизации.
   * @param {Object} params - параметры обновления.
   * @param {string} params.password - текущий пароль пользователя.
   * @param {string} params.newEmail - новый email.
   * @returns {Promise<{user: {email: string, token: string}, error: string}|null>}
   *   результат обновления: данные пользователя или сообщение об ошибке.
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
    const vars = { password, newEmail };
    const { action } = await client(token).request(query, vars);
    log('updateEmail', action);
    return action;
  },

  // Если старый пароль не верный, то метод вернет null.
  /**
   * Обновляет пароль пользователя.
   * @param {string} token - токен авторизации.
   * @param {Object} params - параметры обновления.
   * @param {string} params.password - текущий пароль пользователя.
   * @param {string} params.newPassword - новый пароль.
   * @returns {Promise<{email: string, token: string}|null>}
   *   обновленные данные пользователя или null, если старый пароль неверен.
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
    const data = await client(token).request(query, vars);
    log('updatePassword', data);

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
   * @param {Object} filters - фильтры для графика.
   * @param {string} [filters.period] - период (например, 'CURRENT_MONTH', 'DAYS_30' и т.д.).
   * @param {number[]} [filters.accountIds] - список ID счетов.
   * @param {number[]} [filters.categoryIds] - список ID категорий.
   * @param {number[]} [filters.projectIds] - список ID проектов.
   * @param {number[]} [filters.propertyIds] - список ID активов.
   * @param {string[]} [filters.kinds] - типы операций ('INCOME', 'EXPENSE', 'TRANSFER').
   * @returns {Promise<any>} данные графика балансов.
   */
  async chartBalances(token, filters) {
    return await chartBase(token, filters, 'chartBalances');
  },

  /**
   * Получает данные для графика транзакций.
   * @param {string} token - токен авторизации.
   * @param {Object} filters - фильтры для графика.
   * @param {string} [filters.period] - период (например, 'CURRENT_MONTH', 'DAYS_30' и т.д.).
   * @param {number[]} [filters.accountIds] - список ID счетов.
   * @param {number[]} [filters.categoryIds] - список ID категорий.
   * @param {number[]} [filters.projectIds] - список ID проектов.
   * @param {number[]} [filters.propertyIds] - список ID активов.
   * @param {string[]} [filters.kinds] - типы операций ('INCOME', 'EXPENSE', 'TRANSFER').
   * @returns {Promise<any>} данные графика транзакций.
   */
  async chartTransactions(token, filters) {
    return await chartBase(token, filters, 'chartTransactions');
  },

  // ---------------------
  // Dashboard
  // ---------------------
  /**
   * Получает данные для панели управления (dashboard).
   * @param {string} token - токен авторизации.
   * @returns {Promise<any>} объект с данными дашборда (текущий месяц, расходы, доходы, счета, активы и графики).
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
    const data = await client(token).request(query);
    log(query, data);
    return data.dashboard;
  },

  // ---------------------
  // Transactions
  // ---------------------

  /**
   * Получает операцию
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

    const data = await client(token).request(query, { id });
    log('transaction', data);
    return data.item;
  },

  // Возможные параметры для filters.kinds: ['INCOME', 'EXPENSE', 'TRANSFER']
  // можно перадть пустой массив, тогда будут все операции (без фильтрации),
  // а можно передать и любую комбинацию:
  //
  // 1. Только доходы - filters.kinds: ['INCOME']
  // 2. Только расходы - filters.kinds: ['EXPENSE']
  // 3. Только переводы - filters.kinds: ['TRANSFER']
  // 4. Можно передать несколько разных вариантов, например для доходов
  //    и расходов будет - filters.kinds: ['INCOME', 'EXPENSE'] и т.д.
  /**
   * Получает список операций с поддержкой пагинации и фильтрации.
   * @param {string} token - токен авторизации.
   * @param {Object} params - параметры запроса.
   * @param {number} [params.page] - номер страницы.
   * @param {number} [params.perPage] - количество элементов на страницу.
   * @param {Object} params.filters - фильтры для списка операций.
   * @param {number[]} [params.filters.accountIds] - список ID счетов.
   * @param {number[]} [params.filters.categoryIds] - список ID категорий.
   * @param {number[]} [params.filters.projectIds] - список ID проектов.
   * @param {number[]} [params.filters.propertyIds] - список ID активов.
   * @param {string[]} [params.filters.kinds] - типы операций ('INCOME', 'EXPENSE', 'TRANSFER').
   * @param {string} [params.filters.description] - поисковый запрос по описанию.
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
    const vars = { page, perPage, ...filters };
    const data = await client(token).request(query, vars);
    log('transactions', data);
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
      accountId: accountId.toString(),
      projectId: (projectId && projectId.toString() || null),
      propertyId: (propertyId && propertyId.toString() || null)
    };
    const data = await client(token).request(query, vars);
    log('createTransaction', data);
    return data.action;
  },

  /**
   * Обновляет существующую операцию.
   * @param {string} token - токен авторизации.
   * @param {Object} params - параметры обновления.
   * @param {string|number} params.id - ID операции.
   * @param {string} params.amount - сумма операции.
   * @param {boolean} params.isIncome - является ли операция доходом.
   * @param {string} params.date - дата операции.
   * @param {string} [params.description] - описание операции.
   * @param {number|string} params.accountId - ID счёта.
   * @param {number[]} params.categoryIds - список ID категорий.
   * @param {number|string} [params.projectId] - ID проекта.
   * @param {number|string} [params.propertyId] - ID актива.
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
      accountId: accountId.toString(),
      projectId: (projectId && projectId.toString() || null),
      propertyId: (propertyId && propertyId.toString() || null)
    };
    const data = await client(token).request(query, vars);
    log('updateTransaction', data);

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
    const data = await client(token).request(query, { id });
    log('destroyTransaction', data);
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
      accountIdSrc: accountIdSrc.toString(),
      accountIdDst: accountIdDst.toString(),
      date,
      description
    };
    const data = await client(token).request(query, vars);
    log('createTransactionTransfer', data);
    return data.action;
  },

  // ---------------------
  // Accounts
  // ---------------------
  /**
   * Получает список счетов пользователя.
   * @param {string} token - токен авторизации.
   * @returns {Promise<Array<Object>>} список счетов.
   */
  async accounts(token) {
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
    const data = await client(token).request(query);
    log(query, data);
    return data.items;
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
    const data = await client(token).request(query, vars);
    log('createAccount', data);
    return data.createAccount;
  },

  /**
   * Обновляет существующий счёт.
   * @param {string} token - токен авторизации.
   * @param {Object} params - параметры обновления.
   * @param {string|number} params.id - ID счёта.
   * @param {string} params.name - название счёта.
   * @param {string} params.color - цвет счёта.
   * @param {string} params.kind - тип счёта.
   * @param {string} params.currency - код валюты.
   * @param {string} [params.description] - описание счёта.
   * @param {number} params.position - позиция в списке.
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
    const data = await client(token).request(query, vars);
    log('updateAccount', data);
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
    const data = await client(token).request(query, { id });
    log('destroyAccount', data);
    return data.action;
  },

  // ---------------------
  // Categories
  // ---------------------
  /**
   * Получает список категорий пользователя.
   * @param {string} token - токен авторизации.
   * @returns {Promise<Array<Object>>} список категорий.
   */
  async categories(token) {
    const query = '{ items:categories { id name color isFavourite isHidden } }';
    const data = await client(token).request(query);
    log(query, data);
    return data.items;
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
    const vars = { name, color };
    const data = await client(token).request(query, vars);
    log('createCategory', data);
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
    const vars = { id, name, color };
    const data = await client(token).request(query, vars);
    log('updateCategory', data);
    return data.action;
  },

  async destroyCategory(token, id) {
    const query = 'mutation($id:ID!) { action:destroyCategory(id: $id) { id } }';
    const data = await client(token).request(query, { id });
    log('destroyCategory', data);
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
    const data = await client(token).request(query);
    log(query, data);
    return data.items;
  },

  async createGoal(
    token,
    { name, amount, dueDateOn, accountIds, position }
  ) {
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
    const data = await client(token).request(query, vars);
    log('createGoal', data);
    return data.action;
  },

  async updateGoal(
    token,
    { id, name, amount, dueDateOn, accountIds, position }
  ) {
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
    const data = await client(token).request(query, vars);
    log('updateGoal', data);
    return data.action;
  },

  async destroyGoal(token, id) {
    const query = 'mutation($id:ID!) { action:destroyGoal(id: $id) { id } }';
    const data = await client(token).request(query, { id });
    log('destroyGoal', data);
    return data.action;
  },

  // ---------------------------------
  // Project
  // ---------------------------------
  async projects(token, options = {}) {
    const additionalProps = `
      balances {
        amount amountBase
        currency { name }
        currencyBase { name }
      }
    `;

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
          ${ options.allData ? additionalProps : '' }
          isTransactionPresent
          budget
          budgetCurrency {
            id
            name
            displayName
          }
        }
      }
    `;
    const data = await client(token).request(query);
    log(query, data);
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
    const data = await client(token).request(query, vars);
    log(query, data);
    return data.action;
  },

  /**
   * Обновляет существующий проект.
   * @param {string} token - токен авторизации.
   * @param {Object} params - параметры обновления проекта.
   * @param {string|number} params.id - ID проекта.
   * @param {string} params.name - название проекта.
   * @param {number} params.position - позиция проекта.
   * @param {number} [params.budget] - бюджет проекта.
   * @param {number} [params.budgetCurrencyId] - ID валюты бюджета проекта.
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
    const data = await client(token).request(query, vars);
    log(query, data);
    return data.action;
  },

  async destroyProject(token, id) {
    const query = `
      mutation($id:ID!) { action:destroyProject(id: $id) { id } }
    `;
    const data = await client(token).request(query, { id });
    log('destroyProject', data);
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
        currency { name }
        budgetCurrency {
          id
          name
          displayName
        }
        projectItems {
          id name position isDone
        }
      }
    }`;

    const vars = { id };
    const data = await client(token).request(query, vars);
    log(query, data);

    return data.item;
  },

  /**
   * Создаёт новый элемент проекта.
   * @param {string} token - токен авторизации.
   * @param {Object} params - параметры создания элемента.
   * @param {string|number} params.projectId - ID проекта.
   * @param {string} params.name - название элемента.
   * @returns {Promise<{projectItem: Object, errors: string[]}>} объект с созданным элементом и списком ошибок.
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
          }
          errors
        }
      }
    `;
    const vars = { projectId: projectId.toString(), name };
    const data = await client(token).request(query, vars);
    log(query, data);
    return data.action;
  },

  /**
   * Обновляет существующий элемент проекта.
   * @param {string} token - токен авторизации.
   * @param {Object} params - параметры обновления элемента.
   * @param {string|number} params.id - ID элемента.
   * @param {string} [params.name] - новое название.
   * @param {number} [params.position] - новая позиция.
   * @param` {boolean} [params.isDone] - статус выполнения элемента.
   * @returns {Promise<{projectItem: Object, errors: string[]}>} объект с обновлённым элементом и списком ошибок.
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
    const vars = { id: id.toString(), name, position, isDone };
    const data = await client(token).request(query, vars);
    log(query, data);
    return data.action;
  },

  /**
   * Удаляет элемент проекта.
   * @param {string} token - токен авторизации.
   * @param {string|number} id - ID элемента.
   * @returns {Promise<{success: boolean, errors: string[]}>} результат удаления.
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
    const vars = { id: id.toString() };
    const data = await client(token).request(query, vars);
    log(query, data);
    return data.action;
  },

  // ---------------------------------
  // Properties
  // ---------------------------------
  async properties(token, options = {}) {
    const additionalProps = `
      amount:price
      kind
      position
      currency { name }
    `;
    const query = `
      {
        items:properties {
          id name color isHidden
          ${ options.allData ? additionalProps : '' }
          isTransactionPresent
        }
      }
    `;
    const data = await client(token).request(query);
    log(query, data);
    return data.items;
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
    const data = await client(token).request(query, vars);
    log(query, data);

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
    const data = await client(token).request(query, vars);
    log(query, data);

    return data.action;
  },

  async destroyProperty(token, id) {
    const query = `
      mutation($id:ID!) { action:destroyProperty(id: $id) { id } }
    `;
    const data = await client(token).request(query, { id });
    log(query, data);

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
    const vars = { id };
    const data = await client(token).request(query, vars);
    log(query, data);

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
    const data = await client(token).request(query, vars);
    log(query, data);

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
    const data = await client(token).request(query, vars);
    log(query, data);

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
    const data = await client(token).request(query, { propertyId, id });
    log(query, data);

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
    const data = await client(token).request(query, { id, model });
    log('toggleIsFavourite', data);

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
    const data = await client(token).request(query, { id, model });
    log('toggleIsHidden', data);
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
    const vars = { base };
    const data = await client().request(query, vars);
    log(query, data);

    return data.items;
  },

  async colors() {
    const query = '{ items:colors { id name } }';
    const data = await client().request(query);
    log(query, data);

    return data.items;
  },
};

export default api;
