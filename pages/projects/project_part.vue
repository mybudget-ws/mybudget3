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
});

const isAddingProjectItem = ref(false);
const newProjectItemName = ref('');
const editingProjectItemId = ref(null);
const editingProjectItemName = ref('');

const isCreatingProjectItem = ref(false);
const savingProjectItemId = ref(null);

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
  if (isCreatingProjectItem.value || savingProjectItemId.value) {
    return;
  }

  editingProjectItemId.value = null;
  editingProjectItemName.value = '';
  newProjectItemName.value = '';
  isAddingProjectItem.value = true;
};

const cancelCreateProjectItem = () => {
  if (isCreatingProjectItem.value) {
    return;
  }

  isAddingProjectItem.value = false;
  newProjectItemName.value = '';
};

const createProjectItem = async () => {
  const name = newProjectItemName.value.trim();

  if (!name || isCreatingProjectItem.value) {
    return;
  }

  isCreatingProjectItem.value = true;

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

    projectItems.value = [
      ...projectItems.value,
      result.projectItem,
    ].sort(
      (a, b) => (a.position || 0) - (b.position || 0)
    );

    isAddingProjectItem.value = false;
    newProjectItemName.value = '';
  } catch (error) {
    alert(error?.message || 'Не удалось создать элемент проекта.');
  } finally {
    isCreatingProjectItem.value = false;
  }
};

const startEditProjectItem = (item) => {
  if (isCreatingProjectItem.value || savingProjectItemId.value) {
    return;
  }

  isAddingProjectItem.value = false;
  editingProjectItemId.value = item.id;
  editingProjectItemName.value = item.name;
};

const cancelEditProjectItem = () => {
  if (savingProjectItemId.value) {
    return;
  }

  editingProjectItemId.value = null;
  editingProjectItemName.value = '';
};

const saveProjectItem = async (item) => {
  const name = editingProjectItemName.value.trim();

  if (
    !name ||
    isCreatingProjectItem.value ||
    savingProjectItemId.value
  ) {
    return;
  }

  savingProjectItemId.value = item.id;

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
    savingProjectItemId.value = null;
  }
};

const toggleProjectItem = async (item) => {
  if (
    isCreatingProjectItem.value ||
    savingProjectItemId.value
  ) {
    return;
  }

  const isDone = !item.isDone;

  item.isDone = isDone;
  savingProjectItemId.value = item.id;

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
    savingProjectItemId.value = null;
  }
};

const deleteProjectItem = async (item) => {
  if (
    isCreatingProjectItem.value ||
    savingProjectItemId.value
  ) {
    return;
  }

  if (!confirm('Удалить элемент проекта?')) {
    return;
  }

  savingProjectItemId.value = item.id;

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

    if (editingProjectItemId.value === item.id) {
      editingProjectItemId.value = null;
      editingProjectItemName.value = '';
    }
  } catch {
    alert('Не удалось удалить элемент проекта.');
  } finally {
    savingProjectItemId.value = null;
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
            :disabled='isCreatingProjectItem'
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
            <td style='padding-left: 20px;'>
              <input
                class='form-check-input m-0'
                type='checkbox'
                :checked='item.isDone'
                :disabled='isCreatingProjectItem || savingProjectItemId === item.id'
                @change='toggleProjectItem(item)'
              >
            </td>

            <template v-if='editingProjectItemId === item.id'>
              <td class='w-100' colspan='2'>
                <div class='d-flex align-items-center'>
                  <div class='input-group input-group-flat w-50'>
                    <Input
                      v-model='editingProjectItemName'
                      type='text'
                    />
                  </div>

                  <div
                    class='btn-actions d-flex flex-shrink-0 ms-auto'
                    style='padding-right: 8px;'>
                    <button
                      class='btn btn-action'
                      type='button'
                      :disabled='savingProjectItemId === item.id'
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
                      :disabled='savingProjectItemId === item.id'
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
            </template>

            <template v-else>
              <td class='w-100'>
                <span
                  class='d-block text-truncate'
                  :class='item.isDone
                    ? "text-secondary text-decoration-line-through"
                    : ""'
                >
                  {{ item.name }}
                </span>
              </td>

              <td style='padding-right: 20px;'>
                <div class='btn-actions'>
                  <button
                    class='btn btn-action'
                    type='button'
                    :disabled='isCreatingProjectItem'
                    @click='startEditProjectItem(item)'
                  >
                    <IconPencil size='20' stroke-width='1.5' />
                  </button>

                  <button
                    class='btn btn-action'
                    type='button'
                    :disabled='isCreatingProjectItem'
                    @click='deleteProjectItem(item)'
                  >
                    <IconTrash size='20' stroke-width='1.5' />
                  </button>
                </div>
              </td>
            </template>
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
      <div class='d-flex align-items-center'>
        <div class='input-group input-group-flat w-50'>
          <Input
            v-model='newProjectItemName'
            type='text'
            placeholder='Название элемента'
            :disabled='isCreatingProjectItem'
          />
        </div>

        <div class='card-actions d-flex flex-shrink-0 gap-1 ms-auto'>
          <button
            class='btn btn-primary'
            type='submit'
            :disabled='!newProjectItemName.trim() || isCreatingProjectItem'
          >
            <IconCheck
              size='20'
              stroke-width='1.5'
            />
          </button>

          <button
            class='btn btn-action'
            type='button'
            :disabled='isCreatingProjectItem'
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