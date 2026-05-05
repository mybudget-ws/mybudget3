<template>
  <div class="card">
    <div class='row g-0'>
      <ProfileMenu />
      <div class='col-sm-12 col-lg-9 col-xl-10'>
        <div class="card-body">
          <h1>Изменить E-mail</h1>
          <div class="col-4">
            <div class="mb-3">
              <input
                type="email"
                class="form-control"
                placeholder="E-mail"
              >
            </div>
            <div class="mb-3">
              <input
                type="email"
                class="form-control"
                placeholder="Новый E-mail"
              >
            </div>
            <div class="mb-3">
              <input
                type="password"
                class="form-control"
                placeholder="Пароль"
              >
            </div>
          </div>
          <button type="submit" class="btn btn-primary">Сохранить</button>
        </div>
      </div>
    </div>
  </div>
</template>