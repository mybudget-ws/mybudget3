import { GraphQLClient } from 'graphql-request';

const config = useRuntimeConfig();
const ENDPOINT = config.public.apiBaseUrl + '/graphql';

function client(token) {
  return new GraphQLClient(ENDPOINT, {
    headers: token ? { authorization: `Bearer ${token}` } : {}
  })
}

function log(query, data) {
  if (import.meta.env.MODE === 'development') {
    console.log('[GraphQL]', query, data)
  }
}

const api = {
  async login(email, password) {
    const query = `
      query($email:String!, $password:String!) {
        user:signIn(email: $email, password: $password) {
          email
          token
          defaultCurrency { name }
        }
      }
    `
    const vars = { email, password }
    const data = await client().request(query, vars)
    log('login', data)
    return data.user
  },

  async fetchProfile(token) {
    const query = `
      query {
        user:fullProfile { email defaultCurrency { id name } }
      }
    `
    const data = await client(token).request(query)
    log('fetchProfile', data)
    return data.user
  },

  async properties(token, options = {}) {
    const additionalProps = `
      price
      kind
      currency { name }
    `;
    const query = `
      {
        items:properties {
          id name color isHidden
          ${ options.allData ? additionalProps : '' }
        }
      }
    `;
    const data = await client(token).request(query);
    log(query, data);
    return data.items;
  },

  async transactions(token, { page, perPage, filters }) {
    const query = `
      query(
        $page:Int, $perPage:Int,
        $accountIds:[Int!], $categoryIds:[Int!],
        $projectIds:[Int!], $propertyIds:[Int!]
      ) {
        items:transactions(
          page: $page,
          perPage: $perPage,
          accountIds: $accountIds,
          categoryIds: $categoryIds,
          projectIds: $projectIds,
          propertyIds: $propertyIds
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
    const { accountIds, categoryIds, projectIds, propertyIds } = filters;
    const vars = { page, perPage, accountIds, categoryIds, projectIds, propertyIds };
    const data = await client(token).request(query, vars);
    log('transactions', data);
    return data.items;
  },

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

  async destroyTransaction(token, id) {
    const query = `
      mutation($id:ID!) { action:destroyTransaction(id: $id) { id } }
    `;
    const data = await client(token).request(query, { id });
    log('destroyTransaction', data);
    return data.action;
  },

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
        currency { name }
      }
    }`;
    const data = await client(token).request(query);
    log(query, data);
    return data.items;
  },

  async createAccount(token, { name, color, kind, currency }) {
    const query = `
      mutation($name:String!, $color:String!, $kind:String!, $currency:String!) {
        createAccount(
          name: $name,
          color: $color,
          kind: $kind,
          currency: $currency
        ) { id name color balance currency { name } }
      }
    `;
    const vars = { name, color, kind, currency };
    const data = await client(token).request(query, vars);
    log('createAccount', data);
    return data.createAccount;
  },

  async updateAccount(token, { id, name, color, kind, currency, position }) {
    const query = `
      mutation(
        $id:ID!,
        $name:String!,
        $color:String!,
        $kind:String!,
        $currency:String!,
        $position:Int!
      ) {
        action:updateAccount(
          id: $id,
          name: $name,
          color: $color,
          kind: $kind,
          currency: $currency,
          position: $position
        ) { id name color currency { name } position }
      }
    `;
    const vars = { id, name, color, kind, currency, position };
    const data = await client(token).request(query, vars);
    log('updateAccount', data);
    return data.action;
  },

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
          ${ options.allData ? additionalProps : '' }
        }
      }
    `;
    const data = await client(token).request(query);
    log(query, data);
    return data.items;
  },

  async createProject(token, { name, color }) {
    const query = `
      mutation($name:String!, $color:String!) {
        action:createProject(
          name: $name,
          color: $color
        ) { id }
      }
    `;
    const vars = { name, color };
    const data = await client(token).request(query, vars);
    log('createProject', data);
    return data.action;
  },

  async updateProject(token, { id, name, color, position }) {
    const query = `
      mutation($id:ID!, $name:String!, $color:String!, $position:Int!) {
        action:updateProject(
          id: $id,
          name: $name,
          color: $color,
          position: $position
        ) { id }
      }
    `;
    const vars = { id, name, color, position };
    const data = await client(token).request(query, vars);
    log('updateProject', data);
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
};

export default api;
