import Image from "next/image";
import { headers } from "next/headers";
import Link from "next/link";
import getCafeName from "@/lib/getCafeName";

type Team = {
  name: string;
  image_path: string | null;
  score: number;
};

type Match = {
  id: number;
  name: string;
  starting_at: string | null;
  starting_at_timestamp: number | null;
  state_id: number | null;
  is_visible?: boolean;
  league: {
    id: number | null;
    name: string;
    image_path: string | null;
  };
  home: Team;
  away: Team;
};

type Competition = {
  id: number;
  name: string;
  name_ar: string | null;
  country: string | null;
  competition_type: string | null;
  image_path: string | null;
  available: boolean;
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
  competitions?: Competition[];

  today?: {
    match: Match;
    live: boolean;
  }[];

  next_match?: Match | null;
};

function formatDate(
  value: string | null
) {
  if (!value) return "";

  try {
    return new Intl.DateTimeFormat(
      "ar-SA",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "numeric",
        minute: "2-digit",
      }
    ).format(new Date(value));
  } catch {
    return value;
  }
}

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

function isToday(
  value: string | null
) {
  if (!value) return false;

  const formatter =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Riyadh",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    );

  return (
    formatter.format(
      new Date(value)
    ) ===
    formatter.format(new Date())
  );
}

function isMatchVisible(match: Match) {
  return match.is_visible !== false;
}

function MatchCard({
  match,
  live,
  highlight = false,
}: {
  match: Match;
  live: boolean;
  highlight?: boolean;
}) {
  return (
    <article
      className={`overflow-hidden rounded-3xl border bg-white/[0.03] ${
        highlight
          ? "border-yellow-500/50 ring-2 ring-yellow-500/10"
          : "border-white/10"
      }`}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          {live ? (
            <span className="font-black text-red-400">
              🔴 مباشر الآن
            </span>
          ) : (
            isFinished(match.state_id) ? (
              <span className="text-sm font-bold text-zinc-400">
                انتهت المباراة
              </span>
            ) : (
              <div className="flex flex-col gap-1">
                <span className="text-sm font-black text-white">
                  {formatKickoff(match.starting_at).date}
                </span>
                <span className="text-lg font-black text-yellow-400">
                  {formatKickoff(match.starting_at).time}
                </span>
              </div>
            )
          )}
        </div>

        <span className="text-xs font-bold text-zinc-500">
          {match.league.name}
        </span>
      </div>

      {highlight && (
        <div className="bg-yellow-500/10 px-5 py-3 text-center text-sm font-black text-yellow-400">
          ⭐ أقرب مباراة قادمة
        </div>
      )}

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 p-6">
        <div className="text-center">
          {match.home.image_path ? (
            <Image
              src={match.home.image_path}
              alt={match.home.name}
              width={72}
              height={72}
              className="mx-auto h-16 w-16 object-contain"
            />
          ) : (
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
              ⚽
            </div>
          )}

          <h3 className="mt-3 font-black text-white">
            {match.home.name}
          </h3>

          {(live ||
            isFinished(
              match.state_id
            )) && (
            <div className="mt-2 text-3xl font-black text-yellow-400">
              {match.home.score}
            </div>
          )}
        </div>

        <div className="rounded-full bg-yellow-500 px-3 py-2 text-xs font-black text-black">
          VS
        </div>

        <div className="text-center">
          {match.away.image_path ? (
            <Image
              src={match.away.image_path}
              alt={match.away.name}
              width={72}
              height={72}
              className="mx-auto h-16 w-16 object-contain"
            />
          ) : (
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
              ⚽
            </div>
          )}

          <h3 className="mt-3 font-black text-white">
            {match.away.name}
          </h3>

          {(live ||
            isFinished(
              match.state_id
            )) && (
            <div className="mt-2 text-3xl font-black text-yellow-400">
              {match.away.score}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default async function MatchesPage() {
  const cafeName =
    await getCafeName();

  let data: MatchesResponse = {
    ok: false,
    competitions: [],
    today: [],
    next_match: null,
  };

  try {
    const requestHeaders = await headers();
    const host =
      requestHeaders.get("x-forwarded-host") ||
      requestHeaders.get("host");
    const protocol =
      requestHeaders.get("x-forwarded-proto") ||
      "http";

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (host ? `${protocol}://${host}` : "http://localhost:3000");

    const response =
      await fetch(
        `${baseUrl}/api/football/matches`,
        {
          cache: "no-store",
        }
      );

    if (response.ok) {
      data =
        (await response.json()) as MatchesResponse;
    }
  } catch (error) {
    console.error(
      "Failed to load matches page:",
      error
    );
  }

  const competitions =
    (data.competitions ?? [])
      .map((competition) => {
        const visibleToday =
          (competition.today ?? []).filter(
            ({ match }) =>
              isMatchVisible(match)
          );

        const visibleLive =
          (competition.live ?? []).filter(
            (match) =>
              isMatchVisible(match)
          );

        const visibleUpcoming =
          (competition.upcoming ?? []).filter(
            (match) =>
              isMatchVisible(match)
          );

        const visibleRecent =
          (competition.recent ?? []).filter(
            (match) =>
              isMatchVisible(match)
          );

        return {
          ...competition,
          today: visibleToday,
          live: visibleLive,
          upcoming: visibleUpcoming,
          recent: visibleRecent,
          counts: {
            today: visibleToday.length,
            upcoming: visibleUpcoming.length,
            live: visibleLive.length,
            recent: visibleRecent.length,
          },
        };
      })
      .filter(
        (competition) =>
          competition.available &&
          (
            (competition.today?.length ?? 0) > 0 ||
            competition.live.length > 0 ||
            competition.upcoming.length > 0
          )
      );

  const allTodayMatches =
    (data.today ?? []).filter(
      ({ match }) =>
        isToday(match.starting_at) &&
        isMatchVisible(match)
    );

  const allVisibleUpcoming =
    competitions
      .flatMap(
        (competition) =>
          competition.upcoming
      )
      .filter(isMatchVisible)
      .sort(
        (a, b) =>
          Number(
            a.starting_at_timestamp ?? 0
          ) -
          Number(
            b.starting_at_timestamp ?? 0
          )
      );

  const nextMatch =
    (
      data.next_match &&
      isMatchVisible(data.next_match)
        ? data.next_match
        : allVisibleUpcoming[0] ?? null
    );

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#050505] text-white"
    >
      <section className="relative overflow-hidden border-b border-white/10 bg-[#080808] px-5 py-20 sm:px-8 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.08),transparent_42%)]" />

        <div className="relative mx-auto max-w-5xl text-center">
          <span className="inline-flex rounded-full border border-yellow-500/20 bg-yellow-500/5 px-4 py-2 text-xs font-bold text-yellow-400 sm:text-sm">
            ⚽ المباريات
          </span>

          <h1 className="mt-5 text-4xl font-black sm:text-5xl md:text-6xl">
            مباريات {cafeName}
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-zinc-400 sm:text-lg">
            تابع مباريات اليوم وأقرب
            المباريات القادمة من البطولات
            التي اختارتها إدارة الموقع.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center">
            <div className="text-sm font-bold text-zinc-500">
              البطولات الظاهرة
            </div>

            <div className="mt-2 text-4xl font-black text-yellow-400">
              {competitions.length}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center">
            <div className="text-sm font-bold text-zinc-500">
              مباريات اليوم
            </div>

            <div className="mt-2 text-4xl font-black text-white">
              {allTodayMatches.length}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center">
            <div className="text-sm font-bold text-zinc-500">
              أقرب مباراة
            </div>

            <div className="mt-2 text-lg font-black text-green-400">
              {nextMatch
                ? formatDate(
                    nextMatch.starting_at
                  )
                : "لا توجد حاليًا"}
            </div>
          </div>
        </div>
      </section>

      {nextMatch && (
        <section className="mx-auto max-w-6xl px-5 pb-12 sm:px-8">
          <div className="mb-5">
            <h2 className="text-2xl font-black">
              ⭐ أقرب مباراة قادمة
            </h2>
          </div>

          <MatchCard
            match={nextMatch}
            live={false}
            highlight
          />
        </section>
      )}

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="mb-7 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black">
              مباريات اليوم
            </h2>

            <p className="mt-2 text-zinc-500">
              جميع مباريات البطولات
              المفعلة من لوحة الإدارة.
            </p>
          </div>

          <span className="rounded-full bg-yellow-500 px-4 py-2 text-sm font-black text-black">
            {allTodayMatches.length} مباراة
          </span>
        </div>

        {allTodayMatches.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center text-zinc-400">
            لا توجد مباريات اليوم
            للبطولات المفعلة حاليًا.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {allTodayMatches.map(
              ({
                match,
                live,
              }) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  live={live}
                />
              )
            )}
          </div>
        )}
      </section>

      <section className="border-y border-white/10 bg-[#080808] px-5 py-14 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black">
              البطولات
            </h2>

            <p className="mt-3 text-zinc-500">
              اختر البطولة التي تريد
              متابعة مبارياتها.
            </p>
          </div>

          {competitions.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center text-zinc-400">
              لا توجد بطولات مفعلة
              حاليًا.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {competitions.map(
                (competition) => (
                  <article
                    key={competition.id}
                    className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
                  >
                    <div className="flex items-center gap-4">
                      {competition.image_path ? (
                        <Image
                          src={
                            competition.image_path
                          }
                          alt={
                            competition.name_ar ||
                            competition.name
                          }
                          width={56}
                          height={56}
                          className="h-14 w-14 object-contain"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500 text-2xl">
                          🏆
                        </div>
                      )}

                      <div>
                        <h3 className="font-black text-white">
                          {competition.name_ar ||
                            competition.name}
                        </h3>

                        {competition.country && (
                          <p className="mt-1 text-xs text-zinc-500">
                            {competition.country}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-xl bg-black/30 p-3">
                        <div className="text-zinc-500">
                          اليوم
                        </div>

                        <div className="mt-1 font-black text-white">
                          {
                            competition
                              .counts
                              ?.today ?? 0
                          }
                        </div>
                      </div>

                      <div className="rounded-xl bg-black/30 p-3">
                        <div className="text-zinc-500">
                          قادمة
                        </div>

                        <div className="mt-1 font-black text-white">
                          {
                            competition
                              .counts
                              ?.upcoming ?? 0
                          }
                        </div>
                      </div>

                      <div className="rounded-xl bg-black/30 p-3">
                        <div className="text-zinc-500">
                          مباشر
                        </div>

                        <div className="mt-1 font-black text-red-400">
                          {
                            competition
                              .counts
                              ?.live ?? 0
                          }
                        </div>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center">
            <div className="text-3xl">
              📺
            </div>

            <h3 className="mt-4 text-xl font-black">
              شاشات كبيرة
            </h3>

            <p className="mt-3 leading-7 text-zinc-400">
              استمتع بالمباراة من أي
              جلسة بأجواء واضحة
              ومريحة.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center">
            <div className="text-3xl">
              🛋️
            </div>

            <h3 className="mt-4 text-xl font-black">
              جلسات مريحة
            </h3>

            <p className="mt-3 leading-7 text-zinc-400">
              جلسات مناسبة لمتابعة
              المباريات مع الأصدقاء.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center">
            <div className="text-3xl">
              ☕
            </div>

            <h3 className="mt-4 text-xl font-black">
              أجواء همسة مزاج
            </h3>

            <p className="mt-3 leading-7 text-zinc-400">
              استمتع بالمباريات داخل
              أجواء المقهى.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-16 text-center sm:px-8">
        <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/5 p-8">
          <h2 className="text-2xl font-black text-yellow-400">
            استمتع بالمباراة معنا
          </h2>

          <p className="mx-auto mt-3 max-w-2xl leading-7 text-zinc-400">
            تابع أقوى المباريات في
            همسة مزاج على الشاشات
            الكبيرة.
          </p>

          <div className="mt-6">
            <Link
              href="/contact"
              className="inline-flex rounded-2xl bg-yellow-500 px-7 py-3.5 font-black text-black transition hover:-translate-y-1 hover:bg-yellow-400"
            >
              احجز جلستك الآن
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}