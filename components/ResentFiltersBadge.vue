
<script setup>
const props = defineProps({
  periodName: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    default: null,
  },
  kinds: {
    type: Array,
    default: () => [],
  },
  accounts: {
    type: Array,
    default: () => [],
  },
  categories: {
    type: Array,
    default: () => [],
  },
  projects: {
    type: Array,
    default: () => [],
  },
  properties: {
    type: Array,
    default: () => [],
  },
  borderClass: {
    type: String,
    default: '',
  },
});

const emit = defineEmits([
  'kind-click',
  'account-click',
  'category-click',
  'project-click',
  'property-click',
  'period-clear',
  'description-clear',
  'clear-all',
]);

const hasActiveFilters = computed(() => (
  props.periodName
    || props.description
    || props.kinds.length
    || props.accounts.length
    || props.categories.length
    || props.projects.length
    || props.properties.length
));
</script>

<template>
  <div
    v-if='hasActiveFilters'
    class='card-body'
    :class='borderClass'
  >
    <div class='d-flex align-items-center justify-content-between gap-2'>
      <div class='badges-list flex-grow-1'>
        <BadgeCategory
          v-if='periodName'
          :name='periodName'
          :is-x='true'
          @click='emit("period-clear")'
        />

        <BadgeCategory
          v-if='description'
          :name='description'
          :is-x='true'
          @click='emit("description-clear")'
        />

        <BadgeCategory
          v-for='kind in kinds'
          :key='kind.id'
          :name='kind.name'
          :is-x='true'
          @click='emit("kind-click", kind.id)'
        />

        <BadgeAccount
          v-for='account in accounts'
          :key='account.id'
          :name='account.name'
          :is-x='true'
          @click='emit("account-click", account.id)'
        />

        <BadgeCategory
          v-for='category in categories'
          :key='category.id'
          :name='category.name'
          :is-x='true'
          @click='emit("category-click", category.id)'
        />

        <BadgeProject
          v-for='project in projects'
          :key='project.id'
          :name='project.name'
          :is-x='true'
          @click='emit("project-click", project.id)'
        />

        <BadgeProperty
          v-for='property in properties'
          :key='property.id'
          :name='property.name'
          :is-x='true'
          @click='emit("property-click", property.id)'
        />
      </div>

      <button
        class='btn btn-link btn-sm text-secondary text-nowrap text-decoration-none p-0'
        type='button'
        @click='emit("clear-all")'
      >
        Сбросить
      </button>
    </div>
  </div>
</template>
