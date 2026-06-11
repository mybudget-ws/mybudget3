<template>
  <div class='col-sm-12 col-lg-3 col-xl-2 border-end'>
    <div class='card-body'>
      <h4 class='subheader'>Настройки</h4>
      <div class='list-group list-group-transparent'>
        <NuxtLink
          class='list-group-item list-group-item-action'
          exact-active-class='active'
          to='/profile/'>Профиль</NuxtLink>  
        <NuxtLink
          class='list-group-item list-group-item-action'
          exact-active-class='active'
          to='/profile/email'>Почта</NuxtLink>
          <NuxtLink
          class='list-group-item list-group-item-action'
          exact-active-class='active'
          to='/profile/password'>Пароль</NuxtLink>
        <NuxtLink
          class='list-group-item list-group-item-action'
          exact-active-class='active'
          to='/profile/support'>Поддержка</NuxtLink>  
      </div>
    </div>
  </div>
</template>
