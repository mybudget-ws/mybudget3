<script setup>
import { getData, setData } from 'nuxt-storage/local-storage';
import { Collapse } from '@tabler/core/dist/js/tabler.min.js'
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
import { useDevice } from '~/composables/use_device';

const appConfig = useAppConfig()
const route = useRoute();
const { isSignedIn } = useAuth();
const { isMobile } = useDevice();

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
const navbarMenu = ref(null);
const navbarToggler = ref(null);
let closeAfterOpen = false;

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

function closeMenu() {
  const el = navbarMenu.value;
  if (!isMobile.value || !el) return;

  // { toggle: false } не даёт Bootstrap открыть меню при первом создании экземпляра.
  const collapse = Collapse.getOrCreateInstance(el, { toggle: false });

  // Класс `collapsing` есть и при открытии, и при закрытии,
  // поэтому открытие определяем по aria-expanded на кнопке-переключателе.
  const isOpening =
    el.classList.contains('collapsing') &&
    navbarToggler.value?.getAttribute('aria-expanded') === 'true';

  if (el.classList.contains('show')) {
    collapse.hide();
  } else if (isOpening && !closeAfterOpen) {
    // Клик пришёлся на анимацию открытия: ждём её конца и закрываем
    closeAfterOpen = true;
    el.addEventListener(
      'shown.bs.collapse',
      () => {
        closeAfterOpen = false;
        collapse.hide();
      },
      { once: true }
    );
  }
}

function onMenuClick(event) {
  // Реагируем только на клик по ссылке, а не по пустому месту в меню
  if (event.target.closest('a')) {
    closeMenu();
  }
}

// Закрываем меню и при других переходах (например, кнопка «Назад»)
watch(() => route.fullPath, closeMenu)
</script>

<template>
  <div class='page'>
    <header class='navbar navbar-expand-md d-print-none'>
      <div class='container-xxl'>
        <button
          ref='navbarToggler'
          class='navbar-toggler'
          type='button'
          data-bs-toggle='collapse'
          data-bs-target='#navbar-menu'
          aria-controls='navbar-menu'
          aria-expanded='false'
          aria-label='Toggle navigation'
        >
          <span class='navbar-toggler-icon' />
        </button>

        <NuxtLink to='/' class='navbar-brand navbar-brand-autodark me-3'>
          {{ appConfig.title }}
        </NuxtLink>

        <div class='navbar-nav flex-row order-md-last'>
          <div class='d-flex'>
            <div class='nav-item me-2'>
              <a
                v-tooltip='"Включить темный режим"'
                href='?theme=dark'
                class='nav-link px-0 hide-theme-dark'
              >
                <IconMoon size='20' stroke-width='1' />
              </a>
              <a
                v-tooltip='"Включить светлый режим"'
                href='?theme=light'
                class='nav-link px-0 hide-theme-light'
              >
                <IconSun size='20' stroke-width='1' />
              </a>
            </div>
            <div class='nav-item'>
              <NuxtLink v-if='!isSignedIn' to='/sign_in' class='btn btn-outline-primary'>
                <IconUserCircle size='20' stroke-width='1' />
                <span class='ms-2 d-none d-xl-block'>Вход</span>
              </NuxtLink>
              <NuxtLink v-if='isSignedIn' to='/profile' class='nav-link'>
                <IconUserCircle stroke-width='1' />
              </NuxtLink>
            </div>
          </div>
        </div>

        <div
          v-if='isSignedIn'
          id='navbar-menu'
          ref='navbarMenu'
          class='collapse navbar-collapse'
        >
          <ul class='navbar-nav' @click='onMenuClick'>
            <li class='nav-item'>
              <NuxtLink class='nav-link' to='/transactions'>
                <IconReceipt size='20' stroke-width='1' />
                <span class='nav-link-title ms-1'>Операции</span>
              </NuxtLink>
            </li>
            <li class='nav-item'>
              <NuxtLink class='nav-link' to='/reports'>
                <IconChartHistogram size='20' stroke-width='1' />
                <span class='nav-link-title ms-1'>Отчёты</span>
              </NuxtLink>
            </li>
            <li class='nav-item'>
              <NuxtLink class='nav-link' to='/accounts'>
                <IconWallet size='20' stroke-width='1' />
                <span class='nav-link-title ms-1'>Счета</span>
              </NuxtLink>
            </li>
            <li class='nav-item'>
              <NuxtLink class='nav-link' to='/categories'>
                <IconTags size='20' stroke-width='1' />
                <span class='nav-link-title ms-1'>Категории</span>
              </NuxtLink>
            </li>
            <li class='nav-item'>
              <NuxtLink class='nav-link' to='/goals'>
                <IconTargetArrow size='20' stroke-width='1' />
                <span class='nav-link-title ms-1'>Цели</span>
              </NuxtLink>
            </li>
            <li class='nav-item'>
              <NuxtLink class='nav-link' to='/projects'>
                <IconBulb size='20' stroke-width='1' />
                <span class='nav-link-title ms-1'>Проекты</span>
              </NuxtLink>
            </li>
            <li class='nav-item'>
              <NuxtLink class='nav-link' to='/properties'>
                <IconKey size='20' stroke-width='1' />
                <span class='nav-link-title ms-1'>Имущество</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </header>

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <Footer />
  </div>
</template>

<!-- tabler.io fixes -->
<style>
/*
.table-responsive {
  border-bottom-right-radius: var(--tblr-border-radius-lg);
  border-bottom-left-radius: var(--tblr-border-radius-lg);
}
*/

tbody > tr:last-child {
  border-bottom-color: rgb(0, 0, 0, 0);
}

.badges-list > .badge {
  min-height: 1.375rem;
}

.badge.cursor-pointer:hover {
  opacity: 0.8;
}
</style>
