import { useCurrentAccount } from "@/stores/account";
import findObjectByPronoteString from "@/utils/format/format_cours_name";

export const COLORS_LIST = [
  "#D1005A",
  "#BE4541",
  "#D54829",
  "#F46E00",
  "#B2641F",
  "#D18800",
  "#BEA541",
  "#E5B21A",
  "#B2BE41",
  "#94BE41",
  "#5CB21F",
  "#32CB10",
  "#1FB28B",
  "#6DA2E3",
  "#0099D1",
  "#1F6DB2",
  "#4E339E",
  "#7941BE",
  "#CC33BF",
  "#BE417F",
  "#E36DB8",
  "#7F7F7F",
];

export const getRandColor = (usedColors) => {
  const availableColors = COLORS_LIST.filter(
    (color) => !usedColors.includes(color)
  );
  return (
    availableColors[Math.floor(Math.random() * availableColors.length)] ||
    getRandColor([])
  );
};

const getClosestGradeEmoji = (subjectName) => {
  const gradeEmojiList = {
    numerique: "💻",
    SI: "💻",
    SNT: "💻",
    travaux: "⚒",
    travail: "💼",
    moral: "⚖️",
    env: "🌿",
    sport: "🏀",
    EPS: "🏀",
    econo: "📈",
    francais: "📚",
    anglais: "🇬🇧",
    allemand: "🇩🇪",
    espagnol: "🇪🇸",
    latin: "🏛️",
    italien: "🇮🇹",
    histoire: "📜",
    EMC: "🤝",
    hist: "📜",
    llc: "🌍",
    scientifique: "🔬",
    arts: "🎨",
    philosophie: "🤔",
    math: "📐",
    phys: "🧪",
    accomp: "👨‍🏫",
    tech: "🔧",
    ingenieur: "🔧",
    musique: "🎼",
    musical: "🎼",
    classe: "🏫",
    vie: "🧬",
    SES: "💰",
    stage: "👔",
    œuvre: "🖼️",
    default: "📝",
    developpement: "👨‍💻",
    culture: "🧠",
    gestion: "💼",
    traitement: "📊",
    sae: "📚",
    expression: "🎭",
    ppp: "🧑‍🏫",
  };

  const subjectNameFormatted = subjectName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Sort keys by length in descending order
  const sortedKeys = Object.keys(gradeEmojiList).sort(
    (a, b) => b.length - a.length
  );

  // Find emoji with key in subject name
  const closest =
    sortedKeys.find((key) => subjectNameFormatted.includes(key)) || "default";

  return gradeEmojiList[closest];
};

// Cache to store results of previous calls
const subjectDataCache = new Map();

export const getSubjectData = (entry) => {
  const state = useCurrentAccount.getState();
  const { account, mutateProperty } = state;
  const subject = entry
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (!subject) {
    return { color: "#888888", pretty: "Matière inconnue", emoji: "❓" };
  }

  // Check cache first
  const cacheKey = `${subject}-${JSON.stringify(
    account.personalization.subjects
  )}`;
  if (subjectDataCache.has(cacheKey)) {
    return subjectDataCache.get(cacheKey);
  }

  // Check if the subject already exists
  const existingSubject = account.personalization.subjects?.[subject];
  if (existingSubject) {
    subjectDataCache.set(cacheKey, existingSubject);
    return existingSubject;
  }

  const formattedCoursName = findObjectByPronoteString(subject);
  const usedColors = new Set(
    Object.values(account.personalization.subjects).map((subj) => subj.color)
  );
  const color = getRandColor(Array.from(usedColors));
  const emoji = getClosestGradeEmoji(subject);

  const newSubject = { color, pretty: formattedCoursName.pretty, emoji };

  // Check for existing subject with the same pretty name
  const existing = Object.values(account.personalization.subjects).find(
    (subj) => subj.pretty === formattedCoursName.pretty
  );
  if (existing) {
    subjectDataCache.set(cacheKey, existing);
    return existing;
  }

  mutateProperty("personalization", {
    subjects: { ...account.personalization.subjects, [subject]: newSubject },
  });

  subjectDataCache.set(cacheKey, newSubject);
  return newSubject;
};
