<script setup>
import { getData, setData } from 'nuxt-storage/local-storage';
import {
  IconSun,
  IconMoon,
  IconReceipt,
  IconChartHistogram,
  IconTags,
  IconShieldLock,
  IconBulb,
  IconTargetArrow,
  IconWallet,
  IconUserCircle,
} from '@tabler/icons-vue';

const appConfig = useAppConfig()
const route = useRoute();
const { isSignedIn } = useAuth();

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
    <header class='navbar navbar-expand-md sticky-top d-print-none'>
      <div class='container-xl'>
        <button
          class='navbar-toggler'
          type='button'
          data-bs-toggle='collapse'
          data-bs-target='#navbar-menu'
          aria-controls='navbar-menu'
          aria-expanded=false
          aria-label='Toggle navigation'
        >
          <span class="navbar-toggler-icon" />
        </button>

        <NuxtLink to='/' class='navbar-brand navbar-brand-autodark me-3'>
          {{ appConfig.title }}
        </NuxtLink>

        <div class='navbar-nav flex-row order-md-last'>
          <div class='d-flex'>
            <div class='nav-item me-2'>
              <a
                href='?theme=dark'
                class='nav-link px-0 hide-theme-dark'
                data-bs-toggle='tooltip'
                data-bs-placement='bottom'
                aria-label='Включить темный режим'
                data-bs-original-title='Включить темный режим'
              >
                <IconMoon size=20 stroke-width=1 />
              </a>
              <a
                href='?theme=light'
                class='nav-link px-0 hide-theme-light'
                data-bs-toggle='tooltip'
                data-bs-placement='bottom'
                aria-label='Включить светлый режим'
                data-bs-original-title='Включить светлый режим'
              >
                <IconSun size=20 stroke-width=1 />
              </a>
            </div>
            <div class='nav-item'>
              <NuxtLink v-if='!isSignedIn' to='/sign_in' class='btn btn-outline-primary'>
                <IconUserCircle size=20 stroke-width=1 />
                <span class='ms-2 d-none d-xl-block'>Вход</span>
              </NuxtLink>
              <NuxtLink v-if='isSignedIn' to='/profile' class='nav-link'>
                <IconUserCircle stroke-width=1 />
              </NuxtLink>
            </div>
          </div>
        </div>
        <div id='navbar-menu' class='collapse navbar-collapse'>
          <ul class='navbar-nav'>
            <li class='nav-item'>
              <NuxtLink class='nav-link' href='/transactions'>
                <IconReceipt size=20 stroke-width=1 />
                <span class='nav-link-title ms-1'>Операции</span>
              </NuxtLink>
            </li>
            <li class='nav-item'>
              <a class='nav-link' href='/'>
                <IconWallet size=20 stroke-width=1 />
                <span class='nav-link-title ms-1'>Счета</span>
              </a>
            </li>
            <li class='nav-item'>
              <a class='nav-link' href='/'>
                <IconChartHistogram size=20 stroke-width=1 />
                <span class='nav-link-title ms-1'>Отчёты</span>
              </a>
            </li>
            <li class='nav-item'>
              <a class='nav-link' href='/'>
                <IconTags size=20 stroke-width=1 />
                <span class='nav-link-title ms-1'>Категории</span>
              </a>
            </li>
            <li class='nav-item'>
              <a class='nav-link' href='/'>
                <IconTargetArrow size=20 stroke-width=1 />
                <span class='nav-link-title ms-1'>Цели</span>
              </a>
            </li>
            <li class='nav-item'>
              <a class='nav-link' href='/'>
                <IconBulb size=20 stroke-width=1 />
                <span class='nav-link-title ms-1'>Проекты</span>
              </a>
            </li>
            <li class='nav-item'>
              <a class='nav-link' href='/'>
                <IconShieldLock size=20 stroke-width=1 />
                <span class='nav-link-title ms-1'>Имущество</span>
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
