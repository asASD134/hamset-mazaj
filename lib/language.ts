import ar from "@/messages/ar";
import en from "@/messages/en";

export type Language = "ar" | "en";

const STORAGE_KEY = "hamset-language";

export function getLanguage(): Language {
  if (typeof window === "undefined") return "ar";

  const lang = localStorage.getItem(STORAGE_KEY);

  if (lang === "en") return "en";

  return "ar";
}

export function setLanguage(lang: Language) {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_KEY, lang);
}

export function getMessages(lang: Language) {
  return lang === "en" ? en : ar;
}