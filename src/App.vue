<template>
  <div class="container mt-4">
    <h2 class="mb-3">Weekly Schedule</h2>
    <div class="mb-3 d-flex justify-content-between align-items-center">
      <button class="btn btn-primary" @click="openManageNamesModal">Manage Names</button>
      <button class="btn btn-primary" @click="exportSchedule">Export Schedule</button>
    </div>
    <FullCalendar :options="calendarOptions" />

    <!-- Modal for Managing Names -->
    <div class="modal fade" id="manageNamesModal" tabindex="-1" aria-labelledby="manageNamesModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="manageNamesModalLabel">Manage Names</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="input-group mb-3">
              <input v-model="newName" placeholder="Add new name" class="form-control" />
              <button class="btn btn-primary" @click="addName">Add Name</button>
            </div>
            <div>
              <h5>Current Names (Drag to reorder):</h5>
              <draggable v-model="names" tag="ul" class="list-group" item-key="element" @end="updateNamesOrder">
                <template #item="{ element }">
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span class="drag-handle" style="cursor: move"> {{ element }}</span>
                    <button class="btn btn-danger btn-sm" @click="removeName(names.indexOf(element))">Remove</button>
                  </li>
                </template>
              </draggable>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
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
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, orderBy, query, serverTimestamp, writeBatch } from "firebase/firestore";
import draggable from "vuedraggable";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default {
  components: { FullCalendar, draggable },
  data() {
    return {
      //  names: [
      //   "Lester Niel", // Friday, May 30, 2025
      //   "Rio", // Monday, June 2, 2025
      //   "Shernan",
      //   "Fae Arabella",
      //   "Dominic Ivan",
      //   "Crissan",
      //   "Christian",
      //   "Karl Louise",
      // ],
      names: [],
      newName: "",
      calendarOptions: {
        plugins: [dayGridPlugin, rrulePlugin],
        initialView: "dayGridMonth",
        initialDate: "2025-06-02",
        headerToolbar: {
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek",
        },
        events: [],
        eventDisplay: "block",
        eventTextColor: "#fff",
        eventBackgroundColor: "#007bff",
      },
    };
  },
  async created() {
    await this.fetchNames();
    this.calendarOptions.events = this.generateEvents();
  },
  methods: {
    async fetchNames() {
      try {
        const q = query(collection(db, "names"), orderBy("createdAt", "asc"));
        const querySnapshot = await getDocs(q);
        this.names = querySnapshot.docs.map((doc) => doc.data().name);
      } catch (error) {
        console.error("Error fetching names:", error);
      }
    },
    async addName() {
      if (this.newName && !this.names.includes(this.newName)) {
        try {
          await addDoc(collection(db, "names"), {
            name: this.newName,
            createdAt: serverTimestamp(),
          });
          this.names.push(this.newName);
          this.calendarOptions.events = this.generateEvents();
          this.newName = "";
        } catch (error) {
          console.error("Error adding name:", error);
        }
      }
    },
    async removeName(index) {
      try {
        const q = query(collection(db, "names"), orderBy("createdAt", "asc"));
        const querySnapshot = await getDocs(q);
        const docId = querySnapshot.docs[index].id;
        await deleteDoc(doc(db, "names", docId));
        this.names.splice(index, 1);
        this.calendarOptions.events = this.generateEvents();
      } catch (error) {
        console.error("Error removing name:", error);
      }
    },
    async updateNamesOrder() {
      try {
        const q = query(collection(db, "names"), orderBy("createdAt", "asc"));
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs;
        const batch = writeBatch(db);
        this.names.forEach((name, index) => {
          const docRef = doc(db, "names", docs.find((d) => d.data().name === name).id);
          batch.update(docRef, {
            createdAt: new Date(Date.now() + index * 1000),
          });
        });
        await batch.commit();
        this.calendarOptions.events = this.generateEvents();
      } catch (error) {
        console.error("Error updating names order:", error);
      }
    },

    generateEvents() {
      const events = [];
      const startDate = new Date("2025-06-02"); // Start date (Monday)
      const endDate = new Date("2025-12-31"); // <-- Extend to December or any future date

      const colors = ["#007bff", "#28a745", "#dc3545", "#ffc107", "#17a2b8", "#6610f2", "#fd7e14"];

      let currentDate = new Date(startDate);
      let slotIndex = 0;

      while (currentDate <= endDate) {
        // Skip weekends (0 = Sunday, 6 = Saturday)
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
          const nameIndex = slotIndex % this.names.length;
          const name = this.names[nameIndex] || "Unassigned";
          const event = {
            title: name,
            backgroundColor: colors[nameIndex % colors.length],
            borderColor: colors[nameIndex % colors.length],
            start: currentDate.toISOString().split("T")[0], // direct start date instead of rrule
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
      link.download = "schedule.csv";
      link.click();
    },

    openManageNamesModal() {
      const modalElement = document.getElementById("manageNamesModal");
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    },
  },
};
</script>

<style scoped>
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
</style>
