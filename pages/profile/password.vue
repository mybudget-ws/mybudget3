<template> 
  <div class="card"> 
    <div class='row g-0'> <ProfileMenu />
      <div class='col-sm-12 col-lg-9 col-xl-10'>
        <div class="card-body">
          <h1>Изменить пароль</h1>
            <div class="col-4">
              <div class="mb-3">
                <input type="password" class="form-control" placeholder="Текущий пароль" >
              </div>
              <div class="mb-3">
                <input type="password" class="form-control" placeholder="Новый пароль" >
                <span class="helper-text">Минимум 6 символов</span>
              </div>
            </div>
            <button type="submit" class="btn btn-primary">Сохранить</button>
        </div>
      </div>
    </div>
  </div>
</template>