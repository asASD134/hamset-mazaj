import getCafeSettings from "@/lib/getCafeSettings";
import { getSocialLinks } from "@/services/socialLinks";
import UnifiedContactSection, {
  type ContactSocialItem,
} from "@/components/contact/UnifiedContactSection";

export default async function ContactPage() {
  const [settings, socialLinks] = await Promise.all([
    getCafeSettings(),
    getSocialLinks(),
  ]);

  const activeLinks: ContactSocialItem[] = socialLinks
    .filter((link) => link.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((link) => ({
      id: link.id,
      name: link.name,
      url: link.url,
    }));

  return (
    <main dir="rtl" className="min-h-screen bg-[#050505] text-white">
      <UnifiedContactSection
        title="يسعدنا استقبالكم"
        description={`جميع معلومات التواصل والموقع والحسابات الرسمية لـ ${settings.cafe_name || "المقهى"} في مكان واحد.`}
        cafeName={settings.cafe_name}
        address={settings.address}
        phone={settings.phone}
        openingHours={settings.opening_hours}
        mapsUrl={settings.maps_url}
        showTitle
        showDescription
        showAddress
        showPhone
        showHours
        showMap
        showSocial
        socialItems={activeLinks}
      />
    </main>
  );
}
