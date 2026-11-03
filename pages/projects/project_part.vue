<script setup>
import {
  IconPencil,
  IconTrash,
  IconX,
  IconCheck,
  IconDotsVertical,
  IconGripVertical,
  IconCheckbox,
  IconEye,
  IconEyeOff,
} from '@tabler/icons-vue';

import api from '~/lib/api';
import { useAuth } from '~/composables/use_auth';
import { useDevice } from '~/composables/use_device';

const { token } = useAuth();
const { isMobile } = useDevice();
const PROJECT_ITEM_SHOW_LIMIT = 6;

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
});

const newProjectItemName = ref('');
const newProjectItemInput = ref(null);
const projectItemsProgress = computed(() =>
  totalProjectItemsCount.value
    ? Math.round(
        (completedProjectItemsCount.value / totalProjectItemsCount.value) * 100
      )
    : 0
);

const editingProjectItemId = ref(null);
const editingProjectItemName = ref('');
const editingProjectItemInput = ref(null);

const isCreatingProjectItem = ref(false);
const savingProjectItemId = ref(null);
const draggedProjectItemId = ref(null);
const mobileDragPointerId = ref(null);
const isSavingOrder = ref(false);
const projectItems = ref([]);
const showAllProjectItems = ref(
  (props.project.projectItems?.length ?? 0) <= PROJECT_ITEM_SHOW_LIMIT
);

// Порядок элементов до начала перетаскивания (для отката и проверки изменений)
let orderSnapshot = null;

const isBusy = computed(
  () =>
    isCreatingProjectItem.value ||
    savingProjectItemId.value !== null ||
    isSavingOrder.value
);


const totalProjectItemsCount = computed(() => projectItems.value.length);
const completedProjectItemsCount = computed(
  () => projectItems.value.filter(item => item.isDone).length
);

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

const onProjectItemDragStart = (item, event) => {
  if (isBusy.value || editingProjectItemId.value !== null) {
    event.preventDefault();
    return;
  }

  draggedProjectItemId.value = item.id;
  orderSnapshot = [...projectItems.value];

  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', String(item.id));

  const row = event.currentTarget.closest('tr');

  if (row) {
    event.dataTransfer.setDragImage(
      row,
      event.clientX - row.getBoundingClientRect().left,
      event.clientY - row.getBoundingClientRect().top
    );
  }
};

const onProjectItemDragOver = (item) => {
  if (
    draggedProjectItemId.value === null ||
    draggedProjectItemId.value === item.id
  ) {
    return;
  }

  const items = [...projectItems.value];

  const fromIndex = items.findIndex(
    projectItem => projectItem.id === draggedProjectItemId.value
  );

  const toIndex = items.findIndex(
    projectItem => projectItem.id === item.id
  );

  if (fromIndex === -1 || toIndex === -1) {
    return;
  }

  const [movedItem] = items.splice(fromIndex, 1);

  items.splice(toIndex, 0, movedItem);

  projectItems.value = items;
};

const onProjectItemDragEnd = async () => {
  const itemId = draggedProjectItemId.value;

  draggedProjectItemId.value = null;
  await saveProjectItemOrder(itemId);
};

const onProjectItemPointerDown = (item, event) => {
  if (editingProjectItemId.value !== null || isBusy.value) {
    return;
  }

  draggedProjectItemId.value = item.id;
  mobileDragPointerId.value = event.pointerId;
  orderSnapshot = [...projectItems.value];

  event.currentTarget.setPointerCapture(event.pointerId);
};

const onProjectItemPointerMove = (event) => {
  if (mobileDragPointerId.value !== event.pointerId) {
    return;
  }

  const targetElement = document
    .elementFromPoint(event.clientX, event.clientY)
    ?.closest('[data-project-item-id]');

  const targetId = targetElement?.dataset.projectItemId;

  if (!targetId || String(draggedProjectItemId.value) === targetId) {
    return;
  }

  const draggedItem = projectItems.value.find(
    item => item.id === draggedProjectItemId.value
  );

  const targetItem = projectItems.value.find(
    item => String(item.id) === targetId
  );

  if (!draggedItem || !targetItem) {
    return;
  }

  const rect = targetElement.getBoundingClientRect();
  const insertAfter = event.clientY > rect.top + rect.height / 2;

  const items = projectItems.value.filter(
    item => item.id !== draggedProjectItemId.value
  );

  const targetIndex = items.findIndex(
    item => item.id === targetItem.id
  );

  if (targetIndex === -1) {
    return;
  }

  items.splice(targetIndex + (insertAfter ? 1 : 0), 0, draggedItem);

  const orderChanged = items.some(
    (item, index) => item.id !== projectItems.value[index]?.id
  );

  if (orderChanged) {
    projectItems.value = items;
  }
};

const onProjectItemPointerEnd = async (event) => {
  if (mobileDragPointerId.value !== event.pointerId) {
    return;
  }

  const itemId = draggedProjectItemId.value;

  mobileDragPointerId.value = null;
  draggedProjectItemId.value = null;

  await saveProjectItemOrder(itemId);
};

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

  if (!name || isBusy.value) {
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

    projectItems.value.push(result.projectItem);

    projectItems.value.sort(
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
  if (isBusy.value) {
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

  if (!name || isBusy.value) {
    return;
  }

  // Название не изменилось — просто закрываем редактирование
  if (name === item.name) {
    editingProjectItemId.value = null;
    editingProjectItemName.value = '';
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

    if (!result?.projectItem) {
      alert('Не удалось сохранить элемент проекта.');
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
  if (isBusy.value) {
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

    if (result?.errors?.length || !result?.projectItem) {
      item.isDone = !isDone;
      alert(
        result?.errors?.join('\n') ||
        'Не удалось обновить элемент проекта.'
      );
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
  if (isBusy.value) {
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

// На сервере acts_as_list: достаточно отправить новую позицию одного
// перемещённого элемента, остальные сдвигаются автоматически.
const saveProjectItemOrder = async (itemId) => {
  const previousOrder = orderSnapshot;

  orderSnapshot = null;

  if (itemId === null || !previousOrder) {
    return;
  }

  const oldIndex = previousOrder.findIndex(item => item.id === itemId);
  const newIndex = projectItems.value.findIndex(item => item.id === itemId);

  // Элемент не сдвинулся — запрос не нужен
  if (newIndex === -1 || newIndex === oldIndex) {
    return;
  }

  isSavingOrder.value = true;

  try {
    const result = await api.updateProjectItem(token.value, {
      id: itemId,
      position: newIndex + 1,
    });

    if (result?.errors?.length || !result?.projectItem) {
      throw new Error(
        result?.errors?.join('\n') ||
        'Не удалось сохранить порядок элементов проекта.'
      );
    }

    // Приводим локальные позиции в соответствие с серверными
    projectItems.value.forEach((item, index) => {
      item.position = index + 1;
    });
  } catch (error) {
    projectItems.value = previousOrder;

    alert(error?.message || 'Не удалось сохранить порядок элементов проекта.');
  } finally {
    isSavingOrder.value = false;
  }
};
</script>

<template>
  <div class='card mb-4'>
    <div
      class='card-header pe-0'
      :class='showAllProjectItems ? "" : "border-bottom-0"'
    >
      <div class='row w-full align-items-center'>
        <div class='col'>
          <h2 class='mb-1 d-flex align-items-center'>
            Состав проекта

            <span
              v-if='totalProjectItemsCount > 0'
              class='project-items-progress ms-3'
              aria-label='Выполненные элементы проекта'
            >
              <IconCheckbox
                size='18'
                stroke-width='1.8'
              />
              <span class='project-items-progress-count'>
                {{ completedProjectItemsCount }}/{{ totalProjectItemsCount }}
              </span>
            </span>
          </h2>

          <!--Progress-bar-->
          <div v-if='totalProjectItemsCount > 0'>
            <div class='d-flex align-items-center gap-2'>
              <div
                class='progress flex-grow-1'
                role='progressbar'
                style='height: 6px;'
                :aria-valuenow='projectItemsProgress'
                aria-valuemin='0'
                aria-valuemax='100'
              >
                <div
                  class='progress-bar bg-gray-400'
                  :style='{ width: `${projectItemsProgress}%` }'
                />
              </div>

              <span class='text-secondary small'>
                {{ projectItemsProgress }}%
              </span>
            </div>
          </div>
        </div>

        <div
          v-if='projectItems.length > PROJECT_ITEM_SHOW_LIMIT'
          class='col-auto'
        >
          <button
            class='btn btn-icon btn-action me-1'
            type='button'
            :aria-label='showAllProjectItems ? "Скрыть лишние элементы" : "Показать все элементы"'
            :title='showAllProjectItems ? "Скрыть лишние элементы" : "Показать все элементы"'
            @click='showAllProjectItems = !showAllProjectItems'
          >
            <IconEyeOff
              v-if='showAllProjectItems'
              size='20'
              stroke-width='1.5'
            />
            <IconEye
              v-else
              size='20'
              stroke-width='1.5'
            />
          </button>
        </div>
      </div>
    </div>

    <div v-if='showAllProjectItems'>
      <!-- Mobile -->
      <div
        v-if='projectItems.length && isMobile'
      >
        <div
          v-for='item in projectItems'
          :key='item.id'
          class='card-header border-bottom-0'
          :class='{ "project-item-dragging": draggedProjectItemId === item.id }'
          :data-project-item-id='item.id'
        >
          <span
            v-if='editingProjectItemId !== item.id'
            class='project-item-mobile-drag-handle me-2'
            @pointerdown='onProjectItemPointerDown(item, $event)'
            @pointermove.prevent='onProjectItemPointerMove($event)'
            @pointerup='onProjectItemPointerEnd($event)'
            @pointercancel='onProjectItemPointerEnd($event)'
          >
            <IconGripVertical
              size='20'
              stroke-width='2'
              class='opacity-40'
            />
          </span>
          <input
            class='form-check-input m-0 me-3 flex-shrink-0'
            type='checkbox'
            :checked='item.isDone'
            :disabled='isBusy'
            @change='toggleProjectItem(item)'
          >

          <template v-if='editingProjectItemId === item.id'>
            <form
              class='d-flex align-items-center flex-grow-1 min-w-0'
              @submit.prevent='saveProjectItem(item)'
              @keydown.esc.prevent='cancelEditProjectItem'
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
                  type='submit'
                  :disabled='savingProjectItemId === item.id'
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
              :class='{ "project-item-dragging": draggedProjectItemId === item.id }'
              @dragover.prevent='onProjectItemDragOver(item)'
            >
              <td class='project-item-drag-cell'>
                <span
                  class='project-item-drag-handle'
                  draggable='true'
                  @dragstart='onProjectItemDragStart(item, $event)'
                  @dragend='onProjectItemDragEnd'
                >
                  <IconGripVertical
                    size='18'
                    stroke-width='2'
                    class='opacity-40'
                  />
                </span>
              </td>
              <td style='padding-left: 20px;'>
                <input
                  class='form-check-input m-0'
                  type='checkbox'
                  :checked='item.isDone'
                  :disabled='isBusy'
                  @change='toggleProjectItem(item)'
                >
              </td>

              <template v-if='editingProjectItemId === item.id'>
                <td class='w-100' colspan='2'>
                  <form
                    class='d-flex align-items-center'
                    @submit.prevent='saveProjectItem(item)'
                    @keydown.esc.prevent='cancelEditProjectItem'
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
                        type='submit'
                        :disabled='savingProjectItemId === item.id'
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
              :disabled='isBusy'
            />
          </div>

          <button
            v-if='isMobile'
            class='btn btn-action border-fix flex-shrink-0 ms-2'
            type='submit'
            :disabled='isBusy || !newProjectItemName.trim()'
            aria-label='Добавить элемент'
            title='Добавить элемент'
          >
            <IconCheck
              size='20'
              stroke-width='1.5'
            />
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.btn-action.border-fix {
  border-color: transparent;
}

.project-item-drag-cell {
  width: 1%;
  padding-right: 0;
  padding-left: 12px;
}

.project-item-drag-handle {
  display: inline-flex;
  align-items: center;
  cursor: grab;
}

.project-item-drag-handle:active {
  cursor: grabbing;
}

.project-item-dragging {
  opacity: 0.5;
}

.project-item-mobile-drag-handle {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.project-item-mobile-drag-handle:active {
  cursor: grabbing;
}

.project-items-progress {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--tblr-secondary);
  font-size: 18px;
  font-weight: 400;
  line-height: 1;
  white-space: nowrap;
}

.project-items-progress-count {
  font-size: 16px;
}
</style>
