export default defineNuxtRouteMiddleware((to, from) => {
  const { isSignedIn } = useAuth();

  if (isSignedIn.value) {
    if (to.path === '/sign_in/') return navigateTo('/')
    if (to.path === '/sign_in') return navigateTo('/')
    if (to.path === '/sign_up/') return navigateTo('/')
    if (to.path === '/sign_up') return navigateTo('/')

  } else {
    if (to.path === '/profile/') return navigateTo('/sign_in/')
    if (to.path === '/profile') return navigateTo('/sign_in/')
  }
});
