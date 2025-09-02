import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import { collection, getDocs, addDoc, deleteDoc, doc, orderBy, query, serverTimestamp, writeBatch, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import * as bootstrap from "bootstrap";

export function useScheduler(collectionName, settingsName, modalId) {
  const names = ref([]);
  const newName = ref("");
  const editingIndex = ref(null);
  const editedName = ref("");
  const startDateInput = ref("2025-06-18");
  const endDateInput = ref("2025-12-31");

  const calendarOptions = reactive({
    plugins: [],
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
  });

  const fetchNames = async () => {
    try {
      const q = query(collection(db, collectionName), orderBy("createdAt", "asc"));
      const querySnapshot = await getDocs(q);
      names.value = querySnapshot.docs.map((doc) => doc.data().name);
    } catch (error) {
      console.error("Error fetching names:", error);
    }
  };

  const fetchDates = async () => {
    try {
      const docRef = doc(db, "settings", settingsName);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        startDateInput.value = data.startDate || "2025-06-18";
        endDateInput.value = data.endDate || "2025-12-31";
        calendarOptions.initialDate = startDateInput.value;
      } else {
        await setDoc(docRef, {
          startDate: startDateInput.value,
          endDate: endDateInput.value,
        });
      }
    } catch (error) {
      console.error("Error fetching dates:", error);
      alert("Failed to fetch schedule dates. Using defaults.");
    }
  };

  const updateDates = async () => {
    try {
      const startDate = new Date(startDateInput.value);
      const endDate = new Date(endDateInput.value);
      if (isNaN(startDate) || isNaN(endDate) || startDate > endDate) {
        alert("Invalid dates. Start date must be before end date.");
        return;
      }
      await setDoc(doc(db, "settings", settingsName), {
        startDate: startDateInput.value,
        endDate: endDateInput.value,
      });
      calendarOptions.events = generateEvents();
    } catch (error) {
      console.error("Error updating dates:", error);
      alert("Failed to update schedule dates. Please try again.");
    }
  };

  const addName = async () => {
    if (newName.value && !names.value.includes(newName.value)) {
      try {
        await addDoc(collection(db, collectionName), {
          name: newName.value,
          createdAt: serverTimestamp(),
        });
        names.value.push(newName.value);
        calendarOptions.events = generateEvents();
        newName.value = "";
      } catch (error) {
        console.error("Error adding name:", error);
        alert("Failed to add name. Please try again.");
      }
    }
  };

  const removeName = async (index) => {
    try {
      if (!confirm("Are you sure you want to remove this name?")) {
        return;
      }

      const q = query(collection(db, collectionName), orderBy("createdAt", "asc"));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.docs[index]) {
        console.error("No document found at index:", index);
        alert("Name not found. Please refresh and try again.");
        return;
      }

      const docId = querySnapshot.docs[index].id;

      await deleteDoc(doc(db, collectionName, docId));
      await fetchNames();
      calendarOptions.events = generateEvents();
    } catch (error) {
      console.error("Error removing name:", error.code, error.message);
      let errorMessage = "Failed to remove name. Please try again.";
      if (error.code === "permission-denied") {
        errorMessage = "You don't have permission to remove this name.";
      }
      alert(errorMessage);
    }
  };

  const updateNamesOrder = async () => {
    try {
      const q = query(collection(db, collectionName), orderBy("createdAt", "asc"));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;
      const batch = writeBatch(db);
      names.value.forEach((name, index) => {
        const docRef = doc(db, collectionName, docs.find((d) => d.data().name === name).id);
        batch.update(docRef, {
          createdAt: new Date(Date.now() + index * 1000),
        });
      });
      await batch.commit();
      calendarOptions.events = generateEvents();
    } catch (error) {
      console.error("Error updating names order:", error);
      alert("Failed to update names order. Please try again.");
    }
  };

  const startEdit = (index, name) => {
    editingIndex.value = index;
    editedName.value = name;
  };

  const saveEditedName = async (index) => {
    if (!editedName.value || editedName.value.length > 50 || names.value.includes(editedName.value)) {
      alert("Name must be unique, non-empty, and 50 characters or less.");
      return;
    }

    try {
      const q = query(collection(db, collectionName), orderBy("createdAt", "asc"));
      const querySnapshot = await getDocs(q);
      const docId = querySnapshot.docs[index].id;

      await updateDoc(doc(db, collectionName, docId), {
        name: editedName.value,
      });
      names.value[index] = editedName.value;
      calendarOptions.events = generateEvents();
      cancelEdit();
    } catch (error) {
      console.error("Error editing name:", error);
      alert("Failed to edit name. Please try again.");
    }
  };

  const cancelEdit = () => {
    editingIndex.value = null;
    editedName.value = "";
  };

  const generateEvents = () => {
    const events = [];
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    const colors = ["#007bff", "#28a745", "#dc3545", "#ffc107", "#17a2b8", "#6610f2", "#fd7e14"];
    let currentDate = new Date(startDate);
    let slotIndex = 0;

    if (!names.value.length || isNaN(startDate) || isNaN(endDate) || startDate > endDate) {
      console.error("Invalid names or dates");
      return events;
    }

    while (currentDate <= endDate) {
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        const nameIndex = slotIndex % names.value.length;
        const name = names.value[nameIndex] || "Unassigned";
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
  };

  const exportSchedule = () => {
    const events = generateEvents();
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
    link.download = `${settingsName}.csv`;
    link.click();
  };

  const openManageNamesModal = () => {
    const modalElement = document.getElementById(modalId);
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  };

  const isSmallScreen = ref(window.innerWidth < 768);

  const handleWindowResize = () => {
    isSmallScreen.value = window.innerWidth < 768;
    calendarOptions.headerToolbar = isSmallScreen.value
      ? {
          left: 'prev,next',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek,dayGridDay',
        }
      : {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek,dayGridDay',
        };
  };

  onMounted(() => {
    window.addEventListener('resize', handleWindowResize);
    handleWindowResize();
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleWindowResize);
  });

  return {
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
  };
}
