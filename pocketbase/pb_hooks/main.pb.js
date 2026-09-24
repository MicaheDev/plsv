/// <reference path="../pb_data/types.d.ts" />

onRecordCreateRequest((e) => {
    // 1. Guardar el usuario primero
    e.next();

    const userRecord = e.record;

    try {
        const prefCollection = $app.findCollectionByNameOrId("user_preferences");
        const statsCollection = $app.findCollectionByNameOrId("user_game_stats");

        // 2. Crear Preferencias
        const newPreferences = new Record(prefCollection, {
            "user": userRecord.id,
            "level_preference": userRecord.get("level_preference") || "NONE",
            "daily_goal": Number(userRecord.get("daily_goal")) || 10,
            "audio_mode": userRecord.get("audio_mode") || "FULL_AUDIO"
        });
        $app.save(newPreferences);

        // 3. Crear Estadísticas
        const newStats = new Record(statsCollection);
        newStats.set("user", userRecord.id);
        newStats.set("current_level", "A1");
        newStats.set("current_hearts", 5);
        newStats.set("total_score", 0);
        newStats.set("current_streak", 0);
        newStats.set("last_activity_day", new DateTime()); // Usar el helper DateTime de PocketBase

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