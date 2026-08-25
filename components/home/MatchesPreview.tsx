"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Radio,
  Trophy,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useSiteControl } from "@/context/SiteControlContext";

type Team = {
  id: number | null;
  name: string;
  short_code: string | null;
  image_path: string | null;
  score: number;
};

type MatchEvent = {
  id: number | null;
  minute: number | null;
  extra_minute: number | null;
  player_name: string | null;
  related_player_name: string | null;
  result: string | null;
  type_name: string | null;
};

type Match = {
  id: number;
  name: string;
  starting_at: string | null;
  starting_at_timestamp: number | null;
  state_id: number | null;
  result_info: string | null;
  /**
   * يتحكم في ظهور المباراة للزوار.
   * عند عدم وجود القيمة القديمة تعتبر المباراة ظاهرة،
   * حتى لا تختفي المباريات الموجودة سابقًا بعد التحديث.
   */
  is_visible?: boolean;
  league: {
    id: number | null;
    name: string;
    image_path: string | null;
  };
  home: Team;
  away: Team;
  events: MatchEvent[];
};

type Competition = {
  id: number;
  name: string;
  name_ar: string | null;
  country: string | null;
  competition_type: string | null;
  image_path: string | null;
  available: boolean;
  error: string | null;
  match_limit: number;
  counts?: {
    today?: number;
    upcoming?: number;
    live?: number;
    recent?: number;
  };
  today?: {
    match: Match;
    live: boolean;
  }[];
  live: Match[];
  upcoming: Match[];
  recent: Match[];
};

type MatchesResponse = {
  ok: boolean;
  error?: string;
  updated_at?: string;
  live?: Match[];
  upcoming?: Match[];
  recent?: Match[];
  today?: {
    match: Match;
    live: boolean;
  }[];
  next_match?: Match | null;
  competitions?: Competition[];
};

type MatchTypography = {
  title: number;
  description: number;
  date: number;
  time: number;
  competition: number;
  teamName: number;
  countdown: number;
};

function formatKickoff(value: string | null) {
  if (!value) {
    return { date: "", time: "" };
  }

  const date = new Date(value);

  try {
    return {
      date: new Intl.DateTimeFormat("ar-SA", {
        timeZone: "Asia/Riyadh",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date),
      time: new Intl.DateTimeFormat("ar-SA", {
        timeZone: "Asia/Riyadh",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(date),
    };
  } catch {
    return { date: value, time: "" };
  }
}

function isFinished(
  stateId: number | null
) {
  return [
    5,
    6,
    7,
    8,
    9,
  ].includes(Number(stateId));
}

function getCountdown(
  timestamp: number | null,
  now: number
) {
  if (!timestamp) {
    return null;
  }

  const diff =
    timestamp * 1000 - now;

  if (diff <= 0) {
    return "بدأت المباراة";
  }

  const totalMinutes =
    Math.floor(
      diff / 1000 / 60
    );

  const days =
    Math.floor(
      totalMinutes / 1440
    );

  const hours =
    Math.floor(
      (totalMinutes % 1440) / 60
    );

  const minutes =
    totalMinutes % 60;

  if (days > 0) {
    return `${days} يوم و ${hours} ساعة`;
  }

  if (hours > 0) {
    return `${hours} ساعة و ${minutes} دقيقة`;
  }

  return `${minutes} دقيقة`;
}


function isMatchVisible(match: Match) {
  // لا نعرض أي مباراة ما لم يؤكد الـAPI أنها ظاهرة.
  return match.is_visible === true;
}

function MatchCard({
  match,
  live,
  primaryColor,
  surfaceColor,
  now,
  highlight = false,
  typography,
}: {
  match: Match;
  live: boolean;
  primaryColor: string;
  surfaceColor: string;
  now: number;
  highlight?: boolean;
  typography: MatchTypography;
}) {
  const events = match.events
    .filter(
      (event) =>
        event.player_name ||
        event.type_name
    )
    .slice(-3);

  const countdown =
    !live &&
    !isFinished(match.state_id)
      ? getCountdown(
          match.starting_at_timestamp,
          now
        )
      : null;

  const kickoff = formatKickoff(
    match.starting_at
  );

  return (
    <div
      className={`overflow-hidden rounded-3xl border ${
        highlight
          ? "ring-2 ring-yellow-500/30"
          : ""
      }`}
      style={{
        backgroundColor: surfaceColor,
        borderColor: `${primaryColor}30`,
      }}
    >
      {/* معلومات المباراة — كلها في المنتصف */}
      <div className="border-b border-white/10 px-4 py-5 text-center sm:px-6">
        {match.league.name && (
          <div
            className="font-black text-zinc-400"
            style={{
              fontSize: `${typography.competition}px`,
            }}
          >
            {match.league.name}
          </div>
        )}

        {highlight && (
          <div
            className="mt-2 inline-flex rounded-full px-3 py-1 font-black"
            style={{
              backgroundColor: `${primaryColor}12`,
              color: primaryColor,
              fontSize: `${Math.max(
                typography.competition,
                12
              )}px`,
            }}
          >
            أقرب مباراة قادمة
          </div>
        )}

        {live ? (
          <div
            className="mt-3 flex items-center justify-center gap-2 font-black"
            style={{
              color: primaryColor,
              fontSize: `${Math.max(
                typography.time,
                16
              )}px`,
            }}
          >
            <Radio
              size={18}
              className="animate-pulse"
            />
            مباشر الآن
          </div>
        ) : isFinished(match.state_id) ? (
          <div
            className="mt-3 font-black text-zinc-400"
            style={{
              fontSize: `${typography.date}px`,
            }}
          >
            انتهت المباراة
          </div>
        ) : (
          <>
            <div
              className="mt-3 font-black text-white"
              style={{
                fontSize: `${typography.date}px`,
              }}
            >
              {kickoff.date}
            </div>

            <div
              className="mt-1 font-black text-yellow-400"
              style={{
                fontSize: `${typography.time}px`,
              }}
            >
              {kickoff.time}
            </div>

            {countdown && (
              <div
                className="mt-2 font-black"
                style={{
                  color: primaryColor,
                  fontSize: `${typography.countdown}px`,
                }}
              >
                تبدأ بعد {countdown}
              </div>
            )}
          </>
        )}
      </div>

      {/* الفريقان — الشعار فوق الاسم */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-6 sm:gap-5 sm:px-6 sm:py-7">
        <div className="flex min-w-0 flex-col items-center justify-center text-center">
          {match.home.image_path ? (
            <Image
              src={match.home.image_path}
              alt={match.home.name}
              width={72}
              height={72}
              className="h-[72px] w-[72px] object-contain sm:h-20 sm:w-20"
            />
          ) : (
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-zinc-800 text-2xl sm:h-20 sm:w-20">
              ⚽
            </div>
          )}

          <div
            className="mt-3 max-w-[150px] font-black leading-7 text-white sm:max-w-[180px]"
            style={{
              fontSize: `${typography.teamName}px`,
            }}
          >
            {match.home.name}
          </div>

          {live || isFinished(match.state_id) ? (
            <div
              className="mt-2 text-3xl font-black"
              style={{ color: primaryColor }}
            >
              {match.home.score}
            </div>
          ) : (
            <div className="mt-1 text-xs font-bold text-zinc-600">
              صاحب الأرض
            </div>
          )}
        </div>

        <div className="flex items-center justify-center">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full border font-black text-black sm:h-12 sm:w-12"
            style={{
              backgroundColor: primaryColor,
              borderColor: primaryColor,
            }}
          >
            VS
          </div>
        </div>

        <div className="flex min-w-0 flex-col items-center justify-center text-center">
          {match.away.image_path ? (
            <Image
              src={match.away.image_path}
              alt={match.away.name}
              width={72}
              height={72}
              className="h-[72px] w-[72px] object-contain sm:h-20 sm:w-20"
            />
          ) : (
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-zinc-800 text-2xl sm:h-20 sm:w-20">
              ⚽
            </div>
          )}

          <div
            className="mt-3 max-w-[150px] font-black leading-7 text-white sm:max-w-[180px]"
            style={{
              fontSize: `${typography.teamName}px`,
            }}
          >
            {match.away.name}
          </div>

          {live || isFinished(match.state_id) ? (
            <div
              className="mt-2 text-3xl font-black"
              style={{ color: primaryColor }}
            >
              {match.away.score}
            </div>
          ) : (
            <div className="mt-1 text-xs font-bold text-zinc-600">
              خارج الأرض
            </div>
          )}
        </div>
      </div>

      {events.length > 0 && (
        <div className="border-t border-white/10 px-5 py-4">
          <div className="mb-3 text-center text-xs font-black text-zinc-500">
            آخر الأحداث
          </div>

          <div className="space-y-2">
            {events.map((event, index) => (
              <div
                key={`${match.id}-${event.id ?? index}`}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="text-zinc-500">
                  {event.minute != null
                    ? `${event.minute}'`
                    : ""}
                </span>

                <span className="flex-1 text-center font-bold text-zinc-200">
                  {event.type_name || "حدث"}
                  {event.player_name
                    ? ` — ${event.player_name}`
                    : ""}
                </span>

                {event.result && (
                  <span
                    className="font-black"
                    style={{ color: primaryColor }}
                  >
                    {event.result}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {match.result_info && (
        <div className="border-t border-white/10 px-5 py-4 text-center text-sm leading-7 text-zinc-500">
          {match.result_info}
        </div>
      )}
    </div>
  );
}

export default function MatchesPreview() {
  const siteControl =
    useSiteControl();

  const [data, setData] =
    useState<MatchesResponse | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [now, setNow] =
    useState<number>(0);

  const [
    selectedCompetitionId,
    setSelectedCompetitionId,
  ] = useState<number | "all">(
    "all"
  );

  const showTitle =
    siteControl?.show_matches_title !==
    false;

  const showDescription =
    siteControl?.show_matches_description !==
    false;

  const showList =
    siteControl?.show_matches_list !==
    false;

  const showButton =
    siteControl?.show_matches_button !==
    false;

  const title =
    siteControl?.matches_title ||
    "مباريات اليوم";

  const description =
    siteControl?.matches_description ||
    "تابع مباريات اليوم وأقرب المباريات القادمة مباشرة من أهم البطولات.";

  const primaryColor =
    siteControl?.primary_color ||
    "#EAB308";

  const backgroundColor =
    siteControl?.background_color ||
    "#0A0A0A";

  const surfaceColor =
    siteControl?.surface_color ||
    "#121212";

  const matchTypography: MatchTypography = {
    title:
      siteControl?.typography?.matches_title?.desktop ??
      36,
    description:
      siteControl?.typography?.matches_description?.desktop ??
      18,
    date:
      siteControl?.typography?.matches_date?.desktop ??
      18,
    time:
      siteControl?.typography?.matches_time?.desktop ??
      28,
    competition:
      siteControl?.typography?.matches_competition?.desktop ??
      14,
    teamName:
      siteControl?.typography?.matches_team_name?.desktop ??
      18,
    countdown:
      siteControl?.typography?.matches_countdown?.desktop ??
      14,
  };

  async function loadMatches(
    signal?: AbortSignal
  ) {
    try {
      setError("");

      const response =
        await fetch(
          "/api/football/matches",
          {
            method: "GET",
            cache: "no-store",
            signal,
          }
        );

      const result =
        (await response.json()) as MatchesResponse;

      if (
        !response.ok ||
        !result.ok
      ) {
        throw new Error(
          result.error ||
            "تعذر تحميل المباريات."
        );
      }

      setData(result);
    } catch (err) {
      if (
        err instanceof DOMException &&
        err.name ===
          "AbortError"
      ) {
        return;
      }

      console.error(
        "Failed to load matches:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "تعذر تحميل المباريات."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setNow(
      new Date().getTime()
    );

    const controller =
      new AbortController();

    loadMatches(
      controller.signal
    );

    const matchInterval =
      window.setInterval(() => {
        loadMatches();
      }, 15000);

    const clockInterval =
      window.setInterval(() => {
        setNow(
          new Date().getTime()
        );
      }, 30000);

    return () => {
      controller.abort();
      window.clearInterval(
        matchInterval
      );
      window.clearInterval(
        clockInterval
      );
    };
  }, []);

  const competitions =
    useMemo(
      () =>
        (data?.competitions ?? [])
          .filter(
            (competition) =>
              competition.available
          )
          .map((competition) => ({
            ...competition,
            today: (
              competition.today ?? []
            ).filter(({ match }) =>
              isMatchVisible(match)
            ),
            live: (
              competition.live ?? []
            ).filter(isMatchVisible),
            upcoming: (
              competition.upcoming ?? []
            ).filter(isMatchVisible),
            recent: (
              competition.recent ?? []
            ).filter(isMatchVisible),
          }))
          .filter(
            (competition) =>
              competition.today.length > 0 ||
              competition.live.length > 0 ||
              competition.upcoming.length > 0 ||
              competition.recent.length > 0
          ),
      [data]
    );

  const filteredCompetitions =
    useMemo(() => {
      if (
        selectedCompetitionId ===
        "all"
      ) {
        return competitions;
      }

      return competitions.filter(
        (competition) =>
          competition.id ===
          selectedCompetitionId
      );
    }, [
      competitions,
      selectedCompetitionId,
    ]);

  const todayMatches =
    useMemo(() => {
      let items = (
        data?.today ?? []
      ).filter(({ match }) =>
        isMatchVisible(match)
      );

      if (
        selectedCompetitionId !==
        "all"
      ) {
        items = items.filter(
          ({ match }) =>
            match.league.id ===
            selectedCompetitionId
        );
      }

      return items;
    }, [
      data?.today,
      selectedCompetitionId,
    ]);

  const nextMatch =
    useMemo(() => {
      if (
        selectedCompetitionId !==
        "all"
      ) {
        return (
          filteredCompetitions
            .flatMap(
              (competition) =>
                competition.upcoming
            )
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
            )[0] ?? null
        );
      }

      const candidate =
        data?.next_match ?? null;

      return candidate &&
        isMatchVisible(candidate)
        ? candidate
        : (
            data?.upcoming ?? []
          )
            .filter(
              isMatchVisible
            )
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
            )[0] ?? null;
    }, [
      data?.next_match,
      data?.upcoming,
      filteredCompetitions,
      selectedCompetitionId,
    ]);

  const upcomingMatches =
    useMemo(() => {
      return filteredCompetitions.flatMap(
        (competition) =>
          competition.upcoming.slice(
            0,
            Math.max(
              1,
              Math.min(
                4,
                competition.match_limit ||
                  4
              )
            )
          )
      );
    }, [
      filteredCompetitions,
    ]);

  const liveMatches =
    useMemo(() => {
      return filteredCompetitions.flatMap(
        (competition) =>
          competition.live
      );
    }, [filteredCompetitions]);

  if (
    siteControl?.matches_enabled ===
    false
  ) {
    return null;
  }

  return (
    <section
      dir="rtl"
      className="py-20"
      style={{
        backgroundColor,
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        {(showTitle ||
          showDescription) && (
          <div className="mb-10 text-center">
            {showTitle && (
              <div className="flex flex-col items-center">
                <div
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor:
                      primaryColor,
                    color:
                      "#000000",
                  }}
                >
                  <Trophy size={28} />
                </div>

                <h2
                  className="font-black text-white"
                  style={{
                    fontSize: `${matchTypography.title}px`,
                  }}
                >
                  {title}
                </h2>
              </div>
            )}

            {showDescription && (
              <p
                className="mx-auto mt-4 max-w-2xl leading-8 text-zinc-400"
                style={{
                  fontSize: `${matchTypography.description}px`,
                }}
              >
                {description}
              </p>
            )}
          </div>
        )}

        {showList && (
          <>
            {loading ? (
              <div className="grid gap-6 md:grid-cols-2">
                {Array.from({
                  length: 4,
                }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="h-72 animate-pulse rounded-3xl bg-zinc-900"
                    />
                  )
                )}
              </div>
            ) : error ? (
              <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center">
                <p className="font-bold text-red-400">
                  {error}
                </p>
              </div>
            ) : (
              <div className="space-y-10">

                {competitions.length >
                  0 && (
                  <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.25)] sm:p-5">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-lg font-black text-white">
                          اختر البطولة
                        </div>
                        <div className="mt-1 text-xs font-bold text-zinc-500">
                          اختر البطولة لعرض مبارياتها
                        </div>
                      </div>

                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border"
                        style={{
                          color: primaryColor,
                          borderColor: `${primaryColor}44`,
                          backgroundColor: `${primaryColor}10`,
                        }}
                      >
                        <Trophy size={18} />
                      </div>
                    </div>

                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-zinc-950/90 to-transparent" />

                      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedCompetitionId(
                              "all"
                            )
                          }
                          aria-pressed={
                            selectedCompetitionId ===
                            "all"
                          }
                          className="shrink-0 rounded-2xl border px-5 py-3 text-sm font-black transition-all duration-200 hover:-translate-y-0.5"
                          style={
                            selectedCompetitionId ===
                            "all"
                              ? {
                                  borderColor:
                                    primaryColor,
                                  backgroundColor:
                                    primaryColor,
                                  color:
                                    "#000000",
                                  boxShadow: `0 8px 24px ${primaryColor}33`,
                                }
                              : {
                                  borderColor:
                                    "rgba(255,255,255,0.10)",
                                  backgroundColor:
                                    "rgba(255,255,255,0.04)",
                                  color:
                                    "rgba(255,255,255,0.82)",
                                }
                          }
                        >
                          كل البطولات
                        </button>

                        {competitions.map(
                          (
                            competition
                          ) => {
                            const selected =
                              selectedCompetitionId ===
                              competition.id;

                            return (
                              <button
                                key={
                                  competition.id
                                }
                                type="button"
                                onClick={() =>
                                  setSelectedCompetitionId(
                                    competition.id
                                  )
                                }
                                aria-pressed={
                                  selected
                                }
                                className="group shrink-0 rounded-2xl border px-5 py-3 text-sm font-black transition-all duration-200 hover:-translate-y-0.5"
                                style={
                                  selected
                                    ? {
                                        borderColor:
                                          primaryColor,
                                        backgroundColor:
                                          `${primaryColor}18`,
                                        color:
                                          primaryColor,
                                        boxShadow:
                                          `0 8px 24px ${primaryColor}1f`,
                                      }
                                    : {
                                        borderColor:
                                          "rgba(255,255,255,0.10)",
                                        backgroundColor:
                                          "rgba(255,255,255,0.04)",
                                        color:
                                          "rgba(255,255,255,0.82)",
                                      }
                                }
                              >
                                <span className="flex items-center gap-2">
                                  {competition.image_path ? (
                                    <Image
                                      src={
                                        competition.image_path
                                      }
                                      alt=""
                                      width={24}
                                      height={24}
                                      className="h-6 w-6 object-contain"
                                    />
                                  ) : (
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-xs">
                                      🏆
                                    </span>
                                  )}

                                  <span className="max-w-[180px] truncate">
                                    {competition.name_ar ||
                                      competition.name}
                                  </span>
                                </span>
                              </button>
                            );
                          }
                        )}
                      </div>

                      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-zinc-950/90 to-transparent" />
                    </div>
                  </div>
                )}

                {nextMatch && (
                  <div>
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <h3 className="text-xl font-black text-white">
                        أقرب مباراة
                      </h3>

                      <span
                        className="rounded-full border px-3 py-1 text-xs font-black"
                        style={{
                          borderColor:
                            `${primaryColor}66`,
                          color:
                            primaryColor,
                        }}
                      >
                        العد التنازلي
                      </span>
                    </div>

                    <MatchCard
                      match={
                        nextMatch
                      }
                      live={false}
                      primaryColor={
                        primaryColor
                      }
                      surfaceColor={
                        surfaceColor
                      }
                      now={now}
                      highlight
                      typography={matchTypography}
                    />
                  </div>
                )}

                {todayMatches.length >
                  0 && (
                  <div>
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <h3 className="text-xl font-black text-white">
                        مباريات اليوم
                      </h3>

                      <span
                        className="rounded-full border px-3 py-1 text-xs font-black"
                        style={{
                          borderColor:
                            `${primaryColor}66`,
                          color:
                            primaryColor,
                        }}
                      >
                        {todayMatches.length}{" "}
                        مباراة
                      </span>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      {todayMatches
                        .slice(
                          0,
                          12
                        )
                        .map(
                          ({
                            match,
                            live,
                          }) => (
                            <MatchCard
                              key={
                                match.id
                              }
                              match={
                                match
                              }
                              live={
                                live
                              }
                              primaryColor={
                                primaryColor
                              }
                              surfaceColor={
                                surfaceColor
                              }
                              now={now}
                              typography={matchTypography}
                            />
                          )
                        )}
                    </div>
                  </div>
                )}

                {upcomingMatches.length >
                  0 && (
                  <div>
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <h3 className="text-xl font-black text-white">
                        المباريات القادمة
                      </h3>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      {upcomingMatches
                        .slice(
                          0,
                          12
                        )
                        .map(
                          (
                            match
                          ) => (
                            <MatchCard
                              key={
                                match.id
                              }
                              match={
                                match
                              }
                              live={false}
                              primaryColor={
                                primaryColor
                              }
                              surfaceColor={
                                surfaceColor
                              }
                              now={now}
                              typography={matchTypography}
                            />
                          )
                        )}
                    </div>
                  </div>
                )}

                {!nextMatch &&
                  todayMatches.length ===
                    0 &&
                  upcomingMatches.length ===
                    0 && (
                    <div className="rounded-3xl border border-white/10 bg-zinc-900 p-10 text-center">
                      <p className="font-bold text-zinc-400">
                        لا توجد مباريات
                        متاحة حاليًا.
                      </p>
                    </div>
                  )}
              </div>
            )}
          </>
        )}

        {showButton && (
          <div className="mt-10 text-center">
            <Link
              href="/matches"
              className="inline-flex items-center gap-3 rounded-2xl border px-7 py-3.5 font-black transition hover:-translate-y-1"
              style={{
                borderColor:
                  `${primaryColor}99`,
                color:
                  primaryColor,
              }}
            >
              عرض جميع المباريات
              <ArrowLeft size={20} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}