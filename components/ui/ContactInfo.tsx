"use client";

import { useCafeSettings } from "@/context/CafeSettingsContext";

export default function ContactInfo() {
  const { settings } = useCafeSettings();

  const address =
    settings.address ||
    "الدمام - حي النهضة - مجمع 55 - بجوار صيدلية الدواء";

  const phone = settings.phone || "0594165122";

  const snapchat =
    settings.snapchat_handle || "whisper_mood";

  const instagram =
    settings.instagram_handle || "hamsat.mazaaj";

  const whatsapp = settings.whatsapp;

  const tiktok = settings.tiktok_handle;

  const email = settings.email;

  const facebook = settings.facebook_url;

  return (
    <section
      dir="rtl"
      className="bg-zinc-950 py-16 text-center"
    >
      <h2 className="mb-8 text-4xl font-bold text-yellow-400">
        تواصل معنا
      </h2>

      <div className="space-y-4 text-lg">
        <p>
          📍 {address}
        </p>

        <p>
          ☎{" "}
          <a
            href={`tel:${phone}`}
            className="transition hover:text-yellow-400"
          >
            {phone}
          </a>
        </p>

        <p>
          👻 {snapchat}
        </p>

        <p>
          📸 {instagram}
        </p>

        {tiktok && (
          <p>
            🎵 {tiktok}
          </p>
        )}

        {email && (
          <p>
            ✉️{" "}
            <a
              href={`mailto:${email}`}
              className="transition hover:text-yellow-400"
            >
              {email}
            </a>
          </p>
        )}

        {whatsapp && (
          <p>
            💬{" "}
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 transition hover:text-green-300"
            >
              واتساب
            </a>
          </p>
        )}

        {facebook && (
          <p>
            📘{" "}
            <a
              href={facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-yellow-400"
            >
              Facebook
            </a>
          </p>
        )}
      </div>
    </section>
  );
}