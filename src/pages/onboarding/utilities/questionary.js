export const questionary = {
    relationship: {
        question: "¿Cuál es tu relación con la U.E. Bartolomé Salom?",
        questionType: "single",
        options: [
            { label: "Soy Docente / Personal de la escuela", value: "teacher" },
            { label: "Soy Representante / Familiar", value: "guest" },
            { label: "Soy Estudiante", value: "student" },
        ]
    },
    lsvLevel: {
        question: "¿Cuánto sabes sobre Lengua de Señas Venezolana (LSV)?",
        questionType: "single",
        options: [
            { label: "Cero: No sé nada, quiero empezar desde el alfabeto.", value: "none" },
            { label: "Básico: Conozco algunas señas sueltas y el abecedario.", value: "basic" },
            { label: "Intermedio: Puedo entablar conversaciones muy sencillas.", value: "intermediate" }
        ]
    },
    dailyGoal: {
        question: "¿Cuánto tiempo deseas dedicarle al día?",
        questionType: "single",
        options: [
            { label: "Relajado: 5 minutos al día.", value: "5" },
            { label: "Normal: 10 minutos al día.", value: "10" },
            { label: "Serio: 20 minutos al día.", value: "20" }
        ]
    },
    audioMode: {
        question: "¿Cómo prefieres aprender hoy?",
        questionType: "single",
        options: [
            { label: "Visual y Auditivo: Con apoyo de voz y sonidos.", value: "full_audio" },
            { label: "Solo Visual: Sin sonido (ideal para entornos silenciosos o comunidad sorda).", value: "visual_only" }
        ]
    },
    uiAccessibility: {
        question: "Preferencias de visualización (Accesibilidad):",
        questionType: "single",
        options: [
            { label: "Interfaz estándar (con animaciones y efectos visuales).", value: "standard" },
            { label: "Interfaz simplificada (sin animaciones y alto contraste).", value: "simplified" }
        ]
    },
    priorityVocabulary: {
        question: "¿Qué vocabulario te interesa priorizar primero?",
        questionType: "single",
        options: [
            { label: "Vocabulario del Aula y Escuela (Útil para docentes)", value: "school" },
            { label: "Emociones y Salud (Vital para mediar en crisis)", value: "health" },
            { label: "Expresiones Cotidianas y Hogar", value: "home" },
            { label: "Cultura y Festividades (Tradiciones y religión)", value: "culture" }
        ]
    }
}