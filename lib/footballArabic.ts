const COMPETITION_NAMES: Record<string, string> = {
  "saudi pro league": "الدوري السعودي للمحترفين",
  "premier league": "الدوري الإنجليزي الممتاز",
  "champions league": "دوري أبطال أوروبا",
  "uefa champions league": "دوري أبطال أوروبا",
  "europa league": "الدوري الأوروبي",
  "uefa europa league": "الدوري الأوروبي",
  "conference league": "دوري المؤتمر الأوروبي",
  "la liga": "الدوري الإسباني",
  "serie a": "الدوري الإيطالي",
  "bundesliga": "الدوري الألماني",
  "ligue 1": "الدوري الفرنسي",
  "caf champions league": "دوري أبطال أفريقيا",
  "caf confederation cup": "كأس الكونفدرالية الأفريقية",
  "africa cup of nations": "كأس أمم أفريقيا",
  "world cup": "كأس العالم",
  "world cup qualification": "تصفيات كأس العالم",
  "world cup qualification afc": "تصفيات كأس العالم - آسيا",
  "world cup qualification caf": "تصفيات كأس العالم - أفريقيا",
  "afc champions league": "دوري أبطال آسيا",
  "afc asian cup": "كأس آسيا",
  "asian cup": "كأس آسيا",
  "arab cup": "كأس العرب",
  "club world cup": "كأس العالم للأندية",
  "fa cup": "كأس الاتحاد الإنجليزي",
  "carabao cup": "كأس رابطة المحترفين الإنجليزية",
  "copa del rey": "كأس ملك إسبانيا",
  "coppa italia": "كأس إيطاليا",
  "dfb pokal": "كأس ألمانيا",
  "coupe de france": "كأس فرنسا",
  "copa libertadores": "كوبا ليبرتادوريس",
  "copa sudamericana": "كوبا سودأمريكانا",
  "concacaf gold cup": "الكأس الذهبية لاتحاد الكونكاكاف",
  "concacaf nations league": "دوري أمم الكونكاكاف",
  "nations league": "دوري الأمم",
  "npl queensland": "الدوري الوطني - كوينزلاند",
  "liga profesional de fútbol": "الدوري الأرجنتيني للمحترفين",
  "brazilian serie a": "الدوري البرازيلي الدرجة الأولى",
  "brasileirão série a": "الدوري البرازيلي الدرجة الأولى",
  "brasileirão serie b": "الدوري البرازيلي الدرجة الثانية",
  "brasileirao serie b": "الدوري البرازيلي الدرجة الثانية",
};

const TEAM_NAMES: Record<string, string> = {
  "al-hilal": "الهلال",
  "al hilal": "الهلال",
  "al-fayha": "الفيحاء",
  "al fayha": "الفيحاء",
  "al-nassr": "النصر",
  "al nassr": "النصر",
  "al-ittihad": "الاتحاد",
  "al ittihad": "الاتحاد",
  "al-ahli": "الأهلي",
  "al ahli": "الأهلي",
  "al-ahli saudi": "الأهلي السعودي",
  "al-ettifaq": "الاتفاق",
  "al ettifaq": "الاتفاق",
  "al-khaleej": "الخليج",
  "al khaleej": "الخليج",
  "al-kholood": "الخلود",
  "al kholood": "الخلود",
  "al-riyadh": "الرياض",
  "al riyadh": "الرياض",
  "al-raed": "الرائد",
  "al raed": "الرائد",
  "al-fateh": "الفتح",
  "al fateh": "الفتح",
  "al-faisaly": "الفيصلي",
  "al faisaly": "الفيصلي",
  "al-hazem": "الحزم",
  "al hazem": "الحزم",
  "al-diriyah": "الدرعية",
  "al diriyah": "الدرعية",
  "al-qadsiah": "القادسية",
  "al qadsiah": "القادسية",
  "neom sc": "نيوم",
  "al-shabab": "الشباب",
  "al shabab": "الشباب",
  "al-wehda": "الوحدة",
  "al wehda": "الوحدة",
  "al-ain": "العين",
  "al ain": "العين",
  "manchester united": "مانشستر يونايتد",
  "manchester city": "مانشستر سيتي",
  "liverpool fc": "ليفربول",
  "liverpool": "ليفربول",
  "arsenal": "أرسنال",
  "tottenham hotspur": "توتنهام هوتسبير",
  "tottenham": "توتنهام",
  "chelsea": "تشيلسي",
  "everton": "إيفرتون",
  "newcastle united": "نيوكاسل يونايتد",
  "aston villa": "أستون فيلا",
  "west ham united": "وست هام يونايتد",
  "crystal palace": "كريستال بالاس",
  "brentford": "برينتفورد",
  "sunderland": "سندرلاند",
  "ipswich town": "إيبسويتش تاون",
  "nottingham forest": "نوتنغهام فورست",
  "leeds united": "ليدز يونايتد",
  "hull city": "هال سيتي",
  "coventry city": "كوفنتري سيتي",
  "real madrid": "ريال مدريد",
  "barcelona": "برشلونة",
  "atletico madrid": "أتلتيكو مدريد",
  "athletic club": "أتلتيك بلباو",
  "valencia": "فالنسيا",
  "villarreal": "فياريال",
  "sevilla": "إشبيلية",
  "real sociedad": "ريال سوسيداد",
  "inter": "إنتر ميلان",
  "inter milan": "إنتر ميلان",
  "ac milan": "ميلان",
  "juventus": "يوفنتوس",
  "napoli": "نابولي",
  "roma": "روما",
  "lazio": "لاتسيو",
  "bayern munich": "بايرن ميونخ",
  "borussia dortmund": "بوروسيا دورتموند",
  "psg": "باريس سان جيرمان",
  "paris saint-germain": "باريس سان جيرمان",
};

const WORDS: Record<string, string> = {
  "al": "ال",
  "united": "يونايتد",
  "city": "سيتي",
  "town": "تاون",
  "club": "كلوب",
  "fc": "إف سي",
  "sc": "إس سي",
  "sporting": "سبورتينغ",
  "sport": "سبورت",
  "athletic": "أتلتيك",
  "real": "ريال",
  "royal": "رويال",
  "forest": "فورست",
  "palace": "بالاس",
  "ham": "هام",
  "villa": "فيلا",
  "hotspur": "هوتسبير",
  "rovers": "روفرز",
  "wanderers": "واندررز",
  "rangers": "رينجرز",
  "county": "كونتي",
  "north": "نورث",
  "south": "ساوث",
  "east": "إيست",
  "west": "ويست",
  "professional": "للمحترفين",
  "league": "الدوري",
  "premier": "الممتاز",
  "champions": "الأبطال",
  "cup": "كأس",
  "qualification": "التصفيات",
  "qualifying": "التصفيات",
  "national": "الوطني",
  "super": "السوبر",
};

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/\s+/g, " ");
}

function transliterateWord(word: string) {
  if (!word) return "";

  const direct = WORDS[word.toLowerCase()];
  if (direct) return direct;

  const chars: Record<string, string> = {
    a: "ا",
    b: "ب",
    c: "ك",
    d: "د",
    e: "ي",
    f: "ف",
    g: "ج",
    h: "ه",
    i: "ي",
    j: "ج",
    k: "ك",
    l: "ل",
    m: "م",
    n: "ن",
    o: "و",
    p: "ب",
    q: "ق",
    r: "ر",
    s: "س",
    t: "ت",
    u: "و",
    v: "ف",
    w: "و",
    x: "كس",
    y: "ي",
    z: "ز",
  };

  return word
    .split("")
    .map((char) => chars[char] ?? char)
    .join("");
}

function fallbackArabic(value: string) {
  if (/[\u0600-\u06FF]/.test(value)) {
    return value;
  }

  const cleaned = value
    .replace(/\([^)]*\)/g, "")
    .replace(/\[[^\]]*\]/g, "")
    .trim();

  return cleaned
    .split(/\s+/)
    .map((word) => transliterateWord(word))
    .join(" ")
    .replace(/\s+([-/])/g, "$1")
    .replace(/([-/])\s+/g, "$1");
}

export function getArabicCompetitionName(
  value: string | null | undefined,
  country?: string | null
) {
  const original = (value ?? "").trim();
  if (!original) return "بطولة كرة القدم";

  const normalized = normalize(original);
  const exact = COMPETITION_NAMES[normalized];
  if (exact) return exact;

  if (country && /saudi|السعود/i.test(country)) {
    if (/pro league|professional league/i.test(original)) {
      return "الدوري السعودي للمحترفين";
    }
  }

  return fallbackArabic(original);
}

export function getArabicTeamName(
  value: string | null | undefined
) {
  const original = (value ?? "").trim();
  if (!original) return "الفريق";

  if (/[\u0600-\u06FF]/.test(original)) {
    return original;
  }

  const normalized = normalize(original);
  const exact = TEAM_NAMES[normalized];
  if (exact) return exact;

  return fallbackArabic(original);
}

export function getArabicMatchName(
  home: string,
  away: string
) {
  return `${getArabicTeamName(home)} - ${getArabicTeamName(away)}`;
}
