<template>
  <div v-if="!isAuthenticated">
    <PasswordPrompt 
      :correctPassword="'switchconnect'" 
      :storageKey="'weekly_scheduler_authenticated'" 
      @authenticated="onAuthenticated" 
    />
  </div>
  <div v-else class="container mt-4">
    <div class="mb-3 d-md-flex justify-content-md-between align-items-center">
      <h2 v-show="false" class="mb-3">Sinaing Scheduler</h2>
      <div>
        <button class="btn btn-primary me-2" @click="openManageNamesModal"><i class="bi bi-gear"></i></button>
        <button class="btn btn-success" @click="exportSchedule"><i class="bi bi-download"></i></button>
        <button class="btn btn-danger ms-2" @click="logout"><i class="bi bi-box-arrow-right"></i></button>
      </div>
    </div>
    <FullCalendar :options="calendarOptions" />

    <!-- Modal for Managing Names -->
    <div class="modal fade" id="manageNamesModal" tabindex="-1" aria-labelledby="manageNamesModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="manageNamesModalLabel">Settings</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <!-- Date Inputs for Start and End Date -->
            <div class="row">
              <div class="mb-3 col-md-6">
                <label for="startDate" class="form-label">Start Date</label>
                <input v-model="startDateInput" type="date" class="form-control form-control-sm" id="startDate" @change="updateDates" />
              </div>
              <div class="mb-3 col-md-6">
                <label for="endDate" class="form-label">End Date</label>
                <input v-model="endDateInput" type="date" class="form-control form-control-sm" id="endDate" @change="updateDates" />
              </div>
            </div>

            <div class="input-group mb-3">
              <input v-model="newName" placeholder="Add new name" class="form-control" />
              <button class="btn btn-primary" @click="addName">Add <i class="bi bi-plus-lg"></i></button>
            </div>
            <div>
              <h5>Current Names (Drag to reorder):</h5>
              <draggable v-model="names" tag="ul" class="list-group" item-key="element" @end="updateNamesOrder">
                <template #item="{ element, index }">
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    <template v-if="editingIndex === index">
                      <div class="input-group">
                        <input v-model="editedName" class="form-control" placeholder="Edit name" />
                        <button class="btn btn-success btn-sm" @click="saveEditedName(index)"><i class="bi bi-check-lg"></i></button>
                        <button class="btn btn-secondary btn-sm" @click="cancelEdit"><i class="bi bi-x-lg"></i></button>
                      </div>
                    </template>
                    <template v-else>
                      <span class="drag-handle" style="cursor: move">{{ element }}</span>
                      <div>
                        <button class="btn btn-warning btn-sm me-2" @click="startEdit(index, element)"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-danger btn-sm" @click="removeName(index)"><i class="bi bi-trash3"></i></button>
                      </div>
                    </template>
                  </li>
                </template>
              </draggable>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import rrulePlugin from "@fullcalendar/rrule";
import draggable from "vuedraggable";
import PasswordPrompt from "./PasswordPrompt.vue";
import { useScheduler } from '../composables/useScheduler';

const isAuthenticated = ref(false);

const {
  names,
  newName,
  editingIndex,
  editedName,
  startDateInput,
  endDateInput,
  calendarOptions,
  fetchNames,
  fetchDates,
  updateDates,
  addName,
  removeName,
  updateNamesOrder,
  startEdit,
  saveEditedName,
  cancelEdit,
  generateEvents,
  exportSchedule,
  openManageNamesModal,
} = useScheduler('names', 'schedule', 'manageNamesModal');

calendarOptions.plugins = [dayGridPlugin, rrulePlugin];

const onAuthenticated = () => {
  isAuthenticated.value = true;
  fetchDates();
  fetchNames().then(() => {
    calendarOptions.events = generateEvents();
  });
};

const logout = () => {
  localStorage.removeItem('weekly_scheduler_authenticated');
  isAuthenticated.value = false;
};

onMounted(() => {
  isAuthenticated.value = localStorage.getItem('weekly_scheduler_authenticated') === 'true';
  if (isAuthenticated.value) {
    fetchDates();
    fetchNames().then(() => {
      calendarOptions.events = generateEvents();
    });
  }
});
</script>

<style>
* {
  font-family: "Mali", sans-serif;
}

.container {
  max-width: 1200px;
}
:deep(.fc-event) {
  font-weight: bold;
  border-radius: 4px;
  padding: 2px 4px;
}
:deep(.fc-daygrid-day) {
  min-height: 10px;
}
.drag-handle {
  display: flex;
  align-items: center;
}
.drag-handle::before {
  content: "☰";
  margin-right: 8px;
}

.fc-theme-standard td,
.fc-theme-standard th {
  border: 1px solid #9b8c8c !important;
}

.fc-view-harness {
  height: 700px !important;
}
</style>