<script setup>
import { getData, setData } from 'nuxt-storage/local-storage';
import {
  IconSun,
  IconMoon,
  IconReceipt,
  IconChartHistogram,
  IconTags,
  IconKey,
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
  // https://nuxt.com/modules/storage#api
  setData('theme', queryTheme, 100, 'd');
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
  bodyAttrs: {
    class: 'sticky-top', // 'layout-fluid',
  },
});
</script>

<template>
  <div class='page'>
    <header class='navbar navbar-expand-md d-print-none'>
      <div class='container-xxl'>
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
                v-tooltip="'Включить темный режим'"
              >
                <IconMoon size=20 stroke-width=1 />
              </a>
              <a
                href='?theme=light'
                class='nav-link px-0 hide-theme-light'
                v-tooltip="'Включить светлый режим'"
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
              <NuxtLink class='nav-link' href='/'>
                <IconChartHistogram size=20 stroke-width=1 />
                <span class='nav-link-title ms-1'>Отчёты</span>
              </NuxtLink>
            </li>
            <li class='nav-item'>
              <NuxtLink class='nav-link' href='/accounts'>
                <IconWallet size=20 stroke-width=1 />
                <span class='nav-link-title ms-1'>Счета</span>
              </NuxtLink>
            </li>
            <li class='nav-item'>
              <NuxtLink class='nav-link' href='/categories'>
                <IconTags size=20 stroke-width=1 />
                <span class='nav-link-title ms-1'>Категории</span>
              </NuxtLink>
            </li>
            <li class='nav-item'>
              <NuxtLink class='nav-link' href='/goals'>
                <IconTargetArrow size=20 stroke-width=1 />
                <span class='nav-link-title ms-1'>Цели</span>
              </NuxtLink>
            </li>
            <li class='nav-item'>
              <NuxtLink class='nav-link' href='/projects'>
                <IconBulb size=20 stroke-width=1 />
                <span class='nav-link-title ms-1'>Проекты</span>
              </NuxtLink>
            </li>
            <li class='nav-item'>
              <NuxtLink class='nav-link' href='/'>
                <IconKey size=20 stroke-width=1 />
                <span class='nav-link-title ms-1'>Имущество</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </header>

    <div class='page-wrapper'>
      <div class='page-body'>
        <div class='container-xxl'>
          <NuxtPage />
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<!-- tabler.io fixes -->
<style>
.table-responsive {
  border-bottom-right-radius: var(--tblr-border-radius-lg);
  border-bottom-left-radius: var(--tblr-border-radius-lg);
}
</style>
