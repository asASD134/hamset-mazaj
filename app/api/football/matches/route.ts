import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BSD_BASE_URL = "https://sports.bzzoiro.com/api/v2";
const COMPETITIONS_TABLE = "football_competitions";

type CompetitionRow = {
  id: number;
  name: string;
  name_ar: string | null;
  country: string | null;
  competition_type: "league" | "cup" | "competition";
  logo_url: string | null;
  is_active: boolean;
  sort_order: number;
  match_limit: number;
};

type BsdTeam = {
  id?: number;
  name?: string;
  short_name?: string | null;
  logo?: string | null;
  image?: string | null;
};

type BsdScore = {
  home?: number | null;
  away?: number | null;
};

type BsdEvent = {
  id?: number;
  league_id?: number;
  league?:
    | string
    | {
        id?: number;
        name?: string;
      };

  home_team_id?: number;
  away_team_id?: number;

  home_team?: BsdTeam | string | null;
  away_team?: BsdTeam | string | null;

  event_date?: string | null;
  kickoff?: string | null;
  starting_at?: string | null;
  date?: string | null;

  status?: string | null;
  score?: BsdScore | null;
  home_score?: number | null;
  away_score?: number | null;
  result?: string | null;
};

type BsdEventsResponse = {
  count?: number;
  next?: string | null;
  results?: BsdEvent[];
  detail?: string;
  error?: string;
  message?: string;
};

type Match = {
  id: number;
  name: string;
  starting_at: string | null;
  starting_at_timestamp: number | null;
  state_id: number | null;
  result_info: string | null;
  league: {
    id: number | null;
    name: string;
    image_path: string | null;
  };
  home: {
    id: number | null;
    name: string;
    short_code: string | null;
    image_path: string | null;
    score: number;
  };
  away: {
    id: number | null;
    name: string;
    short_code: string | null;
    image_path: string | null;
    score: number;
  };
  events: [];
  is_visible: boolean;
};

function jsonError(message: string, status = 500) {
  return NextResponse.json(
    { ok: false, error: message },
    { status }
  );
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

function isConfiguredToken(token: string | undefined) {
  if (!token) return false;

  const value = token.trim().toLowerCase();

  return (
    value.length > 0 &&
    !value.includes("your_") &&
    !value.includes("placeholder") &&
    !value.includes("put_token")
  );
}

function toTimestamp(value: string | null | undefined) {
  if (!value) return null;

  const timestamp = new Date(value).getTime();

  return Number.isFinite(timestamp)
    ? Math.floor(timestamp / 1000)
    : null;
}

function getKickoff(fixture: BsdEvent) {
  // BSD currently returns event_date for football fixtures.
  return (
    fixture.event_date ??
    fixture.kickoff ??
    fixture.starting_at ??
    fixture.date ??
    null
  );
}

const TEAM_NAME_AR: Record<string, string> = {
  // Saudi Pro League
  "Al Hilal": "الهلال",
  "Al-Hilal": "الهلال",
  "Al Nassr": "النصر",
  "Al-Nassr": "النصر",
  "Al Ittihad": "الاتحاد",
  "Al-Ittihad": "الاتحاد",
  "Al Ahli": "الأهلي",
  "Al-Ahli": "الأهلي",
  "Al Ettifaq": "الاتفاق",
  "Al-Ettifaq": "الاتفاق",
  "Al Shabab": "الشباب",
  "Al-Shabab": "الشباب",
  "Al Fateh": "الفتح",
  "Al-Fateh": "الفتح",
  "Al Fayha": "الفيحاء",
  "Al-Fayha": "الفيحاء",
  "Al Raed": "الرائد",
  "Al-Raed": "الرائد",
  "Al Khaleej": "الخليج",
  "Al-Khaleej": "الخليج",
  "Al Wehda": "الوحدة",
  "Al-Wehda": "الوحدة",
  "Al Okhdood": "الأخدود",
  "Al-Okhdood": "الأخدود",
  "Al Qadsiah": "القادسية",
  "Al-Qadsiah": "القادسية",
  "Al Hazem": "الحزم",
  "Al-Hazem": "الحزم",
  "Al Riyadh": "الرياض",
  "Al-Riyadh": "الرياض",
  "Al Kholood": "الخلود",
  "Al-Kholood": "الخلود",
  "Al Diriyah": "الدرعية",
  "Al-Diriyah": "الدرعية",

  // England
  "Manchester United": "مانشستر يونايتد",
  "Manchester City": "مانشستر سيتي",
  "Arsenal": "أرسنال",
  "Chelsea": "تشيلسي",
  "Liverpool": "ليفربول",
  "Tottenham Hotspur": "توتنهام",
  "Tottenham": "توتنهام",
  "Newcastle United": "نيوكاسل يونايتد",
  "Aston Villa": "أستون فيلا",
  "West Ham United": "وست هام يونايتد",
  "Crystal Palace": "كريستال بالاس",
  "Everton": "إيفرتون",
  "Fulham": "فولهام",
  "Brentford": "برينتفورد",
  "Brighton & Hove Albion": "برايتون",
  "Brighton": "برايتون",
  "Wolverhampton Wanderers": "وولفرهامبتون",
  "Wolves": "وولفرهامبتون",
  "Nottingham Forest": "نوتنغهام فورست",
  "Bournemouth": "بورنموث",
  "Leicester City": "ليستر سيتي",
  "Leeds United": "ليدز يونايتد",
  "Sunderland": "سندرلاند",
  "Burnley": "بيرنلي",

  // Spain
  "Real Madrid": "ريال مدريد",
  "Barcelona": "برشلونة",
  "Atletico Madrid": "أتلتيكو مدريد",
  "Atlético Madrid": "أتلتيكو مدريد",
  "Athletic Club": "أتلتيك بلباو",
  "Sevilla": "إشبيلية",
  "Villarreal": "فياريال",
  "Real Betis": "ريال بيتيس",
  "Valencia": "فالنسيا",
  "Real Sociedad": "ريال سوسيداد",
  "Girona": "جيرونا",
  "Celta Vigo": "سيلتا فيغو",
  "Getafe": "خيتافي",
  "Mallorca": "ريال مايوركا",
  "Osasuna": "أوساسونا",
  "Rayo Vallecano": "رايو فايكانو",

  // Italy
  "Inter Milan": "إنتر ميلان",
  "Inter": "إنتر ميلان",
  "AC Milan": "ميلان",
  "Milan": "ميلان",
  "Juventus": "يوفنتوس",
  "Napoli": "نابولي",
  "Roma": "روما",
  "AS Roma": "روما",
  "Lazio": "لاتسيو",
  "Atalanta": "أتالانتا",
  "Fiorentina": "فيورنتينا",
  "Bologna": "بولونيا",
  "Torino": "تورينو",
  "Genoa": "جنوى",
  "Cagliari": "كالياري",
  "Parma": "بارما",
  "Monza": "مونزا",
  "Udinese": "أودينيزي",
  "Como": "كومو",
  "Lecce": "ليتشي",
  "Empoli": "إمبولي",
  "Verona": "هيلاس فيرونا",
  "Hellas Verona": "هيلاس فيرونا",

  // Germany
  "Bayern Munich": "بايرن ميونخ",
  "Bayern München": "بايرن ميونخ",
  "Borussia Dortmund": "بوروسيا دورتموند",
  "RB Leipzig": "لايبزيغ",
  "Bayer Leverkusen": "باير ليفركوزن",
  "Eintracht Frankfurt": "آينتراخت فرانكفورت",
  "VfB Stuttgart": "شتوتغارت",
  "Werder Bremen": "فيردر بريمن",
  "Wolfsburg": "فولفسبورغ",
  "Borussia Monchengladbach": "بوروسيا مونشنغلادباخ",
  "Hoffenheim": "هوفنهايم",

  // France
  "Paris Saint-Germain": "باريس سان جيرمان",
  "Paris Saint Germain": "باريس سان جيرمان",
  "Marseille": "مارسيليا",
  "Monaco": "موناكو",
  "Lyon": "ليون",
  "Lille": "ليل",
  "Nice": "نيس",
  "Rennes": "رين",
  "Lens": "لانس",
  "Nantes": "نانت",
  "Montpellier": "مونبلييه",

  // Netherlands
  "Ajax": "أياكس",
  "PSV Eindhoven": "آيندهوفن",
  "Feyenoord": "فينورد",
  "AZ Alkmaar": "ألكمار",
  "Twente": "تفينتي",

  // Portugal
  "Benfica": "بنفيكا",
  "Porto": "بورتو",
  "Sporting CP": "سبورتينغ لشبونة",
  "Braga": "سبورتينغ براغا",

  // Turkey
  "Galatasaray": "غلطة سراي",
  "Fenerbahce": "فنربخشة",
  "Fenerbahçe": "فنربخشة",
  "Besiktas": "بشكتاش",
  "Beşiktaş": "بشكتاش",

  // Scotland
  "Celtic": "سلتيك",
  "Rangers": "رينجرز",

  // Belgium
  "Club Brugge": "كلوب بروج",
  "Anderlecht": "أندرلخت",
  "Genk": "جينك",
};

function normalizeTeamLookup(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[’']/g, "'")
    .toLowerCase();
}

const TEAM_NAME_AR_NORMALIZED = new Map(
  Object.entries(TEAM_NAME_AR).map(([key, value]) => [
    normalizeTeamLookup(key),
    value,
  ])
);

function fallbackArabicTeamName(value: string) {
  let name = value
    .replace(/\bFC\b/gi, "")
    .replace(/\bF\.C\.\b/gi, "")
    .replace(/\bAFC\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const replacements: Array<[RegExp, string]> = [
    [/\bUnited\b/gi, "يونايتد"],
    [/\bCity\b/gi, "سيتي"],
    [/\bTown\b/gi, "تاون"],
    [/\bRovers\b/gi, "روفرز"],
    [/\bWanderers\b/gi, "واندررز"],
    [/\bAthletic\b/gi, "أتلتيك"],
    [/\bAthletic Club\b/gi, "أتلتيك"],
    [/\bReal\b/gi, "ريال"],
    [/\bSporting\b/gi, "سبورتينغ"],
    [/\bRacing\b/gi, "راسينغ"],
    [/\bOlympique\b/gi, "أولمبيك"],
    [/\bOlympic\b/gi, "أولمبيك"],
    [/\bInter\b/gi, "إنتر"],
    [/\bMilan\b/gi, "ميلان"],
    [/\bNapoli\b/gi, "نابولي"],
    [/\bRoma\b/gi, "روما"],
    [/\bLazio\b/gi, "لاتسيو"],
    [/\bGenoa\b/gi, "جنوى"],
    [/\bVerona\b/gi, "فيرونا"],
    [/\bParma\b/gi, "بارما"],
    [/\bMonza\b/gi, "مونزا"],
    [/\bCagliari\b/gi, "كالياري"],
    [/\bJuventus\b/gi, "يوفنتوس"],
    [/\bArsenal\b/gi, "أرسنال"],
    [/\bChelsea\b/gi, "تشيلسي"],
    [/\bLiverpool\b/gi, "ليفربول"],
    [/\bEverton\b/gi, "إيفرتون"],
    [/\bTottenham\b/gi, "توتنهام"],
    [/\bManchester\b/gi, "مانشستر"],
    [/\bNewcastle\b/gi, "نيوكاسل"],
    [/\bBrighton\b/gi, "برايتون"],
    [/\bMadrid\b/gi, "مدريد"],
    [/\bBarcelona\b/gi, "برشلونة"],
    [/\bSevilla\b/gi, "إشبيلية"],
    [/\bValencia\b/gi, "فالنسيا"],
    [/\bBayern\b/gi, "بايرن"],
    [/\bDortmund\b/gi, "دورتموند"],
    [/\bLeverkusen\b/gi, "ليفركوزن"],
    [/\bParis\b/gi, "باريس"],
    [/\bMarseille\b/gi, "مارسيليا"],
    [/\bMonaco\b/gi, "موناكو"],
    [/\bAjax\b/gi, "أياكس"],
    [/\bBenfica\b/gi, "بنفيكا"],
    [/\bPorto\b/gi, "بورتو"],
    [/\bGalatasaray\b/gi, "غلطة سراي"],
    [/\bFenerbahce\b/gi, "فنربخشة"],
    [/\bFenerbahçe\b/gi, "فنربخشة"],
  ];

  for (const [pattern, replacement] of replacements) {
    name = name.replace(pattern, replacement);
  }

  return name || value;
}

function translateTeamName(value: string) {
  const clean = value.trim();

  if (!clean) {
    return clean;
  }

  const exact = TEAM_NAME_AR_NORMALIZED.get(
    normalizeTeamLookup(clean)
  );

  if (exact) {
    return exact;
  }

  if (/^[\u0600-\u06FF\s0-9().&'/-]+$/u.test(clean)) {
    return clean;
  }

  return fallbackArabicTeamName(clean);
}

function getTeamName(
  team: BsdTeam | string | null | undefined,
  fallback: string
) {
  const rawName =
    typeof team === "string"
      ? team
      : team?.name?.trim() || fallback;

  return translateTeamName(rawName);
}

function getTeamId(
  team: BsdTeam | string | null | undefined,
  fallback?: number
) {
  if (typeof team === "object" && team?.id != null) {
    return Number(team.id);
  }

  return fallback ?? null;
}

function getTeamLogo(
  team: BsdTeam | string | null | undefined,
  teamId: number | null
) {
  if (typeof team === "object") {
    if (team.logo) return team.logo;
    if (team.image) return team.image;
  }

  if (teamId) {
    return `${BSD_BASE_URL.replace(
      "/api/v2",
      ""
    )}/img/team/${teamId}/?bg=transparent`;
  }

  return null;
}

function getScore(
  fixture: BsdEvent,
  side: "home" | "away"
) {
  if (fixture.score) {
    const value =
      side === "home"
        ? fixture.score.home
        : fixture.score.away;

    if (typeof value === "number") {
      return value;
    }
  }

  const value =
    side === "home"
      ? fixture.home_score
      : fixture.away_score;

  return typeof value === "number" ? value : 0;
}

function normalizeStatus(
  status: string | null | undefined
) {
  return (status ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function isLiveStatus(
  status: string | null | undefined
) {
  return [
    "live",
    "inprogress",
    "in_progress",
    "in_play",
    "in-play",
  ].includes(normalizeStatus(status));
}

function isFinishedStatus(
  status: string | null | undefined
) {
  return [
    "finished",
    "complete",
    "completed",
    "ft",
    "ended",
  ].includes(normalizeStatus(status));
}

function isRiyadhToday(value: string | null) {
  if (!value) return false;

  const date = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Asia/Riyadh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).format(new Date(value));

  const today = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Asia/Riyadh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).format(new Date());

  return date === today;
}

function mapFixture(
  fixture: BsdEvent,
  competition: CompetitionRow
): Match {
  const homeId = getTeamId(
    fixture.home_team,
    fixture.home_team_id
  );

  const awayId = getTeamId(
    fixture.away_team,
    fixture.away_team_id
  );

  const homeName = getTeamName(
    fixture.home_team,
    "الفريق المضيف"
  );

  const awayName = getTeamName(
    fixture.away_team,
    "الفريق الضيف"
  );

  const startingAt = getKickoff(fixture);
  const status = normalizeStatus(fixture.status);

  let stateId = 1;

  if (isLiveStatus(status)) {
    stateId = 3;
  } else if (isFinishedStatus(status)) {
    stateId = 5;
  }

  return {
    id: Number(fixture.id ?? 0),
    name: `${homeName} - ${awayName}`,
    starting_at: startingAt,
    starting_at_timestamp:
      toTimestamp(startingAt),
    state_id: stateId,
    result_info: fixture.result ?? null,
    league: {
      id: competition.id,
      name:
        competition.name_ar ||
        competition.name,
      image_path:
        competition.logo_url ||
        `https://sports.bzzoiro.com/img/league/${competition.id}/?bg=transparent`,
    },
    home: {
      id: homeId,
      name: homeName,
      short_code:
        typeof fixture.home_team === "object"
          ? fixture.home_team?.short_name ?? null
          : null,
      image_path: getTeamLogo(
        fixture.home_team,
        homeId
      ),
      score: getScore(fixture, "home"),
    },
    away: {
      id: awayId,
      name: awayName,
      short_code:
        typeof fixture.away_team === "object"
          ? fixture.away_team?.short_name ?? null
          : null,
      image_path: getTeamLogo(
        fixture.away_team,
        awayId
      ),
      score: getScore(fixture, "away"),
    },
    events: [],
    is_visible: true,
  };
}

async function fetchBsdEvents(
  token: string,
  dateFrom: string,
  dateTo: string
) {
  const all: BsdEvent[] = [];
  let nextUrl:
    | string
    | null = null;
  let offset = 0;

  for (let page = 0; page < 10; page += 1) {
    const url =
      nextUrl ||
      `${BSD_BASE_URL}/events/?${new URLSearchParams({
        date_from: dateFrom,
        date_to: dateTo,
        limit: "200",
        offset: String(offset),
      }).toString()}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Token ${token}`,
      },
      next: { revalidate: 60 },
    });

    const body =
      (await response.json()) as BsdEventsResponse;

    if (!response.ok) {
      throw new Error(
        body.detail ||
          body.error ||
          body.message ||
          `BSD request failed (${response.status})`
      );
    }

    const results = body.results ?? [];
    all.push(...results);

    nextUrl = body.next ?? null;

    if (
      results.length === 0 ||
      !nextUrl
    ) {
      break;
    }

    offset += results.length;
  }

  return all;
}

async function fetchBsdLive(
  token: string
) {
  const response = await fetch(
    `${BSD_BASE_URL}/events/live/`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Token ${token}`,
      },
      cache: "no-store",
    }
  );

  const body =
    (await response.json()) as BsdEventsResponse;

  if (!response.ok) {
    throw new Error(
      body.detail ||
        body.error ||
        body.message ||
        `BSD live request failed (${response.status})`
    );
  }

  return body.results ?? [];
}

export async function GET() {
  try {
    const token =
      process.env.BSD_API_KEY?.trim();

    if (!isConfiguredToken(token)) {
      return jsonError(
        "BSD_API_KEY غير موجود في .env.local.",
        500
      );
    }

    const supabase = getSupabase();

    const {
      data: competitions,
      error: competitionError,
    } = await supabase
      .from(COMPETITIONS_TABLE)
      .select(
        "id,name,name_ar,country,competition_type,logo_url,is_active,sort_order,match_limit"
      )
      .eq("is_active", true)
      .order("sort_order", {
        ascending: true,
      })
      .order("name", {
        ascending: true,
      });

    if (competitionError) {
      console.error(
        "Failed to load active competitions:",
        competitionError
      );

      return jsonError(
        "تعذر تحميل إعدادات المسابقات.",
        500
      );
    }

    const activeCompetitions =
      (competitions ??
        []) as CompetitionRow[];

    if (activeCompetitions.length === 0) {
      return NextResponse.json({
        ok: true,
        updated_at:
          new Date().toISOString(),
        competitions: [],
        live: [],
        upcoming: [],
        recent: [],
        today: [],
        next_match: null,
      });
    }

    const activeIds = new Set(
      activeCompetitions.map(
        (competition) => competition.id
      )
    );

    const competitionById =
      new Map(
        activeCompetitions.map(
          (competition) => [
            competition.id,
            competition,
          ]
        )
      );

    const now = new Date();

    const dateFrom =
      new Date(now);
    dateFrom.setDate(
      dateFrom.getDate() - 7
    );

    const dateTo =
      new Date(now);
    dateTo.setDate(
      dateTo.getDate() + 14
    );

    const formatDate = (
      date: Date
    ) =>
      date.toISOString().slice(0, 10);

    const [
      bsdFixtures,
      bsdLive,
    ] = await Promise.all([
      fetchBsdEvents(
        token!,
        formatDate(dateFrom),
        formatDate(dateTo)
      ),
      fetchBsdLive(token!),
    ]);

    const fixtureMap =
      new Map<number, BsdEvent>();

    for (const fixture of [
      ...bsdFixtures,
      ...bsdLive,
    ]) {
      const id = Number(
        fixture.id ?? 0
      );

      if (id > 0) {
        fixtureMap.set(id, fixture);
      }
    }

    const allFixtures =
      Array.from(
        fixtureMap.values()
      ).filter((fixture) => {
        const leagueId =
          Number(
            fixture.league_id ??
              (typeof fixture.league ===
              "object"
                ? fixture.league?.id
                : 0)
          );

        return (
          leagueId > 0 &&
          activeIds.has(leagueId)
        );
      });

    const currentTime =
      Date.now();

    const liveMatches =
      allFixtures
        .filter((fixture) =>
          isLiveStatus(
            fixture.status
          )
        )
        .map((fixture) => {
          const leagueId =
            Number(
              fixture.league_id ??
                (typeof fixture.league ===
                "object"
                  ? fixture.league?.id
                  : 0)
            );

          return mapFixture(
            fixture,
            competitionById.get(
              leagueId
            )!
          );
        })
        .sort(
          (a, b) =>
            Number(
              a.starting_at_timestamp ??
                0
            ) -
            Number(
              b.starting_at_timestamp ??
                0
            )
        );

    const upcomingMatches =
      allFixtures
        .filter((fixture) => {
          const timestamp =
            Number(
              toTimestamp(
                getKickoff(fixture)
              ) ?? 0
            ) * 1000;

          return (
            timestamp >= currentTime &&
            timestamp > 0
          );
        })
        .map((fixture) => {
          const leagueId =
            Number(
              fixture.league_id ??
                (typeof fixture.league ===
                "object"
                  ? fixture.league?.id
                  : 0)
            );

          return mapFixture(
            fixture,
            competitionById.get(
              leagueId
            )!
          );
        })
        .sort(
          (a, b) =>
            Number(
              a.starting_at_timestamp ??
                0
            ) -
            Number(
              b.starting_at_timestamp ??
                0
            )
        );

    const recentMatches =
      allFixtures
        .filter((fixture) => {
          const timestamp =
            Number(
              toTimestamp(
                getKickoff(fixture)
              ) ?? 0
            ) * 1000;

          return (
            timestamp < currentTime &&
            timestamp > 0 &&
            !isLiveStatus(
              fixture.status
            )
          );
        })
        .map((fixture) => {
          const leagueId =
            Number(
              fixture.league_id ??
                (typeof fixture.league ===
                "object"
                  ? fixture.league?.id
                  : 0)
            );

          return mapFixture(
            fixture,
            competitionById.get(
              leagueId
            )!
          );
        })
        .sort(
          (a, b) =>
            Number(
              b.starting_at_timestamp ??
                0
            ) -
            Number(
              a.starting_at_timestamp ??
                0
            )
        );

    const todayMatches =
      allFixtures
        .filter((fixture) =>
          isRiyadhToday(
            getKickoff(fixture)
          )
        )
        .map((fixture) => {
          const leagueId =
            Number(
              fixture.league_id ??
                (typeof fixture.league ===
                "object"
                  ? fixture.league?.id
                  : 0)
            );

          return {
            match: mapFixture(
              fixture,
              competitionById.get(
                leagueId
              )!
            ),
            live: isLiveStatus(
              fixture.status
            ),
          };
        })
        .sort(
          (a, b) =>
            Number(
              a.match
                .starting_at_timestamp ??
                0
            ) -
            Number(
              b.match
                .starting_at_timestamp ??
                0
            )
        );

    const {
      data: visibilityRows,
      error: visibilityError,
    } = await supabase
      .from("football_match_controls")
      .select("match_id,is_visible");

    if (visibilityError) {
      console.error(
        "Failed to load football match visibility controls:",
        visibilityError
      );
    }

    const visibilityMap = new Map<number, boolean>();

    for (const row of visibilityRows ?? []) {
      const matchId = Number(row.match_id);

      if (
        Number.isInteger(matchId) &&
        matchId > 0
      ) {
        visibilityMap.set(
          matchId,
          row.is_visible !== false
        );
      }
    }

    const withVisibility = (
      match: Match
    ): Match => ({
      ...match,
      is_visible:
        visibilityMap.get(match.id) !== false,
    });

    const liveMatchesWithVisibility =
      liveMatches.map(withVisibility);

    const upcomingMatchesWithVisibility =
      upcomingMatches.map(withVisibility);

    const recentMatchesWithVisibility =
      recentMatches.map(withVisibility);

    const todayMatchesWithVisibility =
      todayMatches.map((item) => ({
        ...item,
        match: withVisibility(item.match),
      }));

    const nextMatch =
      upcomingMatchesWithVisibility[0] ?? null;

    const competitionResults =
      activeCompetitions.map(
        (competition) => {
          const take = Math.max(
            1,
            Math.min(
              20,
              Number(
                competition.match_limit
              ) || 4
            )
          );

          const live =
            liveMatchesWithVisibility
              .filter(
                (match) =>
                  match.league.id ===
                  competition.id
              )
              .slice(0, take);

          const upcoming =
            upcomingMatchesWithVisibility
              .filter(
                (match) =>
                  match.league.id ===
                  competition.id
              )
              .slice(0, take);

          const recent =
            recentMatchesWithVisibility
              .filter(
                (match) =>
                  match.league.id ===
                  competition.id
              )
              .slice(0, take);

          const today =
            todayMatchesWithVisibility
              .filter(
                ({ match }) =>
                  match.league.id ===
                  competition.id
              )
              .slice(0, take);

          return {
            id: competition.id,
            name: competition.name,
            name_ar:
              competition.name_ar,
            country:
              competition.country,
            competition_type:
              competition.competition_type,
            image_path:
              competition.logo_url ||
              `https://sports.bzzoiro.com/img/league/${competition.id}/?bg=transparent`,
            available: true,
            error: null,
            match_limit: take,
            counts: {
              today: today.length,
              upcoming: upcoming.length,
              live: live.length,
              recent: recent.length,
            },
            today,
            live,
            upcoming,
            recent,
          };
        }
      );

    return NextResponse.json(
      {
        ok: true,
        updated_at:
          new Date().toISOString(),
        competitions:
          competitionResults,
        today: todayMatchesWithVisibility,
        live:
          liveMatchesWithVisibility.slice(0, 20),
        upcoming:
          upcomingMatchesWithVisibility.slice(0, 20),
        recent:
          recentMatchesWithVisibility.slice(0, 20),
        next_match: nextMatch,
      },
      {
        headers: {
          "Cache-Control":
            "private, max-age=0, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "BSD football matches API error:",
      error
    );

    return jsonError(
      error instanceof Error
        ? error.message
        : "تعذر تحميل بيانات المباريات.",
      502
    );
  }
}