<script setup>
import { getData, setData } from 'nuxt-storage/local-storage';
import {
  IconSun,
  IconMoon,
  IconUserCircle,
} from '@tabler/icons-vue';

const appConfig = useAppConfig()
const route = useRoute();
const queryTheme = route.query.theme;
if (queryTheme && (queryTheme === 'light' || queryTheme === 'dark')) {
  appConfig.theme.dark = queryTheme === 'dark';
  setData('theme', queryTheme);
} else {
  appConfig.theme.dark = getData('theme') === 'dark';
}
// console.log('appConfig.theme.dark', appConfig.theme.dark);
const theme = appConfig.theme.dark ? 'dark' : 'light';

useHead({
  htmlAttrs: {
    'data-bs-theme': theme,
    'data-bs-theme-base': 'slate',
    'data-bs-theme-primary': 'indigo',
    'data-bs-theme-radius': '1.5',
  },
});

</script>

<template>
  <div class='page'>
    <header class='navbar navbar-expand-md d-print-none'>
      <div class='container-xl'>
        <NuxtLink to='/' class='navbar-brand navbar-brand-autodark'>
          {{ appConfig.title }}
        </NuxtLink>
        <div class='navbar-nav flex-row order-md-last'>
          <div class='d-md-flex'>
            <div class='nav-item me-2'>
              <a
                href='?theme=dark'
                class='nav-link px-0 hide-theme-dark'
                data-bs-toggle='tooltip'
                data-bs-placement='bottom'
                aria-label='Enable dark mode'
                data-bs-original-title='Enable dark mode'
              >
                <IconMoon size=20 />
              </a>
              <a
                href='?theme=light'
                class="nav-link px-0 hide-theme-light"
                data-bs-toggle="tooltip"
                data-bs-placement="bottom"
                aria-label="Enable light mode"
                data-bs-original-title="Enable light mode"
              >
                <IconSun size=20 />
              </a>
            </div>
            <div class='nav-item'>
              <NuxtLink to='/' class='btn btn-outline-primary'>
                <IconUserCircle size=20 />
                <span class='ms-2'>Вход</span>
              </NuxtLink>
            </div>
          </div>
        </div>
        <div id='navbar-menu' class='collapse navbar-collapse'>
          <ul class='navbar-nav'>
            <li class='nav-item'>
              <a class='nav-link' href='/'>
                <span class='nav-link-title'>Операции</span>
              </a>
            </li>
            <li class='nav-item'>
              <a class='nav-link' href='/'>
                <span class='nav-link-title'>Счета</span>
              </a>
            </li>
            <li class='nav-item'>
              <a class='nav-link' href='/'>
                <span class='nav-link-title'>Отчёты</span>
              </a>
            </li>
            <li class='nav-item'>
              <a class='nav-link' href='/'>
                <span class='nav-link-title'>Категории</span>
              </a>
            </li>
            <li class='nav-item'>
              <a class='nav-link' href='/'>
                <span class='nav-link-title'>Цели</span>
              </a>
            </li>
            <li class='nav-item'>
              <a class='nav-link' href='/'>
                <span class='nav-link-title'>Проекты</span>
              </a>
            </li>
            <li class='nav-item'>
              <a class='nav-link' href='/'>
                <span class='nav-link-title'>Имущество</span>
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

    <Footer />
  </div>
</template>
