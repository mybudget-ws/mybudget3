<script setup>
import { getData, setData } from 'nuxt-storage/local-storage';
import IconMoon from '@/components/icons/icon_moon';
import IconSun from '@/components/icons/icon_sun';

const appConfig = useAppConfig()
const route = useRoute();
const queryTheme = route.query.theme;
if (queryTheme && (queryTheme === 'light' || queryTheme === 'dark')) {
  appConfig.theme.dark = queryTheme === 'dark';
  setData('theme', queryTheme);
} else {
  appConfig.theme.dark = getData('theme') === 'dark';
}
console.log('appConfig.theme.dark', appConfig.theme.dark);
const theme = appConfig.theme.dark ? 'dark' : 'light';

useHead({
  htmlAttrs: {
    'data-bs-theme': theme,
  },
});

</script>

<template>
  <div class='page'>
    <header class='navbar navbar-expand-md d-print-none'>
      <div class='container-xl'>
        <div class='navbar-brand navbar-brand-autodark'>
          {{ appConfig.title }}
        </div>
        <div class='navbar-nav flex-row order-md-last'>
          <div class='d-md-flex'>
            <div class='nav-item'>
              <a
                href='?theme=dark'
                class='nav-link px-0 hide-theme-dark'
                data-bs-toggle='tooltip'
                data-bs-placement='bottom'
                aria-label='Enable dark mode'
                data-bs-original-title='Enable dark mode'
              >
                <IconMoon />
              </a>
              <a
                href='?theme=light'
                class="nav-link px-0 hide-theme-light"
                data-bs-toggle="tooltip"
                data-bs-placement="bottom"
                aria-label="Enable light mode"
                data-bs-original-title="Enable light mode"
              >
                <IconSun />
              </a>
            </div>
          </div>
        </div>
        <div id='navbar-menu' class='collapse navbar-collapse'>
          <ul class='navbar-nav'>
            <li class='nav-item'>
              <a class='nav-link' href='./'>
                <span>i</span>
                <span class='nav-link-title'>Home</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </header>

    <div class='page-wrapper'>
      <div class='page-body'>
        <div class='container-xl'>
          <NuxtPage />
        </div>
      </div>
    </div>

    <footer class='footer footer-transparent'>
      <div class='container-xl'>
        <div class='row text-center align-items-center'>
          <div class='col-12 col-lg-auto mt-3 mt-lg-0'>
            <ul class='list-inline list-inline-dots mb-0'>
              <li class='list-inline-item'>
                © {{ new Date().getFullYear() }}
                <a href='.' class='link-secondary'>{{ appConfig.title }}</a>.
                Все права защищены
              </li>
            </ul>
          </div>
          <div class='col-lg-auto ms-lg-auto'>
            <ul class='list-inline list-inline-dots mb-0'>
              <li class='list-inline-item'>
                <NuxtLink to='/terms' class='link-secondary'>
                  Пользовательское соглашение
                </NuxtLink>
              </li>
              <li class='list-inline-item'>
                <a
                  href='https://github.com/mybudget-ws/mybudget3'
                  target='_blank'
                  class='link-secondary'
                  rel='noopener'
                >Исходный код</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
