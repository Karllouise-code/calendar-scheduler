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
              <h5>Current Names:</h5>
              <ul class="list-group">
                <li v-for="(name, index) in names" :key="index" class="list-group-item d-flex justify-content-between align-items-center">
                  {{ name }}
                  <button class="btn btn-danger btn-sm" @click="removeName(index)">Remove</button>
                </li>
              </ul>
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
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, orderBy, query, serverTimestamp } from "firebase/firestore";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: "calendar-scheduler-5e1c7.firebaseapp.com",
  projectId: "calendar-scheduler-5e1c7",
  storageBucket: "calendar-scheduler-5e1c7.firebasestorage.app",
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default {
  components: { FullCalendar },
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
        initialDate: "2025-05-30",
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
    generateEvents() {
      const events = [];
      const startDate = new Date("2025-05-30");
      const daysInWeek = [4, 0, 1, 2, 3];
      const totalSlots = 20;
      const colors = ["#007bff", "#28a745", "#dc3545", "#ffc107", "#17a2b8", "#6610f2", "#fd7e14", "#6f42c1"];

      for (let i = 0; i < totalSlots; i++) {
        const nameIndex = i % this.names.length;
        const name = this.names[nameIndex] || "Unassigned";
        const dayIndex = i % 5;
        const weekOffset = Math.floor(i / 5);
        const eventDate = new Date(startDate);
        let daysToAdd = daysInWeek[dayIndex] - startDate.getDay() + weekOffset * 7;
        if (daysInWeek[dayIndex] <= startDate.getDay() && dayIndex !== 0) {
          daysToAdd += 7;
        }
        eventDate.setDate(eventDate.getDate() + daysToAdd);

        events.push({
          title: name,
          backgroundColor: colors[nameIndex % colors.length],
          borderColor: colors[nameIndex % colors.length],
          rrule: {
            freq: "weekly",
            interval: 4,
            byweekday: [daysInWeek[dayIndex]],
            dtstart: eventDate.toISOString().split("T")[0],
          },
        });
      }

      return events;
    },
    exportSchedule() {
      const events = this.generateEvents();
      const csv = events.map((event) => ({
        title: event.title,
        day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][event.rrule.byweekday[0]],
        startDate: event.rrule.dtstart,
      }));
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
</style>
