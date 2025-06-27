<script setup>
import {
  IconSearch,
  IconArrowDown,
  IconArrowsRightLeft,
  IconArrowUp,
} from '@tabler/icons-vue';
</script>

<template>
  <!-- https://tabler.io/admin-template/preview -->
  <div class='card'>
    <div class='card-table'>
      <div class='card-header pe-0'>
        <div class='row w-full align-items-center'>
          <div class='col'>
            <!--h1 class='card-title mb-0'>Операции</h1-->
            <h2 class='mb-0'>Операции</h2>
            <!--p class="text-secondary m-0">Table description.</p-->
          </div>
          <div class="col-md-auto col-sm-12">
            <div class="ms-auto d-flex flex-wrap btn-list">
              <div class="input-group input-group-flat w-auto">
                <span class="input-group-text">
                  <IconSearch size=20 stroke-width=1 />
                </span>
                <input id="advanced-table-search" type="text" class="form-control" autocomplete="off">
                <!--span class="input-group-text">
                  <kbd>ctrl + K</kbd>
                </span-->
              </div>
              <a href="#" class='btn btn-outline-green'>
                <IconArrowUp stroke-width=2 />
              </a>
              <a href="#" class='btn btn-outline-secondary'>
                <IconArrowsRightLeft stroke-width=2 />
              </a>
              <a href="#" class='btn btn-primary'>
                <IconArrowDown stroke-width=2 />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class='advanced-table'>
        <div class='table-responsive'>
          <table class='table table-vcenter table-selectable'>
            <thead>
              <tr>
                <th class="w-1"></th>
                <th>
                  <button class="table-sort d-flex justify-content-between" data-sort="sort-name">Name</button>
                </th>
                <th>
                  <button class="table-sort d-flex justify-content-between" data-sort="sort-city">City</button>
                </th>
                <th>
                  <button class="table-sort d-flex justify-content-between" data-sort="sort-status">Status</button>
                </th>
                <th>
                  <button class="table-sort d-flex justify-content-between" data-sort="sort-date">Start date</button>
                </th>
                <th>
                  <button class="table-sort d-flex justify-content-between" data-sort="sort-tags">Tags</button>
                </th>
                <th>
                  <button class="table-sort d-flex justify-content-between" data-sort="sort-category">Category</button>
                </th>
              </tr>
            </thead>
            <tbody class='table-tbody'>
            </tbody>
          </table>
        </div>
        <div class='card-footer d-flex align-items-center'>
          <!--div class='dropdown'>
            <a class='btn dropdown-toggle' data-bs-toggle='dropdown'>
              <span id='page-count' class='me-1'>20</span>
              <span>records</span>
            </a>
            <div class="dropdown-menu">
              <a class="dropdown-item" data-value="10">10 records</a>
              <a class="dropdown-item" data-value="20">20 records</a>
              <a class="dropdown-item" data-value="50">50 records</a>
              <a class="dropdown-item" data-value="100">100 records</a>
            </div>
          </div>
          <ul class="pagination m-0 ms-auto">
            <li class="page-item active">
              <a class="page-link cursor-pointer" data-i="1" data-page="20">1</a>
            </li>
            <li class="page-item">
              <a class="page-link cursor-pointer" data-i="2" data-page="20">2</a>
            </li>
            <li class="page-item disabled">
              <a class="page-link cursor-pointer">...</a></li><li class="page-item"><a class="page-link cursor-pointer" data-i="7" data-page="20">7</a></li></ul>
          -->
        </div>
      </div>
    </div>
  </div>
</template>
