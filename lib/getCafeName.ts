import getCafeSettings from "@/lib/getCafeSettings";

const DEFAULT_NAME = "همسة مزاج";

export default async function getCafeName(): Promise<string> {
  try {
    const settings = await getCafeSettings();

    return settings.cafe_name?.trim() || DEFAULT_NAME;
  } catch (error) {
    console.error("Failed to get cafe name:", error);

    return DEFAULT_NAME;
  }
}