<script setup>
definePageMeta({
  middleware: ['authenticated']
})
</script>

<template>
  <div class='card'>
    <div class='row g-0'>
      <ProfileMenu />
      <div class='col-sm-12 col-lg-9 col-xl-10'>
        <div class='card-body'>
          <h1>Написать разработчикам</h1>
          <p class='text-secondary'>
            Доброго времени суток, меня зовут Александр, автор и разработчик этого сайта.<br>
            Если у вас возникли вопросы или появились проблемы с работой сайта,<br>
            пожалуйста, пишите на почту <a href='mailto:alexander.kalinichev@gmail.com'>alexander.kalinichev@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>