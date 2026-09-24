<script setup>
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconCheck,
  IconX,
} from '@tabler/icons-vue';

import api from '~/lib/api';
import { useAuth } from '~/composables/use_auth';

const { token } = useAuth();

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
});

const isAddingProjectItem = ref(false);
const newProjectItemName = ref('');
const editingProjectItemId = ref(null);
const editingProjectItemName = ref('');
const isProjectItemSaving = ref(false);

const projectItems = ref([]);

watch(
  () => props.project.projectItems,
  (items) => {
    projectItems.value = [...(items || [])].sort(
      (a, b) => (a.position || 0) - (b.position || 0)
    );
  },
  {
    immediate: true,
  }
);

const startCreateProjectItem = () => {
  editingProjectItemId.value = null;
  editingProjectItemName.value = '';
  newProjectItemName.value = '';
  isAddingProjectItem.value = true;
};

const cancelCreateProjectItem = () => {
  isAddingProjectItem.value = false;
  newProjectItemName.value = '';
};

const createProjectItem = async () => {
  const name = newProjectItemName.value.trim();

  if (!name || isProjectItemSaving.value || !props.project) {
    return;
  }

  isProjectItemSaving.value = true;

  try {
    const result = await api.createProjectItem(token.value, {
      projectId: props.project.id,
      name,
    });

    if (result?.errors?.length) {
      alert(result.errors.join('\n'));
      return;
    }

    if (!result?.projectItem) {
      alert('Не удалось создать элемент проекта.');
      return;
    }

    const position = projectItems.value.reduce(
      (max, item) => Math.max(max, item.position || 0),
      0
    ) + 1;

    projectItems.value = [
      ...projectItems.value,
      {
        ...result.projectItem,
        position,
        isDone: false,
      },
    ];

    isAddingProjectItem.value = false;
    newProjectItemName.value = '';
  } catch (error) {
    alert(error?.message || 'Не удалось создать элемент проекта.');
  } finally {
    isProjectItemSaving.value = false;
  }
};

const startEditProjectItem = (item) => {
  isAddingProjectItem.value = false;
  editingProjectItemId.value = item.id;
  editingProjectItemName.value = item.name;
};

const cancelEditProjectItem = () => {
  editingProjectItemId.value = null;
  editingProjectItemName.value = '';
};

const saveProjectItem = async (item) => {
  const name = editingProjectItemName.value.trim();

  if (!name || isProjectItemSaving.value) {
    return;
  }

  isProjectItemSaving.value = true;

  try {
    const result = await api.updateProjectItem(token.value, {
      id: item.id,
      name,
    });

    if (result?.errors?.length) {
      alert(result.errors.join('\n'));
      return;
    }

    Object.assign(item, result.projectItem);

    editingProjectItemId.value = null;
    editingProjectItemName.value = '';
  } catch {
    alert('Не удалось сохранить элемент проекта.');
  } finally {
    isProjectItemSaving.value = false;
  }
};

const toggleProjectItem = async (item) => {
  if (isProjectItemSaving.value) {
    return;
  }

  const isDone = !item.isDone;

  item.isDone = isDone;
  isProjectItemSaving.value = true;

  try {
    const result = await api.updateProjectItem(token.value, {
      id: item.id,
      isDone,
    });

    if (result?.errors?.length) {
      item.isDone = !isDone;
      alert(result.errors.join('\n'));
      return;
    }

    Object.assign(item, result.projectItem);
  } catch {
    item.isDone = !isDone;
    alert('Не удалось обновить элемент проекта.');
  } finally {
    isProjectItemSaving.value = false;
  }
};

const deleteProjectItem = async (item) => {
  if (!confirm('Удалить элемент проекта?')) {
    return;
  }

  if (isProjectItemSaving.value) {
    return;
  }

  isProjectItemSaving.value = true;

  try {
    const result = await api.destroyProjectItem(token.value, item.id);

    if (result?.errors?.length || result?.success === false) {
      alert(
        result?.errors?.join('\n') ||
        'Не удалось удалить элемент проекта.'
      );
      return;
    }

    projectItems.value = projectItems.value.filter(
      projectItem => projectItem.id !== item.id
    );
  } catch {
    alert('Не удалось удалить элемент проекта.');
  } finally {
    isProjectItemSaving.value = false;
  }
};
</script>

<template>
  <div class='card mb-4'>
    <div class='card-header pe-0'>
      <div class='row w-full align-items-center'>
        <div class='col'>
          <h2 class='mb-0'>
            Состав проекта
          </h2>
        </div>

        <div class='col-auto'>
          <button
            class='btn btn-primary'
            type='button'
            :disabled='isProjectItemSaving'
            @click='startCreateProjectItem'
          >
            <IconPlus size='20' />
          </button>
        </div>
      </div>
    </div>

    <div v-if='projectItems.length' class='table-responsive'>
      <table class='table table-vcenter'>
        <tbody class='table-tbody'>
          <tr
            v-for='item in projectItems'
            :key='item.id'
            class='table-body'
          >
            <td class='w-1'>
              <input
                class='form-check-input m-0'
                type='checkbox'
                :checked='item.isDone'
                :disabled='isProjectItemSaving'
                @change='toggleProjectItem(item)'
              >
            </td>

            <td
              v-if='editingProjectItemId === item.id'
              class='w-100'
            >
              <div
                class='d-flex align-items-center gap-2'
                :class='isMobile ? "flex-column align-items-stretch" : ""'
              >
                <div class='input-group input-group-flat'>
                  <Input
                    v-model='editingProjectItemName'
                    type='text'
                    @keyup.enter='saveProjectItem(item)'
                    @keyup.esc='cancelEditProjectItem'
                  />
                </div>

                <div
                  class='btn-actions flex-shrink-0'
                  :class='isMobile ? "justify-content-end" : ""'
                >
                  <button
                    class='btn btn-action'
                    type='button'
                    :disabled='isProjectItemSaving'
                    @click='saveProjectItem(item)'
                  >
                    <IconCheck
                      size='20'
                      stroke-width='1.5'
                    />
                  </button>

                  <button
                    class='btn btn-action'
                    type='button'
                    :disabled='isProjectItemSaving'
                    @click='cancelEditProjectItem'
                  >
                    <IconX
                      size='20'
                      stroke-width='1.5'
                    />
                  </button>
                </div>
              </div>
            </td>

            <td
              v-else
              class='w-100'
            >
              <span
                class='d-block text-truncate'
                :class='item.isDone
                  ? "text-secondary text-decoration-line-through"
                  : ""'
              >
                {{ item.name }}
              </span>
            </td>

            <td class='w-1'>
              <div
                v-if='editingProjectItemId !== item.id'
                class='btn-actions'
              >
                <button
                  class='btn btn-action'
                  type='button'
                  :disabled='isProjectItemSaving'
                  @click='startEditProjectItem(item)'
                >
                  <IconPencil
                    size='20'
                    stroke-width='1.5'
                  />
                </button>

                <button
                  class='btn btn-action'
                  type='button'
                  :disabled='isProjectItemSaving'
                  @click='deleteProjectItem(item)'
                >
                  <IconTrash
                    size='20'
                    stroke-width='1.5'
                  />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-else-if='!isAddingProjectItem'
      class='card-body text-secondary'
    >
      Состав проекта пока пуст
    </div>

    <form
      v-if='isAddingProjectItem'
      class='card-footer bg-transparent border-0'
      @submit.prevent='createProjectItem'
    >
      <div
        :class='isMobile
          ? "d-flex flex-column gap-2"
          : "d-flex align-items-center gap-2"'
      >
        <div
          class='input-group input-group-flat'
          :class='isMobile ? "w-50" : "flex-fill"'
        >
          <Input
            v-model='newProjectItemName'
            type='text'
            placeholder='Название элемента'
            :disabled='isProjectItemSaving'
          />
        </div>

        <div
          class='card-actions flex-shrink-0'
          :class='isMobile ? "w-100" : ""'
        >
          <button
            class='btn btn-primary'
            :class='isMobile ? "flex-fill" : ""'
            type='submit'
            :disabled='!newProjectItemName.trim() || isProjectItemSaving'
          >
            <IconCheck
              size='20'
              stroke-width='1.5'
            />
          </button>

          <button
            class='btn btn-action'
            :class='isMobile ? "flex-fill" : ""'
            type='button'
            :disabled='isProjectItemSaving'
            @click='cancelCreateProjectItem'
          >
            <IconX
              size='20'
              stroke-width='1.5'
            />
          </button>
        </div>
      </div>
    </form>
  </div>
</template>