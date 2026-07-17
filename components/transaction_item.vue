<script setup>
import {
  IconDotsVertical,
  IconPencil,
  IconTrash,
  IconCopy,
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
} from '@tabler/icons-vue';

import { formatDate, formatDateFull } from '~/lib/helper_date';

defineProps({
  transaction: {
    type: Object,
    required: true,
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
  isLast: {
    type: Boolean,
    default: false,
  },
  isShowCopy: {
    type: Boolean,
    default: false,
  },
  isClickable: {
    type: Boolean,
    default: false,
  },
});

defineEmits([
  'edit',
  'delete',
  'copy',
  'account-click',
  'project-click',
  'property-click',
  'category-click',
]);
</script>

<template>
  <div
    v-if='isMobile'
    class='card-header'
    :class='{ "border-bottom-0": isLast }'
  >
    <div class='d-flex w-100'>
      <div class='flex-grow-1 min-w-0'>
        <div class='text-secondary'>
          {{ formatDate(transaction.dateAt) }}
        </div>

        <div class='mt-1'>
          <Amount
            :value='transaction.amount'
            :currency='transaction.account?.currency?.name'
            :is-color='!transaction.isTransfer'
            copyable
          />
        </div>

        <div class='badges-list mt-2'>
          <BadgeAccount
            :name='transaction.account.name'
            :class='{ "no-hover": !isClickable }'
            @click='isClickable && $emit("account-click", transaction.account.id)'
          />

          <template v-if='transaction.isTransfer'>
            <span
              v-if='transaction.amount > 0'
              class='badge bg-green-lt text-green-lt-fg'
            >
              <IconArrowNarrowLeft size='14' />
            </span>

            <span
              v-if='transaction.amount < 0'
              class='badge bg-red-lt text-red-lt-fg'
            >
              <IconArrowNarrowRight size='14' />
            </span>
          </template>

          <BadgeProject
            v-if='transaction.project'
            :name='transaction.project.name'
            :class='{ "no-hover": !isClickable }'
            @click='isClickable && $emit("project-click", transaction.project.id)'
          />

          <BadgeProperty
            v-if='transaction.property'
            :name='transaction.property.name'
            :class='{ "no-hover": !isClickable }'
            @click='isClickable && $emit("property-click", transaction.property.id)'
          />

          <BadgeCategory
            v-for='cat in transaction.categories'
            :key='cat.id'
            :name='cat.name'
            :class='{ "no-hover": !isClickable }'
            @click='isClickable && $emit("category-click", cat.id)'
          />
        </div>

        <div
          v-if='transaction.description'
          class='text-secondary small mt-1 text-truncate'
        >
          {{ transaction.description }}
        </div>
      </div>

      <div class='ms-auto d-flex align-items-center'>
        <div class='dropdown'>
          <button
            type='button'
            class='btn-action border-0 bg-transparent'
            data-bs-toggle='dropdown'
            data-bs-display='static'
          >
            <IconDotsVertical
              size='20'
              stroke-width='1'
            />
          </button>

          <div class='dropdown-menu dropdown-menu-end'>
            <button
              class='dropdown-item'
              @click='$emit("edit", transaction)'
            >
              Редактировать
            </button>
            <button
              v-if='isShowCopy'
              class='dropdown-item'
              @click='$emit("copy", transaction)'
            >
              Повторить
            </button>
            <button
              class='dropdown-item text-danger'
              @click='$emit("delete", transaction)'
            >
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <tr v-else>
    <td :title='formatDateFull(transaction.dateAt)'>
      {{ formatDate(transaction.dateAt) }}
    </td>

    <td class='text-nowrap text-end'>
      <Amount
        :value='transaction.amount'
        :currency='transaction.account?.currency?.name'
        :is-color='!transaction.isTransfer'
        copyable
      />
    </td>

    <td>
      <BadgeAccount
        :name='transaction.account.name'
        :class='{ "no-hover": !isClickable }'
        @click='isClickable && $emit("account-click", transaction.account.id)'
      />
    </td>

    <td>
      <div class='badges-list'>
        <template v-if='transaction.isTransfer'>
          <span
            v-if='transaction.amount > 0'
            class='badge bg-green-lt text-green-lt-fg'
          >
            <IconArrowNarrowLeft size='16' />
          </span>
          <span
            v-if='transaction.amount < 0'
            class='badge bg-red-lt text-red-lt-fg'
          >
            <IconArrowNarrowRight size='16' />
          </span>
        </template>

        <BadgeProject
          v-if='transaction.project'
          :name='transaction.project.name'
          :class='{ "no-hover": !isClickable }'
          @click='isClickable && $emit("project-click", transaction.project.id)'
        />

        <BadgeProperty
          v-if='transaction.property'
          :name='transaction.property.name'
          :class='{ "no-hover": !isClickable }'
          @click='isClickable && $emit("property-click", transaction.property.id)'
        />

        <BadgeCategory
          v-for='cat in transaction.categories'
          :key='cat.id'
          :name='cat.name'
          :class='{ "no-hover": !isClickable }'
          @click='isClickable && $emit("category-click", cat.id)'
        />
      </div>
    </td>

    <td class='text-secondary'>
      {{ transaction.description }}
    </td>

    <td>
      <div class='btn-actions'>
        <button
          class='btn btn-action'
          @click='$emit("edit", transaction)'
        >
          <IconPencil
            size='20'
            stroke-width='1.5'
          />
        </button>

        <button
          v-if='isShowCopy'
          v-tooltip:bottom='"Повторить операцию"'
          class='btn btn-action'
          @click='$emit("copy", transaction)'
        >
          <IconCopy
            size='20'
            stroke-width='1.5'
          />
        </button>

        <button
          class='btn btn-action'
          @click='$emit("delete", transaction)'
        >
          <IconTrash
            size='20'
            stroke-width='1.5'
          />
        </button>
      </div>
    </td>
  </tr>
</template>

<style scoped>
.badge.no-hover {
  cursor: default !important;
  pointer-events: none;
}

.badge.no-hover:hover {
  background: inherit !important;
  color: inherit !important;
  filter: none !important;
  box-shadow: none !important;
  transform: none !important;
}
</style>