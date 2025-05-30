<template>
  <div class="container mt-4">
    <h2>Weekly Schedule</h2>
    <div class="mb-3">
      <div class="input-group w-auto">
        <input v-model="newName" placeholder="Add new name" class="form-control" />
        <button class="btn btn-primary" @click="addName">Add Name</button>
      </div>
      <div class="mt-2">
        <h5>Current Names:</h5>
        <ul class="list-group">
          <li v-for="(name, index) in names" :key="index" class="list-group-item d-flex justify-content-between align-items-center">
            {{ name }}
            <button class="btn btn-danger btn-sm" @click="removeName(index)">Remove</button>
          </li>
        </ul>
      </div>
    </div>
    <div class="mt-4 text-end">
      <button class="btn btn-primary mb-3" @click="exportSchedule">Export Schedule</button>
    </div>
    <FullCalendar :options="calendarOptions" />
  </div>
</template>

<script>
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import rrulePlugin from "@fullcalendar/rrule";

export default {
  components: { FullCalendar },
  data() {
    return {
      names: [
        "Lester Niel", // Friday, May 30, 2025
        "Rio", // Monday, June 2, 2025
        "Shernan",
        "Fae Arabella",
        "Dominic Ivan",
        "Crissan",
        "Christian",
        "Karl Louise",
      ],
      newName: "",
      calendarOptions: {
        plugins: [dayGridPlugin, rrulePlugin],
        initialView: "dayGridMonth", // Monthly view
        initialDate: "2025-05-30", // Start on May 30, 2025 (today)
        headerToolbar: {
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek", // Allow switching between month and week views
        },
        events: [], // Initialize empty, populate in created
        eventDisplay: "block",
        eventTextColor: "#fff",
        eventBackgroundColor: "#007bff",
      },
    };
  },
  created() {
    this.calendarOptions.events = this.generateEvents();
  },
  methods: {
    generateEvents() {
      const events = [];
      const startDate = new Date("2025-05-30");
      const daysInWeek = [4, 0, 1, 2, 3];
      const totalSlots = 20;
      const colors = ["#007bff", "#28a745", "#dc3545", "#ffc107", "#17a2b8", "#6610f2", "#fd7e14", "#6f42c1"];

      for (let i = 0; i < totalSlots; i++) {
        const nameIndex = i % this.names.length;
        const name = this.names[nameIndex];
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

    addName() {
      if (this.newName && !this.names.includes(this.newName)) {
        this.names.push(this.newName);
        this.calendarOptions.events = this.generateEvents();
        this.newName = "";
      }
    },
    removeName(index) {
      this.names.splice(index, 1);
      this.calendarOptions.events = this.generateEvents();
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
  min-height: 100px;
}
</style>
