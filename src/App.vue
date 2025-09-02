<template>
  <div id="app">
    <ul class="nav nav-tabs">
      <li class="nav-item">
        <a class="nav-link active d-flex align-items-center" data-bs-toggle="tab" href="#weekly">
          <img :src="sinaing_logo" alt="" width="30" class="me-2" />
          <span> Sinaing Scheduler </span>
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link d-flex align-items-center" data-bs-toggle="tab" href="#dishwasher">
          <img :src="diashwasher_logo" alt="" width="30" class="me-2" />
          <span> Dishwasher Scheduler </span>
        </a>
      </li>
    </ul>

    <div class="tab-content mt-3">
      <div id="weekly" class="tab-pane fade show active">
        <WeeklyScheduler />
      </div>
      <div id="dishwasher" class="tab-pane fade">
        <DishwasherScheduler ref="dishwasherScheduler" />
      </div>
    </div>
  </div>
</template>

<script>
import WeeklyScheduler from "./components/WeeklyScheduler.vue";
import DishwasherScheduler from "./components/DishwasherScheduler.vue";
import sinaing_logo from "./assets/rice-cooker_1530504.png";
import diashwasher_logo from "./assets/washing-dishes.png";

export default {
  name: "App",
  components: {
    WeeklyScheduler,
    DishwasherScheduler,
  },

  data() {
    return {
      sinaing_logo,
      diashwasher_logo,
    };
  },
  mounted() {
    const dishwasherTab = document.querySelector('a[href="#dishwasher"]');
    dishwasherTab.addEventListener('shown.bs.tab', () => {
      this.$refs.dishwasherScheduler.handleResize();
    });
  },
};
</script>

<style>
/* Add any app-wide styles here */
</style>
