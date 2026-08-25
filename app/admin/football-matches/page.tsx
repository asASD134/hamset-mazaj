"use client";

import {
  CalendarDays,
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  Radio,
  RefreshCw,
  Search,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
  events: Array<{
    id?: number;
    minute?: number | null;
    type_name?: string | null;
    player_name?: string | null;
    result?: string | null;
  }>;
};

type CompetitionMatches = {
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
    today: number;
    upcoming: number;
    live: number;
    recent: number;
  };
  today: Array<{ match: Match; live: boolean }>;
  live: Match[];
  upcoming: Match[];
  recent: Match[];
};

type MatchesResponse = {
  ok: boolean;
  error?: string;
  competitions?: CompetitionMatches[];
  live?: Match[];
  upcoming?: Match[];
  recent?: Match[];
  today?: Array<{ match: Match; live: boolean }>;
  next_match?: Match | null;
};

type MatchControl = {
  match_id: number;
  competition_id: number | null;
  home_team_id: number | null;
  away_team_id: number | null;
  kickoff_at: string | null;
  home_name: string | null;
  away_name: string | null;
  competition_name: string | null;
  is_visible: boolean;
  updated_at?: string | null;
};

type ControlsResponse = {
  ok: boolean;
  error?: string;
  controls?: MatchControl[];
};

type Period = "live" | "today" | "tomorrow" | "day_after_tomorrow";

const RIYADH_TIME_ZONE = "Asia/Riyadh";

function getRiyadhDateParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: RIYADH_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const value = formatter.format(date);
  const [year, month, day] = value.split("-").map(Number);

  return { year, month, day };
}

function makeDateKey(
  year: number,
  month: number,
  day: number
) {
  return `${year}-${String(month).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}`;
}

function shiftRiyadhDate(
  date: Date,
  amount: number
) {
  const parts = getRiyadhDateParts(date);
  const shifted = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day)
  );

  shifted.setUTCDate(
    shifted.getUTCDate() + amount
  );

  return makeDateKey(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth() + 1,
    shifted.getUTCDate()
  );
}

function getMatchDateKey(
  startingAt: string | null
) {
  if (!startingAt) {
    return null;
  }

  return makeDateKey(
    ...(() => {
      const parts = getRiyadhDateParts(
        new Date(startingAt)
      );

      return [parts.year, parts.month, parts.day] as [
        number,
        number,
        number
      ];
    })()
  );
}

function formatMatchDate(
  startingAt: string | null
) {
  if (!startingAt) {
    return "موعد غير محدد";
  }

  return new Intl.DateTimeFormat("ar-SA", {
    timeZone: RIYADH_TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(startingAt));
}

function formatMatchTime(
  startingAt: string | null
) {
  if (!startingAt) {
    return "--";
  }

  return new Intl.DateTimeFormat("ar-SA", {
    timeZone: RIYADH_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(startingAt));
}

function isLiveState(stateId: number | null) {
  return stateId === 3;
}

function isFinishedState(
  stateId: number | null
) {
  return stateId === 5;
}

function periodLabel(period: Period) {
  switch (period) {
    case "live":
      return "مباشر الآن";
    case "today":
      return "اليوم";
    case "tomorrow":
      return "غدًا";
    case "day_after_tomorrow":
      return "بعد غد";
  }
}

export default function FootballMatchesPage() {
  const [matchesData, setMatchesData] =
    useState<MatchesResponse | null>(null);
  const [controls, setControls] =
    useState<Map<number, MatchControl>>(
      new Map()
    );

  const [period, setPeriod] =
    useState<Period>("today");

  const [competitionId, setCompetitionId] =
    useState<string>("all");

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [savingId, setSavingId] =
    useState<number | null>(null);

  const [refreshing, setRefreshing] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  async function loadMatches(
    signal?: AbortSignal
  ) {
    const response = await fetch(
      "/api/football/matches",
      {
        method: "GET",
        cache: "no-store",
        signal,
      }
    );

    const data =
      (await response.json()) as MatchesResponse;

    if (!response.ok || !data.ok) {
      throw new Error(
        data.error ||
          "تعذر تحميل المباريات."
      );
    }

    setMatchesData(data);
  }

  async function loadControls() {
    const response = await fetch(
      "/api/admin/football-match-controls",
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const data =
      (await response.json()) as ControlsResponse;

    if (!response.ok || !data.ok) {
      throw new Error(
        data.error ||
          "تعذر تحميل إعدادات المباريات."
      );
    }

    const nextMap =
      new Map<number, MatchControl>();

    for (
      const control of data.controls ?? []
    ) {
      nextMap.set(
        control.match_id,
        control
      );
    }

    setControls(nextMap);
  }

  async function loadPage() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await Promise.all([
        loadMatches(),
        loadControls(),
      ]);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "تعذر تحميل البيانات."
      );
    } finally {
      setLoading(false);
    }
  }

  async function refreshPage() {
    setRefreshing(true);
    setError("");
    setMessage("");

    try {
      await Promise.all([
        loadMatches(),
        loadControls(),
      ]);

      setMessage(
        "تم تحديث المباريات بنجاح."
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "تعذر تحديث المباريات."
      );
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const controller =
      new AbortController();

    Promise.all([
      loadMatches(
        controller.signal
      ),
      loadControls(),
    ])
      .catch((err) => {
        if (
          err instanceof DOMException &&
          err.name === "AbortError"
        ) {
          return;
        }

        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "تعذر تحميل البيانات."
        );
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, []);

  const allMatches = useMemo(() => {
    if (!matchesData) {
      return [];
    }

    const map =
      new Map<number, Match>();

    for (
      const match of matchesData.live ?? []
    ) {
      map.set(match.id, match);
    }

    for (
      const match of matchesData.upcoming ?? []
    ) {
      map.set(match.id, match);
    }

    for (
      const match of matchesData.recent ?? []
    ) {
      map.set(match.id, match);
    }

    for (
      const item of matchesData.today ?? []
    ) {
      map.set(item.match.id, item.match);
    }

    for (
      const competition of
        matchesData.competitions ?? []
    ) {
      for (
        const item of competition.today ?? []
      ) {
        map.set(item.match.id, item.match);
      }

      for (
        const match of competition.live ?? []
      ) {
        map.set(match.id, match);
      }

      for (
        const match of competition.upcoming ?? []
      ) {
        map.set(match.id, match);
      }

      for (
        const match of competition.recent ?? []
      ) {
        map.set(match.id, match);
      }
    }

    return Array.from(map.values());
  }, [matchesData]);

  const filteredMatches = useMemo(() => {
    const now = new Date();

    const todayKey =
      shiftRiyadhDate(now, 0);

    const tomorrowKey =
      shiftRiyadhDate(now, 1);

    const dayAfterTomorrowKey =
      shiftRiyadhDate(now, 2);

    const query =
      search.trim().toLowerCase();

    return allMatches
      .filter((match) => {
        if (
          competitionId !== "all" &&
          String(
            match.league.id
          ) !== competitionId
        ) {
          return false;
        }

        if (query) {
          const haystack = [
            match.home.name,
            match.away.name,
            match.league.name,
          ]
            .join(" ")
            .toLowerCase();

          if (!haystack.includes(query)) {
            return false;
          }
        }

        if (period === "live") {
          return isLiveState(
            match.state_id
          );
        }

        const key =
          getMatchDateKey(
            match.starting_at
          );

        if (period === "today") {
          return key === todayKey;
        }

        if (period === "tomorrow") {
          return key === tomorrowKey;
        }

        return (
          key ===
          dayAfterTomorrowKey
        );
      })
      .sort((a, b) => {
        const aTime =
          a.starting_at_timestamp ??
          Number.MAX_SAFE_INTEGER;

        const bTime =
          b.starting_at_timestamp ??
          Number.MAX_SAFE_INTEGER;

        return aTime - bTime;
      });
  }, [
    allMatches,
    competitionId,
    period,
    search,
  ]);

  const competitions = useMemo(() => {
    const map =
      new Map<number, {
        id: number;
        name: string;
      }>();

    for (
      const competition of
        matchesData?.competitions ?? []
    ) {
      map.set(competition.id, {
        id: competition.id,
        name:
          competition.name_ar ||
          competition.name,
      });
    }

    for (
      const match of allMatches
    ) {
      if (
        match.league.id != null &&
        !map.has(match.league.id)
      ) {
        map.set(match.league.id, {
          id: match.league.id,
          name: match.league.name,
        });
      }
    }

    return Array.from(map.values()).sort(
      (a, b) =>
        a.name.localeCompare(
          b.name,
          "ar"
        )
    );
  }, [allMatches, matchesData]);

  async function toggleVisibility(
    match: Match
  ) {
    const current =
      controls.get(match.id);

    const isVisible =
      current?.is_visible ?? true;

    const nextVisible =
      !isVisible;

    setSavingId(match.id);
    setError("");
    setMessage("");

    const control: MatchControl = {
      match_id: match.id,
      competition_id:
        match.league.id,
      home_team_id:
        match.home.id,
      away_team_id:
        match.away.id,
      kickoff_at:
        match.starting_at,
      home_name:
        match.home.name,
      away_name:
        match.away.name,
      competition_name:
        match.league.name,
      is_visible:
        nextVisible,
    };

    try {
      const response = await fetch(
        "/api/admin/football-match-controls",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            control
          ),
        }
      );

      const data =
        (await response.json()) as {
          ok: boolean;
          error?: string;
          control?: MatchControl;
        };

      if (
        !response.ok ||
        !data.ok
      ) {
        throw new Error(
          data.error ||
            "تعذر حفظ حالة المباراة."
        );
      }

      setControls((currentMap) => {
        const next = new Map(
          currentMap
        );

        next.set(
          match.id,
          data.control ??
            control
        );

        return next;
      });

      setMessage(
        nextVisible
          ? `تم إظهار مباراة ${match.home.name} × ${match.away.name}.`
          : `تم إخفاء مباراة ${match.home.name} × ${match.away.name}.`
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "تعذر حفظ حالة المباراة."
      );
    } finally {
      setSavingId(null);
    }
  }

  const visibleCount =
    filteredMatches.filter(
      (match) =>
        controls.get(
          match.id
        )?.is_visible !== false
    ).length;

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#050505] text-white"
    >
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 px-4 py-2 text-xs font-black text-yellow-400">
              <Trophy size={15} />
              إدارة المباريات
            </div>

            <h1 className="text-3xl font-black sm:text-4xl">
              اختيار المباريات الظاهرة
            </h1>

            <p className="mt-3 max-w-3xl leading-7 text-zinc-400">
              اختر اليوم أو غدًا أو بعد غد،
              ثم حدّد المباريات التي تريد
              ظهورها للزوار بشكل مستقل.
            </p>
          </div>

          <button
            type="button"
            onClick={
              refreshPage
            }
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-500 px-5 py-3 font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {refreshing ? (
              <LoaderCircle
                size={18}
                className="animate-spin"
              />
            ) : (
              <RefreshCw size={18} />
            )}
            تحديث المباريات
          </button>
        </div>

        {(message || error) && (
          <div
            className={`mb-6 rounded-2xl border p-4 text-sm font-bold ${
              error
                ? "border-red-500/20 bg-red-500/5 text-red-300"
                : "border-emerald-500/20 bg-emerald-500/5 text-emerald-300"
            }`}
          >
            {error || message}
          </div>
        )}

        <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-sm font-black text-zinc-400">
                الفترة
              </div>

              <div className="mt-1 text-xs text-zinc-600">
                المباريات المتاحة من مزود البيانات
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  "live",
                  "today",
                  "tomorrow",
                  "day_after_tomorrow",
                ] as Period[]
              ).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setPeriod(item)
                  }
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition ${
                    period === item
                      ? "bg-yellow-500 text-black"
                      : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                  }`}
                >
                  {item === "live" ? (
                    <Radio size={16} />
                  ) : (
                    <CalendarDays
                      size={16}
                    />
                  )}

                  {periodLabel(item)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <label className="relative block">
              <Search
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="ابحث باسم الأهلي أو الهلال أو البطولة..."
                className="w-full rounded-2xl border border-white/10 bg-black/30 py-3.5 pl-4 pr-11 text-sm text-white outline-none transition focus:border-yellow-500/40"
              />
            </label>

            <select
              value={competitionId}
              onChange={(event) =>
                setCompetitionId(
                  event.target.value
                )
              }
              className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm font-bold text-white outline-none focus:border-yellow-500/40"
            >
              <option value="all">
                كل البطولات
              </option>

              {competitions.map(
                (competition) => (
                  <option
                    key={
                      competition.id
                    }
                    value={
                      competition.id
                    }
                  >
                    {competition.name}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
            <div className="text-xs font-bold text-zinc-500">
              مباريات الفترة
            </div>
            <div className="mt-2 text-3xl font-black text-white">
              {filteredMatches.length}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
            <div className="text-xs font-bold text-zinc-500">
              الظاهرة على الموقع
            </div>
            <div className="mt-2 text-3xl font-black text-emerald-400">
              {visibleCount}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
            <div className="text-xs font-bold text-zinc-500">
              المخفية
            </div>
            <div className="mt-2 text-3xl font-black text-red-400">
              {Math.max(
                filteredMatches.length -
                  visibleCount,
                0
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03]">
            <div className="flex items-center gap-3 text-zinc-400">
              <LoaderCircle
                size={24}
                className="animate-spin"
              />
              جاري تحميل المباريات...
            </div>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-yellow-400">
              <CalendarDays size={28} />
            </div>

            <h2 className="mt-5 text-xl font-black">
              لا توجد مباريات
            </h2>

            <p className="mt-2 text-sm leading-7 text-zinc-500">
              لم نجد مباريات لهذه الفترة أو
              معايير البحث الحالية.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filteredMatches.map(
              (match) => {
                const control =
                  controls.get(
                    match.id
                  );

                const isVisible =
                  control?.is_visible !==
                  false;

                const saving =
                  savingId ===
                  match.id;

                return (
                  <article
                    key={
                      match.id
                    }
                    className={`overflow-hidden rounded-3xl border transition ${
                      isVisible
                        ? "border-emerald-500/20 bg-emerald-500/[0.03]"
                        : "border-white/10 bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        {match.league
                          .image_path ? (
                          <img
                            src={
                              match.league
                                .image_path
                            }
                            alt=""
                            className="h-10 w-10 object-contain"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-yellow-400">
                            <Trophy
                              size={18}
                            />
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="truncate text-sm font-black text-white">
                            {match.league.name}
                          </div>

                          <div className="mt-1 text-xs text-zinc-500">
                            {formatMatchDate(
                              match.starting_at
                            )}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-black ${
                          isVisible
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-zinc-900 text-zinc-500"
                        }`}
                      >
                        {isVisible
                          ? "ظاهر"
                          : "مخفي"}
                      </span>
                    </div>

                    <div className="p-5">
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                        <div className="text-center">
                          {match.home
                            .image_path ? (
                            <img
                              src={
                                match.home
                                  .image_path
                              }
                              alt=""
                              className="mx-auto h-14 w-14 object-contain"
                            />
                          ) : (
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-xl">
                              ⚽
                            </div>
                          )}

                          <div className="mt-3 text-sm font-black text-white">
                            {match.home.name}
                          </div>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-yellow-500 text-xs font-black text-black">
                          VS
                        </div>

                        <div className="text-center">
                          {match.away
                            .image_path ? (
                            <img
                              src={
                                match.away
                                  .image_path
                              }
                              alt=""
                              className="mx-auto h-14 w-14 object-contain"
                            />
                          ) : (
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-xl">
                              ⚽
                            </div>
                          )}

                          <div className="mt-3 text-sm font-black text-white">
                            {match.away.name}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-center">
                          <div className="text-xs font-bold text-zinc-600">
                            الموعد
                          </div>

                          <div className="mt-2 text-lg font-black text-yellow-400">
                            {formatMatchTime(
                              match.starting_at
                            )}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-center">
                          <div className="text-xs font-bold text-zinc-600">
                            الحالة
                          </div>

                          <div className="mt-2 text-sm font-black text-white">
                            {isLiveState(
                              match.state_id
                            )
                              ? "مباشرة الآن"
                              : isFinishedState(
                                  match.state_id
                                )
                              ? "انتهت"
                              : periodLabel(
                                  period
                                )}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`mt-5 flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black ${
                          isVisible
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                            : "border-red-500/20 bg-red-500/10 text-red-300"
                        }`}
                      >
                        {isVisible ? (
                          <>
                            <Check size={18} />
                            الحالة الحالية: المباراة ظاهرة للزوار
                          </>
                        ) : (
                          <>
                            <EyeOff size={18} />
                            الحالة الحالية: المباراة مخفية عن الزوار
                          </>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          toggleVisibility(
                            match
                          )
                        }
                        disabled={saving}
                        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          isVisible
                            ? "bg-red-500/10 text-red-300 hover:bg-red-500/20"
                            : "bg-emerald-500 text-black hover:bg-emerald-400"
                        }`}
                      >
                        {saving ? (
                          <LoaderCircle
                            size={18}
                            className="animate-spin"
                          />
                        ) : isVisible ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}

                        {saving
                          ? "جاري الحفظ..."
                          : isVisible
                          ? "اضغط هنا لإخفاء المباراة"
                          : "اضغط هنا لإظهار المباراة"}
                      </button>

                      <div className="mt-3 text-center text-xs text-zinc-600">
                        الزر يغيّر الحالة الحالية إلى الحالة المعروضة عليه.
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </div>
    </main>
  );
}