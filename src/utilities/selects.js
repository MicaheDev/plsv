export const emotionOptions = [
  { label: "Neutral", value: "NEUTRAL" },
  { label: "Feliz", value: "HAPPY" },
  { label: "Triste", value: "SAD" },
  { label: "Enojado", value: "ANGRY" },
  { label: "Sorprendido", value: "SURPRISE" },
  { label: "Miedo", value: "FEAR" },
  { label: "Disgusto", value: "DISGUST" },
  { label: "Emocionado", value: "EXCITED" },
  { label: "Amor", value: "LOVE" },
  { label: "Orgulloso", value: "PROUD" },
  { label: "Agradecido", value: "THANKFUL" },
  { label: "Esperanzado", value: "HOPEFUL" },
  { label: "Interesado", value: "INTERESTED" },
  { label: "Cansado", value: "TIRED" },
  { label: "Aburrido", value: "BORED" },
  { label: "Confundido", value: "CONFUSED" },
  { label: "Ansioso", value: "ANXIOUS" },
  { label: "Frustrado", value: "FRUSTRATED" },
  { label: "Tímido", value: "SHY" },
  { label: "Culpable", value: "GUILTY" },
  { label: "Calmado", value: "CALM" },
  { label: "Serio", value: "SERIOUS" },
  { label: "Pensativo", value: "THOUGHFUL" },
];

export const getEmotionLabel = (value) =>
  emotionOptions.find(o => o.value === value)?.label ?? value;


export const categoryOptions = [
  { label: "Sustantivo", value: "NOUN" },
  { label: "Verbo", value: "VERB" },
  { label: "Adjetivo", value: "ADJECTIVE" },
  { label: "Adverbio", value: "ADVERB" },
  { label: "Pronombre", value: "PRONOUN" },
  { label: "Preposición", value: "PREPOSITION" },
  { label: "Conjunción", value: "CONJUNCTION" },
  { label: "Interjección", value: "INTERJECTION" },
  { label: "Determinante", value: "DETERMINER" },
  { label: "Clasificador", value: "CLASSIFIER" },
  { label: "Marcador no manual", value: "NON-MANUAL_MARKER" },
  { label: "Expresión / Frase", value: "EXPRESSION" },
  { label: "Otro", value: "OTHER" },
];

export const categoryLabelMap = Object.fromEntries(
  categoryOptions.map(({ value, label }) => [value, label])
);