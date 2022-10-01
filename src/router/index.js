import { createWebHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/hello",
    name: "Main",
    component: () => import("@/router/views/LoginPage.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
