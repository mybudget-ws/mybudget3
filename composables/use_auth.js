export const useAuth = () => {
  const token = useState('auth_token', () => {
    return localStorage.getItem('token') || ''
  })

  watch(token, (newToken) => {
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  })

  const isSignedIn = computed(() => !!token.value)

  return {
    token,
    isSignedIn,
    signIn: (newToken) => (token.value = newToken),
    signOut: () => (token.value = '')
  }
}
