<script setup>
import {
  IconPencil,
  IconTrash,
  IconX,
  IconDotsVertical,
} from '@tabler/icons-vue';

import api from '~/lib/api';
import { useAuth } from '~/composables/use_auth';
import { useDevice } from '~/composables/use_device';

const { token } = useAuth();
const { isMobile } = useDevice();

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
});

const newProjectItemName = ref('');
const newProjectItemInput = ref(null);

const editingProjectItemId = ref(null);
const editingProjectItemName = ref('');
const editingProjectItemInput = ref(null);

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

const focusNewProjectItemInput = async () => {
  await nextTick();
  newProjectItemInput.value?.focus();
};

const focusEditingProjectItemInput = async () => {
  await nextTick();

  const input = Array.isArray(editingProjectItemInput.value)
    ? editingProjectItemInput.value[0]
    : editingProjectItemInput.value;

  input?.focus();
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

    newProjectItemName.value = '';
  } catch (error) {
    alert(error?.message || 'Не удалось создать элемент проекта.');
  } finally {
    isCreatingProjectItem.value = false;
    focusNewProjectItemInput();
  }
};

const startEditProjectItem = (item) => {
  if (isCreatingProjectItem.value || savingProjectItemId.value) {
    return;
  }

  editingProjectItemId.value = item.id;
  editingProjectItemName.value = item.name;

  focusEditingProjectItemInput();
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
      </div>
    </div>

    <!-- Mobile -->
    <div
      v-if='projectItems.length && isMobile'
    >
      <div
        v-for='item in projectItems'
        :key='item.id'
        class='card-header border-bottom-0'
      >
        <input
          class='form-check-input m-0 me-3 flex-shrink-0'
          type='checkbox'
          :checked='item.isDone'
          :disabled='isCreatingProjectItem || savingProjectItemId === item.id'
          @change='toggleProjectItem(item)'
        >

        <template v-if='editingProjectItemId === item.id'>
          <form
            class='d-flex align-items-center flex-grow-1 min-w-0'
            @submit.prevent='saveProjectItem(item)'
          >
            <div class='input-group input-group-flat flex-grow-1'>
              <Input
                ref='editingProjectItemInput'
                v-model='editingProjectItemName'
                type='text'
              />
            </div>

            <div class='btn-actions d-flex flex-shrink-0 ms-2'>
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
          </form>
        </template>

        <template v-else>
          <div
            class='flex-grow-1 min-w-0'
            style='overflow-wrap: anywhere; cursor: pointer;'
            @click='toggleProjectItem(item)'
          >
            <span
              :class='item.isDone
                ? "text-secondary text-decoration-line-through"
                : ""'
            >
              {{ item.name }}
            </span>
          </div>

          <div class='card-actions'>
            <div class='dropdown'>
              <button
                type='button'
                class='btn-action border-0 bg-transparent'
                data-bs-toggle='dropdown'
                data-bs-display='static'
                aria-expanded='false'
              >
                <IconDotsVertical
                  size='20'
                  stroke-width='1'
                />
              </button>

              <div class='dropdown-menu dropdown-menu-end'>
                <button
                  class='dropdown-item'
                  type='button'
                  @click='startEditProjectItem(item)'
                >
                  Редактировать
                </button>

                <button
                  class='dropdown-item text-danger'
                  type='button'
                  @click='deleteProjectItem(item)'
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Desktop -->
    <div
      v-else-if='projectItems.length'
      class='table-responsive'
    >
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
                <form
                  class='d-flex align-items-center'
                  @submit.prevent='saveProjectItem(item)'
                >
                  <div class='input-group input-group-flat w-100'>
                    <Input
                      ref='editingProjectItemInput'
                      v-model='editingProjectItemName'
                      type='text'
                    />
                  </div>

                  <div
                    class='btn-actions d-flex flex-shrink-0 ms-2'
                  >
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
                </form>
              </td>
            </template>

            <template v-else>
              <td class='w-100'>
                <span
                  class='d-block'
                  style='cursor: pointer; overflow-wrap: anywhere;'
                  :class='item.isDone
                    ? "text-secondary text-decoration-line-through"
                    : ""'
                  @click='toggleProjectItem(item)'
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
                    <IconPencil
                      size='20'
                      stroke-width='1.5'
                    />
                  </button>

                  <button
                    class='btn btn-action'
                    type='button'
                    :disabled='isCreatingProjectItem'
                    @click='deleteProjectItem(item)'
                  >
                    <IconTrash
                      size='20'
                      stroke-width='1.5'
                    />
                  </button>
                </div>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add project item -->
    <form
      class='card-footer bg-transparent border-0'
      @submit.prevent='createProjectItem'
    >
      <div class='d-flex align-items-center'>
        <div class='input-group input-group-flat w-100'>
          <Input
            ref='newProjectItemInput'
            v-model='newProjectItemName'
            type='text'
            placeholder='Название элемента'
            :disabled='isCreatingProjectItem'
          />
        </div>

        <div
          class='card-actions d-flex flex-shrink-0'
        >
          <button
            class='btn btn-action'
            type='button'
            :disabled='isCreatingProjectItem'
            @click='newProjectItemName = ""'
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
