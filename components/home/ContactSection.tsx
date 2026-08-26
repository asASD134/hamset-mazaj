"use client";

import { Globe2, MessageCircle } from "lucide-react";

import { useCafeSettings } from "@/context/CafeSettingsContext";
import { useSiteControl } from "@/context/SiteControlContext";
import UnifiedContactSection, {
  type ContactSocialItem,
} from "@/components/contact/UnifiedContactSection";

export default function ContactSection() {
  const { settings } = useCafeSettings();
  const siteControl = useSiteControl();

  if (siteControl?.contact_enabled === false) return null;

  const socialItems: ContactSocialItem[] = [];

  if (settings.instagram_handle) {
    socialItems.push({
      id: "instagram",
      name: "Instagram",
      url: settings.instagram_handle,
      icon: <Globe2 size={18} />,
    });
  }

  if (settings.whatsapp) {
    socialItems.push({
      id: "whatsapp",
      name: "واتساب",
      url: settings.whatsapp,
      icon: <MessageCircle size={18} />,
    });
  }

  return (
    <UnifiedContactSection
      title={siteControl?.contact_title || "يسعدنا استقبالكم"}
      description={
        siteControl?.contact_description ||
        "زورونا واستمتعوا بأفضل تجربة قهوة وجلسات راقية."
      }
      cafeName={settings.cafe_name}
      address={settings.address}
      phone={settings.phone}
      openingHours={settings.opening_hours}
      mapsUrl={settings.maps_url}
      showTitle={siteControl?.show_contact_title !== false}
      showDescription={siteControl?.show_contact_description !== false}
      showAddress={siteControl?.show_contact_address !== false}
      showPhone={siteControl?.show_contact_phone !== false}
      showHours={siteControl?.show_contact_hours !== false}
      showMap={siteControl?.show_contact_map !== false}
      showSocial={siteControl?.show_contact_social_links !== false}
      socialItems={socialItems}
      compact
    />
  );
}
