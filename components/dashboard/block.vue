<script setup>
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
});
</script>

<template>
  <div class='card'>
    <div class='card-header border-0'>
      <div class='card-title'>
        {{ props.title }}
      </div>
    </div>

    <div class='p-4 d-flex'>
      <div class='mx-auto'>
        TODO: График
      </div>
    </div>

    <div class='card-table table-responsive'>
      <table class='table table-vcenter'>
        <thead>
          <tr>
            <th>Amount</th>
            <th>Date</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>2</td>
            <td>3</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
