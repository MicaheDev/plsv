/// <reference path="../pb_data/types.d.ts" />

onRecordCreateRequest((e) => {
    // 1. Guardar el usuario primero
    e.next();

    const userRecord = e.record;

    try {
        const prefCollection = $app.findCollectionByNameOrId("user_preferences");
        const statsCollection = $app.findCollectionByNameOrId("gamified_stats");

        // 2. Crear Preferencias
        const newPreferences = new Record(prefCollection, {
            "user": userRecord.id,
            "dark_mode": userRecord.get("dark_mode") || false,
            "high_contrast": userRecord.get("high_contrast") || false,
            "calm_mode": userRecord.get("calm_mode") || false,
            "disable_animations": userRecord.get("disable_animations") || false,
            "audio_profile": userRecord.get("audio_profile") || "FULL_AUDIO"
        });
        $app.save(newPreferences);

        // 3. Crear Estadísticas
        const newStats = new Record(statsCollection);
        newStats.set("user", userRecord.id);
        newStats.set("current_mcer_level", "A1");
        newStats.set("hearts", 5);
        newStats.set("xp", 0);
        newStats.set("gems", 0);
        newStats.set("streak", 0);
        newStats.set("last_activity", new DateTime()); // Usar el helper DateTime de PocketBase

        $app.save(newStats);

    } catch (err) {
        // Imprimir el error exacto en la consola de PocketBase para depurar
        console.log("Error detallado en user_game_stats:", err);
    }
}, "users");

// 2. Servir la PWA / Vue SPA desde la carpeta pb_public
routerAdd("GET", "/", (e) => {
    let reqPath = e.request.url.path;

    // Si es petición a la API o al Admin Dashboard, ceder el control a PocketBase
    if (reqPath.startsWith("/api/") || reqPath.startsWith("/_/")) {
        return e.next();
    }

    const publicFS = $os.dirFS("./pb_public");

    // Eliminar barras diagonales iniciales para compatibilidad con Go FS
    let relativePath = reqPath === "/" ? "index.html" : reqPath.replace(/^\/+/, "");

    try {
        // Intenta servir el archivo físico estático (ej: /assets/index-xxx.js, manifest, sw.js)
        return e.fileFS(publicFS, relativePath);
    } catch (_) {
        // Si no existe el archivo (rutas de Vue Router como /dashboard, /aprender), devuelve index.html
        return e.fileFS(publicFS, "index.html");
    }
});