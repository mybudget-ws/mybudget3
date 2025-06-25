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
};

export default api;
