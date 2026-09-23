/**
 * Traduce los errores nativos del SDK de PocketBase a mensajes en español.
 * 
 * @param {Object} err - Objeto de error capturado en el catch
 * @returns {string} Mensaje traducido para la interfaz
 */
export function formatPocketBaseError(err) {
  if (!err) return 'Ocurrió un error inesperado.';

  // 1. Extraer el status buscando en cualquier nivel del objeto de error
  const status = Number(
    err?.status || 
    err?.response?.status || 
    err?.data?.status || 
    0
  );

  // 2. Extraer el mensaje unificando todo el error a texto
  const message = String(
    err?.message || 
    err?.response?.message || 
    err?.data?.message || 
    JSON.stringify(err)
  ).toLowerCase();

  // 3. Extraer la lista de campos con error si existen (para registros/formularios)
  const fieldErrors = err?.response?.data || err?.data || {};

  // CASO 1: Credenciales incorrectas en el Login (Status 400 + Failed to authenticate)
  if (message.includes('failed to authenticate') || (status === 400 && Object.keys(fieldErrors).length === 0)) {
    return 'Correo o contraseña incorrectos. Por favor, verifica tus datos.';
  }

  // CASO 2: Validación de campos individuales (para Registro o Editar perfil)
  if (fieldErrors && typeof fieldErrors === 'object' && Object.keys(fieldErrors).length > 0) {
    const firstField = Object.keys(fieldErrors)[0];
    const fieldObj = fieldErrors[firstField];

    if (firstField === 'email') {
      if (fieldObj?.code === 'validation_invalid_email') return 'El correo electrónico no es válido.';
      if (fieldObj?.code === 'validation_not_unique') return 'Este correo ya está registrado.';
    }

    if (firstField === 'password') {
      if (fieldObj?.code === 'validation_length_out_of_bounds') return 'La contraseña debe tener al menos 8 caracteres.';
    }

    if (firstField === 'passwordConfirm') {
      return 'Las contraseñas no coinciden.';
    }

    return fieldObj?.message || `Error en el campo: ${firstField}`;
  }

  // CASO 3: Errores según el código HTTP
  switch (status) {
    case 400:
      return 'Los datos ingresados son inválidos.';
    case 403:
      return 'No tienes permisos para realizar esta acción.';
    case 404:
      return 'El recurso solicitado no existe.';
    case 500:
      return 'Error interno en el servidor local.';
    default:
      // Si realmente no hubo respuesta del servidor o status es 0
      if (status === 0 && !message.includes('failed to authenticate')) {
        return 'No hay conexión con PocketBase. Verifica que el servidor esté activo.';
      }
      return 'Ocurrió un error al procesar la solicitud.';
  }
}