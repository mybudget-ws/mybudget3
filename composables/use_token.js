export function useToken() {
  const get = () => localStorage.getItem('token')
  const set = (token) => localStorage.setItem('token', token)
  const clear = () => localStorage.removeItem('token')

  return { get, set, clear }
}
