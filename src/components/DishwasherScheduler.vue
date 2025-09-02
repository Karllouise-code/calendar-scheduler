<template>
  <div class="container mt-4">
    <div class="mb-3 d-md-flex justify-content-md-between align-items-center">
      <h2 v-show="false" class="mb-3">Dishwasher Schedule</h2>
      <div>
        <button class="btn btn-primary me-2" @click="openManageNamesModal"><i class="bi bi-gear"></i></button>
        <button class="btn btn-success" @click="exportSchedule"><i class="bi bi-download"></i></button>
      </div>
    </div>
    <FullCalendar ref="dishwasherCalendar" :options="calendarOptions" />

    <!-- Modal for Managing Names -->
    <div class="modal fade" id="manageNamesModal-dishwasher" tabindex="-1" aria-labelledby="manageNamesModalLabel-dishwasher" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="manageNamesModalLabel-dishwasher">Settings</h5>
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

    <!-- Password Prompt Modal -->
    <div class="modal fade" id="passwordModal-dishwasher" tabindex="-1" aria-labelledby="passwordModalLabel-dishwasher" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="passwordModalLabel-dishwasher">Enter Password</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="resetPasswordInput"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <input v-model="passwordInput" type="password" class="form-control" placeholder="Enter password to edit" />
              <div v-if="passwordError" class="text-danger mt-2">{{ passwordError }}</div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="resetPasswordInput">Cancel</button>
            <button type="button" class="btn btn-primary" @click="verifyPassword">Submit</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import rrulePlugin from "@fullcalendar/rrule";
import * as bootstrap from "bootstrap";
import { collection, getDocs, addDoc, deleteDoc, doc, orderBy, query, serverTimestamp, writeBatch, updateDoc, getDoc, setDoc } from "firebase/firestore";
import draggable from "vuedraggable";
import { db } from "../firebase.js";

export default {
  name: "DishwasherScheduler",
  components: { FullCalendar, draggable },
  data() {
    return {
      names: [],
      newName: "",
      editingIndex: null,
      editedName: "",
      passwordInput: "",
      passwordError: "",
      isPasswordVerified: false,
      pendingOperation: null, // Store pending operation (edit or delete)
      calendarOptions: {
        plugins: [dayGridPlugin, rrulePlugin],
        initialView: "dayGridMonth",
        initialDate: new Date().toISOString().split("T")[0],
        headerToolbar: {
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek,dayGridDay",
        },
        events: [],
        eventDisplay: "block",
        eventTextColor: "#fff",
        eventBackgroundColor: "#007bff",
      },
      startDateInput: "2025-06-18", // Default start date
      endDateInput: "2025-12-31", // Default end date
    };
  },

  async created() {
    await this.fetchDates();
    await this.fetchNames();
    this.calendarOptions.events = this.generateEvents();
  },

  methods: {
    handleResize() {
      if (this.$refs.dishwasherCalendar) {
        this.$refs.dishwasherCalendar.getApi().updateSize();
      }
    },
    async fetchNames() {
      try {
        const q = query(collection(db, "dishwasher_names"), orderBy("createdAt", "asc"));
        const querySnapshot = await getDocs(q);
        this.names = querySnapshot.docs.map((doc) => doc.data().name);
      } catch (error) {
        console.error("Error fetching names:", error);
      }
    },

    async fetchDates() {
      try {
        const docRef = doc(db, "settings", "dishwasher_schedule");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          this.startDateInput = data.startDate || "2025-06-18";
          this.endDateInput = data.endDate || "2025-12-31";
          this.calendarOptions.initialDate = this.startDateInput; // ← Update calendar
        } else {
          // Initialize default dates in Firebase if not set
          await setDoc(docRef, {
            startDate: this.startDateInput,
            endDate: this.endDateInput,
          });
        }
      } catch (error) {
        console.error("Error fetching dates:", error);
        alert("Failed to fetch schedule dates. Using defaults.");
      }
    },

    async updateDates() {
      try {
        const startDate = new Date(this.startDateInput);
        const endDate = new Date(this.endDateInput);
        if (isNaN(startDate) || isNaN(endDate) || startDate > endDate) {
          alert("Invalid dates. Start date must be before end date.");
          return;
        }
        await setDoc(doc(db, "settings", "dishwasher_schedule"), {
          startDate: this.startDateInput,
          endDate: this.endDateInput,
        });
        this.calendarOptions.events = this.generateEvents();
      } catch (error) {
        console.error("Error updating dates:", error);
        alert("Failed to update schedule dates. Please try again.");
      }
    },

    async addName() {
      if (this.newName && !this.names.includes(this.newName)) {
        try {
          await addDoc(collection(db, "dishwasher_names"), {
            name: this.newName,
            createdAt: serverTimestamp(),
          });
          this.names.push(this.newName);
          this.calendarOptions.events = this.generateEvents();
          this.newName = "";
        } catch (error) {
          console.error("Error adding name:", error);
          alert("Failed to add name. Please try again.");
        }
      }
    },

    async removeName(index) {
      try {
        if (!confirm("Are you sure you want to remove this name?")) {
          return;
        }

        const q = query(collection(db, "dishwasher_names"), orderBy("createdAt", "asc"));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.docs[index]) {
          console.error("No document found at index:", index);
          alert("Name not found. Please refresh and try again.");
          return;
        }

        const docId = querySnapshot.docs[index].id;

        if (docId === "MyQaKlgRTqvQjvynHHWm" && !this.isPasswordVerified) {
          this.pendingOperation = { type: "remove", index };
          this.promptPassword();
          return;
        }

        await deleteDoc(doc(db, "dishwasher_names", docId));
        await this.fetchNames(); // Refresh names to ensure sync
        this.calendarOptions.events = this.generateEvents();
      } catch (error) {
        console.error("Error removing name:", error.code, error.message);
        let errorMessage = "Failed to remove name. Please try again.";
        if (error.code === "permission-denied") {
          errorMessage = "You don't have permission to remove this name.";
        }
        alert(errorMessage);
      }
    },

    async updateNamesOrder() {
      try {
        const q = query(collection(db, "dishwasher_names"), orderBy("createdAt", "asc"));
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs;
        const batch = writeBatch(db);
        this.names.forEach((name, index) => {
          const docRef = doc(db, "dishwasher_names", docs.find((d) => d.data().name === name).id);
          batch.update(docRef, {
            createdAt: new Date(Date.now() + index * 1000),
          });
        });
        await batch.commit();
        this.calendarOptions.events = this.generateEvents();
      } catch (error) {
        console.error("Error updating names order:", error);
        alert("Failed to update names order. Please try again.");
      }
    },

    startEdit(index, name) {
      this.editingIndex = index;
      this.editedName = name;
    },

    async saveEditedName(index) {
      if (!this.editedName || this.editedName.length > 50 || this.names.includes(this.editedName)) {
        alert("Name must be unique, non-empty, and 50 characters or less.");
        return;
      }

      try {
        const q = query(collection(db, "dishwasher_names"), orderBy("createdAt", "asc"));
        const querySnapshot = await getDocs(q);
        const docId = querySnapshot.docs[index].id;

        // Check if the document is the protected one
        if (docId === "MyQaKlgRTqvQjvynHHWm" && !this.isPasswordVerified) {
          // if (docId === "7ansDf6SotnkOBvLL5qU" && !this.isPasswordVerified) {
          this.pendingOperation = { type: "edit", index };
          this.promptPassword();
          return;
        }

        await updateDoc(doc(db, "dishwasher_names", docId), {
          name: this.editedName,
        });
        this.names[index] = this.editedName;
        this.calendarOptions.events = this.generateEvents();
        this.cancelEdit();
      } catch (error) {
        console.error("Error editing name:", error);
        alert("Failed to edit name. Please try again.");
      }
    },

    cancelEdit() {
      this.editingIndex = null;
      this.editedName = "";
    },

    promptPassword() {
      const modalElement = document.getElementById("passwordModal-dishwasher");
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    },

    async verifyPassword() {
      // Hardcoded password for demo (replace with secure verification)
      const correctPassword = "poginiKarl";
      if (this.passwordInput === correctPassword) {
        this.isPasswordVerified = true;
        this.passwordInput = "";
        this.passwordError = "";
        const passwordModal = bootstrap.Modal.getInstance(document.getElementById("passwordModal-dishwasher"));
        passwordModal.hide();

        // Execute pending operation if any
        if (this.pendingOperation) {
          if (this.pendingOperation.type === "edit") {
            await this.saveEditedName(this.pendingOperation.index);
          } else if (this.pendingOperation.type === "remove") {
            await this.removeName(this.pendingOperation.index);
          }
          this.pendingOperation = null;
        }
      } else {
        this.passwordError = "HAHA! BAGING!";
      }
    },

    resetPasswordInput() {
      this.passwordInput = "";
      this.passwordError = "";
      this.pendingOperation = null;
    },

    generateEvents() {
      const events = [];
      const startDate = new Date(this.startDateInput);
      const endDate = new Date(this.endDateInput);
      const colors = ["#007bff", "#28a745", "#dc3545", "#ffc107", "#17a2b8", "#6610f2", "#fd7e14"];
      let currentDate = new Date(startDate);
      let slotIndex = 0;

      if (!this.names.length || isNaN(startDate) || isNaN(endDate) || startDate > endDate) {
        console.error("Invalid names or dates");
        return events;
      }

      while (currentDate <= endDate) {
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
          const nameIndex = slotIndex % this.names.length;
          const name = this.names[nameIndex] || "Unassigned";
          const event = {
            title: name,
            backgroundColor: colors[nameIndex % colors.length],
            borderColor: colors[nameIndex % colors.length],
            start: currentDate.toISOString().split("T")[0],
            allDay: true,
          };
          events.push(event);
          slotIndex++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return events;
    },

    exportSchedule() {
      const events = this.generateEvents();
      const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const csv = events.map((event) => {
        const date = new Date(event.start);
        return {
          title: event.title,
          day: weekdays[date.getDay()],
          startDate: event.start,
        };
      });
      const csvContent = "Title,Day,StartDate\n" + csv.map((e) => `${e.title},${e.day},${e.startDate}`).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "dishwasher-schedule.csv";
      link.click();
    },

    openManageNamesModal() {
      const modalElement = document.getElementById("manageNamesModal-dishwasher");
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    },

    onRedirectGitHub() {
      window.open("https://github.com/Karllouise-code/calendar-scheduler", "_blank");
    },
  },
};
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
