import { createRouter, createWebHistory } from "vue-router";
import { authGuard } from "./guards/authGuard";
import OnboardingLayout from "@/layouts/OnboardingLayout.vue";

const routes = [
  {
    path: "/",
    meta: { layout: OnboardingLayout },
    children: [
      {
        path: "/",
        name: "Home",
        component: () => import("@/pages/onboarding/HomeView.vue"),
      },
      {
        path: "/welcome",
        name: "Welcome",
        component: () => import("@/pages/onboarding/WelcomeView.vue"),
      },
      {
        path: "/login",
        name: "Login",
        component: () => import("@/pages/auth/LoginView.vue"),
      },
      {
        path: "/register",
        name: "Register",
        component: () => import("@/pages/auth/RegisterView.vue"),
      },
    ],
  },
  {
    path: "/learning",
    name: "Learning",
    component: () => import("@/pages/learning/LearningView.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// EL GUARDÍAN DE NAVEGACIÓN (beforeEach)
router.beforeEach(authGuard);
export default router;
