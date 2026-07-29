"use client";

import { useEffect, useState } from "react";
import { getLanguage, setLanguage, Language } from "@/lib/language";

export default function LanguageButton() {
  const [lang, setLang] = useState<Language>("ar");

  useEffect(() => {
    setLang(getLanguage());
  }, []);

  function changeLanguage() {
    const newLang: Language = lang === "ar" ? "en" : "ar";

    setLanguage(newLang);
    setLang(newLang);

    window.location.reload();
  }

  return (
    <button
      onClick={changeLanguage}
      className="border border-yellow-400 text-yellow-400 px-3 py-2 rounded-full hover:bg-yellow-400 hover:text-black transition"
    >
      {lang === "ar" ? "🇺🇸 English" : "🇸🇦 العربية"}
    </button>
  );
}