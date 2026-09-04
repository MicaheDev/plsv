import pb from "@/services/pb";

export function authGuard(to) {
  const isAuthenticated = pb.authStore.isValid;
  const currentUser = pb.authStore.record;

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);

  // 1. Redirigir al login si la ruta requiere autenticación y no está autenticado
  if (requiresAuth && !isAuthenticated) {
    return { name: "Login" };
  }

  // 2. Si ya está autenticado e intenta ir a Login, Register u Onboarding
  if (isAuthenticated && ["Login", "Register", "Home", "Welcome"].includes(to.name)) {
    return { name: "Learning" };
  }

  // 3. Verificación de Rol (Admin / Studio)
  if (requiresAdmin) {
    if (!isAuthenticated || currentUser?.role !== "ADMIN") {
      return { name: "Learning" };
    }
  }

  // 4. Si todo está bien, retornar true para permitir la navegación
  return true;
}