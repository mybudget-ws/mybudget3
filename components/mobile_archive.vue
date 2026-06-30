<script setup>
import { IconChevronDown, IconDotsVertical } from '@tabler/icons-vue';

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: 'Архив',
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'toggle-open',
  'restore',
  'delete',
]);

const toggle = () => {
  emit('toggle-open');
};

const restore = (item) => {
  emit('restore', item);
};

const remove = (item) => {
  emit('delete', item);
};
</script>

<template>
  <div v-if='items.length > 0' class='border-top'>
    <button
      type='button'
      class='w-100 btn btn-link text-decoration-none text-secondary d-flex align-items-center justify-content-between'
      @click='toggle'
    >
      <span>{{ title }} ({{ items.length }})</span>

      <IconChevronDown
        size='20'
        :style='{
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform .2s"
        }'
      />
    </button>

    <template v-if='isOpen'>
      <div
        v-for='(item, index) in items'
        :key='item.id'
        class='card-header'
        :class='{
          "border-bottom-0": index === items.length - 1,
          "border-top": index === 0,
        }'
      >
        <div class='card-title mb-0 text-secondary'>
          {{ item.name }}
        </div>

        <div class='card-actions'>
          <div class='dropdown'>
            <a
              href='#'
              class='btn-action'
              data-bs-toggle='dropdown'
              @click.prevent
            >
              <IconDotsVertical size='20' stroke-width='1' />
            </a>

            <div class='dropdown-menu dropdown-menu-end'>
              <button
                type='button'
                class='dropdown-item'
                @click='restore(item)'
              >
                Восстановить
              </button>

              <button
                type='button'
                class='dropdown-item text-danger'
                @click='remove(item)'
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>