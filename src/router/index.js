import { createRouter, createWebHistory } from 'vue-router';
import WeeklyScheduler from '../components/WeeklyScheduler.vue';
import DishwasherScheduler from '../components/DishwasherScheduler.vue';

const routes = [
  {
    path: '/',
    name: 'WeeklyScheduler',
    component: WeeklyScheduler,
  },
  {
    path: '/dishwasher',
    name: 'DishwasherScheduler',
    component: DishwasherScheduler,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
