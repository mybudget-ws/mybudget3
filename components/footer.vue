<script setup>
const appConfig = useAppConfig()
</script>

<template>
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
</template>
