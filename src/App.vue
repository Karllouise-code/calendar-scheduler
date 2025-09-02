<template>
  <div id="app">
    <nav class="nav nav-tabs">
      <router-link :to="{ name: 'WeeklyScheduler' }" class="nav-link d-flex align-items-center" active-class="active">
        <img :src="sinaing_logo" alt="" width="30" class="me-2" />
        <span> Sinaing Scheduler </span>
      </router-link>
      <router-link :to="{ name: 'DishwasherScheduler' }" class="nav-link d-flex align-items-center" active-class="active">
        <img :src="diashwasher_logo" alt="" width="30" class="me-2" />
        <span> Dishwasher Scheduler </span>
      </router-link>
    </nav>
    <div class="mt-3">
      <router-view />
    </div>
  </div>
</template>

<script>
import sinaing_logo from "./assets/rice-cooker_1530504.png";
import diashwasher_logo from "./assets/washing-dishes.png";

export default {
  name: "App",
  data() {
    return {
      sinaing_logo,
      diashwasher_logo,
    };
  },
};
</script>

<style>
/* Add any app-wide styles here */
</style>
