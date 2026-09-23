import { createRouter, createWebHistory } from "vue-router";
import { authGuard } from "./guards/authGuard";
import OnboardingLayout from "@/layouts/OnboardingLayout.vue";
import MainLayout from "@/layouts/DashboardLayout.vue";
import DashboardLayout from "@/layouts/DashboardLayout.vue";

const routes = [
  {
    path: "/",
    meta: { layout: OnboardingLayout },
    children: [
      {
        path: "/",
        name: "Home",
        component: () => import("@/views/HomeView.vue"),
      },
      {
        path: "/welcome",
        name: "Welcome",
        component: () => import("@/views/WelcomeView.vue"),
      },
      {
        path: "/login",
        name: "Login",
        component: () => import("@/views/LoginView.vue"),
      },
      {
        path: "/register",
        name: "Register",
        component: () => import("@/views/RegisterView.vue"),
      },
    ],
  },
  {
    path: "/",
    meta: { layout: DashboardLayout, requiresAuth: true },
    children: [
      {
        path: "/learning",
        name: "Learning",
        component: () => import("@/views/LearningView.vue"),
      },
      {
        path: "/dictionary",
        name: "Dictionary",
        component: () => import("@/views/DictionaryView.vue"),
      },
      {
        path: "/ranking",
        name: "Ranking",
        component: () => import("@/views/RankingView.vue"),
      },
      {
        path: "/store",
        name: "Store",
        component: () => import("@/views/StoreView.vue"),
      },
      {
        path: "/profile",
        name: "Profile",
        component: () => import("@/views/ProfileView.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// EL GUARDÍAN DE NAVEGACIÓN (beforeEach)
router.beforeEach(authGuard);
export default router;
