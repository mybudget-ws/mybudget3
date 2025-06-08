<script setup>
const appConfig = useAppConfig()
const currentYear = new Date().getFullYear();
</script>

<template>
  <div class='page'>
    <header class='navbar navbar-expand-md d-print-none'>
      <div class='container-xl'>
        <div class='navbar-brand navbar-brand-autodark'>
          {{ appConfig.title }}
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
                © {{ currentYear }}
                <a href='.' class='link-secondary'>{{ appConfig.title }}</a>.
                Все права защищены
              </li>
            </ul>
          </div>
          <div class='col-lg-auto ms-lg-auto'>
            <ul class='list-inline list-inline-dots mb-0'>
              <li class='list-inline-item'>
                <a href='./license.html' class='link-secondary'>License</a>
              </li>
              <li class='list-inline-item'>
                <a
                  href='https://github.com/mybudget-ws/mybudget3'
                  target='_blank'
                  class='link-secondary'
                  rel='noopener'
                >Source code</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
