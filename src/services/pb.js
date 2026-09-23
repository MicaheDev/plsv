// Importamos el SDK oficial de PocketBase
import PocketBase from 'pocketbase';

/**
 * INSTANCIA DE POCKETBASE
 * Se conecta al servidor local de PocketBase ejecutándose en el puerto 8090.
 */
const pb = new PocketBase('http://127.0.0.1:8090');

/**
 * ESCUCHADOR DE AUTENTICACIÓN
 * Se ejecuta automáticamente cada vez que un usuario inicia o cierra sesión,
 * imprimiendo en la consola el estado de la sesión y el token actual.
 */
pb.authStore.onChange(() => {
  console.log('Auth store changed:', pb.authStore.isValid, pb.authStore.token);
});

// Exportamos la instancia para usarla en los componentes o stores que necesiten la BD
export default pb;