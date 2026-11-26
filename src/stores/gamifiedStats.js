import { ref } from "vue";
import pb from "@/services/pb";

const stats = ref(null);
const isLoadingStats = ref(false);

const getUserId = () => pb.authStore.record?.id || pb.authStore.model?.id || null;

const getLocalDayKey = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const fetchGamifiedStats = async (force = false) => {
  const userId = getUserId();
  if (!userId) {
    stats.value = null;
    return null;
  }

  if (stats.value && stats.value.user === userId && !force) {
    return stats.value;
  }

  isLoadingStats.value = true;
  try {
    const record = await pb
      .collection("gamified_stats")
      .getFirstListItem(`user = "${userId}"`);
    stats.value = record;
    return record;
  } catch (error) {
    if (error?.status === 404) {
      // Si el usuario aún no tiene fila en gamified_stats, la creamos por defecto
      try {
        const created = await pb.collection("gamified_stats").create({
          user: userId,
          current_mcer_level: "A1",
          hearts: 5,
          xp: 0,
          gems: 0,
          streak: 0,
          last_activity: new Date().toISOString(),
        });
        stats.value = created;
        return created;
      } catch (createErr) {
        console.error("No se pudo crear gamified_stats inicial:", createErr);
      }
    } else {
      console.error("Error al consultar gamified_stats:", error);
    }
    return null;
  } finally {
    isLoadingStats.value = false;
  }
};

const loseHeart = async (amount = 1) => {
  const current = stats.value || (await fetchGamifiedStats());
  if (!current) {
    console.warn("loseHeart: no hay registro stats cargado");
    return null;
  }

  const fieldName = "hearts" in current ? "hearts" : "lives";
  const currentHearts = Number(current[fieldName] ?? 5);
  const nextHearts = Math.max(0, currentHearts - amount);

  // Actualización optimista en el estado global para que el header responda al instante
  stats.value = {
    ...current,
    [fieldName]: nextHearts,
  };

  try {
    const updated = await pb.collection("gamified_stats").update(current.id, {
      [fieldName]: nextHearts,
    });
    stats.value = { ...updated };
    return updated;
  } catch (err) {
    console.error("Error al descontar vida en gamified_stats:", err);
    return null;
  }
};

// Suma `xp` y `gems` (y actualiza `streak` + `last_activity`) al completar una lección
const rewardLessonCompletion = async ({ xpGain = 0, gemsGain = 0 }) => {
  const current = stats.value || (await fetchGamifiedStats());
  if (!current) return null;

  const now = new Date();
  const todayKey = getLocalDayKey(now);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayKey = getLocalDayKey(yesterday);

  let nextStreak = Number(current.streak ?? 0);
  if (current.last_activity) {
    const lastKey = getLocalDayKey(new Date(current.last_activity));
    if (lastKey === yesterdayKey) {
      nextStreak += 1;
    } else if (lastKey !== todayKey) {
      nextStreak = Math.max(1, nextStreak);
    }
  } else {
    nextStreak = Math.max(1, nextStreak);
  }

  const nextXp = Number(current.xp ?? 0) + Number(xpGain || 0);
  const nextGems = Number(current.gems ?? 0) + Number(gemsGain || 0);

  const updated = await pb.collection("gamified_stats").update(current.id, {
    xp: nextXp,
    gems: nextGems,
    streak: nextStreak,
    last_activity: now.toISOString(),
  });

  stats.value = updated;
  return updated;
};

export function useGamifiedStats() {
  return {
    stats,
    isLoadingStats,
    fetchGamifiedStats,
    loseHeart,
    rewardLessonCompletion,
  };
}