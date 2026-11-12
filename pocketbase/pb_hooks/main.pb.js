/// <reference path="../pb_data/types.d.ts" />

onRecordCreateRequest((e) => {
    const record = e.record;

    // Si el usuario es creado por el panel administrativo y no trae contraseña o flag definido, 
    // podemos asegurarnos de marcar el must_change_password en true.
    if (!record.get("must_change_password")) {
        record.set("must_change_password", true);
    }

    // 1. Guardar el usuario primero
    e.next();

    const userRecord = e.record;

    try {
        const prefCollection = $app.findCollectionByNameOrId("user_preferences");
        const statsCollection = $app.findCollectionByNameOrId("gamified_stats");

        // 2. Crear Preferencias por defecto si no existen
        const prefRecords = $app.findRecordsByFilter("user_preferences", `user = '${userRecord.id}'`, "", 1, 0);
        if (prefRecords.length === 0) {
            const newPreferences = new Record(prefCollection, {
                "user": userRecord.id,
                "dark_mode": false,
                "high_contrast": false,
                "calm_mode": false,
                "disable_animations": false,
                "audio_profile": "FULL_AUDIO"
            });
            $app.save(newPreferences);
        }

        // 3. Crear Estadísticas por defecto si no existen
        const statsRecords = $app.findRecordsByFilter("gamified_stats", `user = '${userRecord.id}'`, "", 1, 0);
        if (statsRecords.length === 0) {
            const newStats = new Record(statsCollection);
            newStats.set("user", userRecord.id);
            newStats.set("current_mcer_level", "A1");
            newStats.set("hearts", 5);
            newStats.set("xp", 0);
            newStats.set("gems", 0);
            newStats.set("streak", 0);
            newStats.set("last_activity", new DateTime());
            $app.save(newStats);
        }

    } catch (err) {
        console.log("Error detallado al inicializar datos del usuario:", err);
    }
}, "users");

// Servir la PWA / Vue SPA desde la carpeta pb_public
routerAdd("GET", "/", (e) => {
    let reqPath = e.request.url.path;

    if (reqPath.startsWith("/api/") || reqPath.startsWith("/_/")) {
        return e.next();
    }

    const publicFS = $os.dirFS("./pb_public");
    let relativePath = reqPath === "/" ? "index.html" : reqPath.replace(/^\/+/, "");

    try {
        return e.fileFS(publicFS, relativePath);
    } catch (_) {
        return e.fileFS(publicFS, "index.html");
    }
});