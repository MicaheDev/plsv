export const fechaFormateada = (fechaOriginal) => {
    const objetoFecha = new Date(fechaOriginal);

    // 'es-ES' configura el formato en español (día/mes/año)
    return objetoFecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};