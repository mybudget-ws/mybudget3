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

  async categories(token) {
    const query = '{ items:categories { id name color isFavourite isHidden } }';
    const data = await client(token).request(query);
    log(query, data);
    return data.items;
  },

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
          id name isHidden color
          ${ options.allData ? additionalProps : '' }
        }
      }
    `;
    const data = await client(token).request(query);
    log(query, data);
    return data.items;
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
};

export default api;
