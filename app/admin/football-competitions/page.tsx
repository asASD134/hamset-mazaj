"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  LoaderCircle,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trophy,
  X,
} from "lucide-react";

type Competition = {
  id: number;
  name: string;
  name_ar: string | null;
  country: string | null;
  competition_type: string | null;
  logo_url: string | null;
  is_active: boolean;
  sort_order: number;
  match_limit: number;
};

type ApiResponse = {
  ok: boolean;
  competitions?: Competition[];
  error?: string;
};

export default function FootballCompetitionsPage() {
  const [competitions, setCompetitions] =
    useState<Competition[]>([]);

  const [providerCompetitions, setProviderCompetitions] =
    useState<Competition[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [providerLoading, setProviderLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [addingId, setAddingId] =
    useState<number | null>(null);

  const [search, setSearch] =
    useState("");

  const [providerSearch, setProviderSearch] =
    useState("");

  const [filter, setFilter] =
    useState<
      "all" | "active" | "hidden"
    >("all");

  const [showAddPanel, setShowAddPanel] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  async function readApiResponse(
    response: Response
  ): Promise<ApiResponse> {
    const responseText = await response.text();

    if (!responseText.trim()) {
      throw new Error(
        `استجابة خالية من الخادم (HTTP ${response.status}).`
      );
    }

    try {
      return JSON.parse(responseText) as ApiResponse;
    } catch {
      throw new Error(
        `استجابة غير صالحة من الخادم (HTTP ${response.status}).`
      );
    }
  }

  async function loadCompetitions() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/football-competitions",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data =
        await readApiResponse(response);

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error ||
            "تعذر تحميل المسابقات."
        );
      }

      setCompetitions(
        data.competitions ?? []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "تعذر تحميل المسابقات."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCompetitions();
  }, []);

  async function loadProviderCompetitions() {
    setProviderLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/football-competitions",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action: "discover",
          }),
        }
      );

      const data =
        await readApiResponse(response);

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error ||
            "تعذر تحميل بطولات مزود البيانات."
        );
      }

      setProviderCompetitions(
        data.competitions ?? []
      );

      setShowAddPanel(true);

      setMessage(
        `تم العثور على ${
          data.competitions?.length ?? 0
        } بطولة من مزود البيانات.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "تعذر تحميل البطولات."
      );
    } finally {
      setProviderLoading(false);
    }
  }

  async function addCompetition(
    id: number
  ) {
    setAddingId(id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/football-competitions",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action: "add",
            league_id: id,
          }),
        }
      );

      const data =
        await readApiResponse(response);

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error ||
            "تعذر إضافة البطولة."
        );
      }

      const added =
        data.competitions?.[0];

      if (added) {
        setCompetitions((current) => {
          const exists = current.some(
            (item) =>
              item.id === added.id
          );

          if (exists) {
            return current;
          }

          return [
            ...current,
            added,
          ].sort(
            (a, b) =>
              a.sort_order -
                b.sort_order ||
              a.name.localeCompare(
                b.name
              )
          );
        });
      }

      setMessage(
        "تمت إضافة البطولة بنجاح."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "تعذر إضافة البطولة."
      );
    } finally {
      setAddingId(null);
    }
  }

  function updateCompetition(
    id: number,
    changes: Partial<Competition>
  ) {
    setCompetitions((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              ...changes,
            }
          : item
      )
    );
  }

  function moveCompetition(
    id: number,
    direction: "up" | "down"
  ) {
    setCompetitions((current) => {
      const index =
        current.findIndex(
          (item) => item.id === id
        );

      if (index < 0) {
        return current;
      }

      const target =
        direction === "up"
          ? index - 1
          : index + 1;

      if (
        target < 0 ||
        target >= current.length
      ) {
        return current;
      }

      const next = [...current];

      [
        next[index],
        next[target],
      ] = [
        next[target],
        next[index],
      ];

      return next.map(
        (item, position) => ({
          ...item,
          sort_order:
            (position + 1) * 10,
        })
      );
    });
  }

  async function saveChanges() {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const items =
        competitions.map(
          (item, index) => ({
            id: item.id,
            is_active:
              item.is_active,
            sort_order:
              (index + 1) * 10,
            match_limit:
              item.match_limit,
            name_ar:
              item.name_ar,
          })
        );

      const response = await fetch(
        "/api/admin/football-competitions",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            items,
          }),
        }
      );

      const data =
        await readApiResponse(response);

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error ||
            "تعذر حفظ التغييرات."
        );
      }

      setCompetitions(
        data.competitions ?? []
      );

      setMessage(
        "تم حفظ التغييرات بنجاح."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "تعذر حفظ التغييرات."
      );
    } finally {
      setSaving(false);
    }
  }

  const activeCount =
    competitions.filter(
      (item) => item.is_active
    ).length;

  const filteredCompetitions =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      return competitions.filter(
        (item) => {
          const matchesSearch =
            !value ||
            item.name
              .toLowerCase()
              .includes(value) ||
            (
              item.name_ar ?? ""
            )
              .toLowerCase()
              .includes(value) ||
            (
              item.country ?? ""
            )
              .toLowerCase()
              .includes(value);

          const matchesFilter =
            filter === "all" ||
            (filter === "active" &&
              item.is_active) ||
            (filter === "hidden" &&
              !item.is_active);

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      competitions,
      search,
      filter,
    ]);

  const filteredProvider =
    useMemo(() => {
      const value =
        providerSearch
          .trim()
          .toLowerCase();

      const existingIds =
        new Set(
          competitions.map(
            (item) => item.id
          )
        );

      return providerCompetitions
        .filter(
          (item) =>
            !existingIds.has(
              item.id
            )
        )
        .filter((item) => {
          if (!value) {
            return true;
          }

          return (
            item.name
              .toLowerCase()
              .includes(value) ||
            (
              item.name_ar ?? ""
            )
              .toLowerCase()
              .includes(value) ||
            (
              item.country ?? ""
            )
              .toLowerCase()
              .includes(value)
          );
        });
    }, [
      providerCompetitions,
      providerSearch,
      competitions,
    ]);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-950 text-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500/15 text-yellow-400">
                <Trophy size={25} />
              </div>

              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  إدارة المسابقات
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  أضف أي دوري أو كأس يدعمه مزود البيانات.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={
                loadProviderCompetitions
              }
              disabled={
                providerLoading
              }
              className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 text-sm font-bold text-black hover:bg-yellow-400 disabled:opacity-50"
            >
              {providerLoading ? (
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Plus size={18} />
              )}

              إضافة بطولة
            </button>

            <button
              type="button"
              onClick={
                loadProviderCompetitions
              }
              disabled={
                providerLoading
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
            >
              {providerLoading ? (
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <RefreshCw
                  size={18}
                />
              )}

              تحديث البطولات
            </button>

            <button
              type="button"
              onClick={
                saveChanges
              }
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-5 py-3 text-sm font-bold text-black hover:bg-green-400 disabled:opacity-50"
            >
              {saving ? (
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Save size={18} />
              )}

              حفظ التغييرات
            </button>
          </div>
        </div>

        {message && (
          <div className="mb-5 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {showAddPanel && (
          <section className="mb-6 rounded-2xl border border-yellow-500/30 bg-slate-900 p-5">

            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">
                  إضافة بطولة من BSD
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  ابحث عن أي دوري أو كأس ثم اضغط إضافة.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAddPanel(
                    false
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative mb-4">
              <Search
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={
                  providerSearch
                }
                onChange={(e) =>
                  setProviderSearch(
                    e.target.value
                  )
                }
                placeholder="ابحث عن الدوري أو الكأس..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pe-11 ps-4 text-sm outline-none focus:border-yellow-500"
              />
            </div>

            {providerLoading ? (
              <div className="flex min-h-32 items-center justify-center">
                <LoaderCircle
                  size={24}
                  className="animate-spin text-yellow-400"
                />
              </div>
            ) : (
              <div className="max-h-[420px] space-y-2 overflow-y-auto">

                {filteredProvider.length ===
                0 ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 text-center text-sm text-slate-500">
                    لا توجد نتائج.
                  </div>
                ) : (
                  filteredProvider.map(
                    (item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 p-1">
                          {item.logo_url ? (
                            <img
                              src={
                                item.logo_url
                              }
                              alt={
                                item.name
                              }
                              className="max-h-10 max-w-10 object-contain"
                            />
                          ) : (
                            <Trophy
                              size={20}
                              className="text-slate-500"
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="truncate font-semibold">
                            {item.name}
                          </div>

                          <div className="mt-1 text-xs text-slate-500">
                            {item.country ||
                              "دولي"}{" "}
                            · ID{" "}
                            {item.id}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            addCompetition(
                              item.id
                            )
                          }
                          disabled={
                            addingId ===
                            item.id
                          }
                          className="shrink-0 rounded-xl bg-yellow-500 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-400 disabled:opacity-50"
                        >
                          {addingId ===
                          item.id ? (
                            <LoaderCircle
                              size={18}
                              className="animate-spin"
                            />
                          ) : (
                            "إضافة"
                          )}
                        </button>
                      </div>
                    )
                  )
                )}

              </div>
            )}
          </section>
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="text-sm text-slate-400">
              البطولات المضافة
            </div>

            <div className="mt-2 text-3xl font-bold">
              {competitions.length}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="text-sm text-slate-400">
              الظاهرة للزوار
            </div>

            <div className="mt-2 text-3xl font-bold text-green-400">
              {activeCount}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="text-sm text-slate-400">
              المخفية
            </div>

            <div className="mt-2 text-3xl font-bold text-slate-500">
              {competitions.length -
                activeCount}
            </div>
          </div>

        </div>

        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="ابحث في البطولات المضافة..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pe-11 ps-4 text-sm outline-none focus:border-yellow-500"
              />
            </div>

            <div className="flex gap-2">

              <button
                type="button"
                onClick={() =>
                  setFilter("all")
                }
                className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                  filter === "all"
                    ? "bg-yellow-500 text-black"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                الكل
              </button>

              <button
                type="button"
                onClick={() =>
                  setFilter("active")
                }
                className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                  filter === "active"
                    ? "bg-green-500 text-black"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                الظاهرة
              </button>

              <button
                type="button"
                onClick={() =>
                  setFilter("hidden")
                }
                className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                  filter === "hidden"
                    ? "bg-slate-600 text-white"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                المخفية
              </button>

            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

          {loading ? (
            <div className="flex min-h-60 items-center justify-center">
              <LoaderCircle
                size={24}
                className="animate-spin text-yellow-400"
              />
            </div>
          ) : filteredCompetitions.length ===
            0 ? (
            <div className="flex min-h-60 items-center justify-center text-slate-500">
              لا توجد بطولات مضافة.
            </div>
          ) : (
            <div className="divide-y divide-slate-800">

              {filteredCompetitions.map(
                (item, index) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center"
                  >

                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 p-2">
                      {item.logo_url ? (
                        <img
                          src={
                            item.logo_url
                          }
                          alt={item.name}
                          className="max-h-12 max-w-12 object-contain"
                        />
                      ) : (
                        <Trophy
                          size={24}
                          className="text-slate-600"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold">
                          {item.name}
                        </h3>

                        {item.is_active ? (
                          <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-400">
                            ظاهر
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-500">
                            مخفي
                          </span>
                        )}
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">

                        <label>
                          <span className="mb-1 block text-xs text-slate-500">
                            الاسم العربي
                          </span>

                          <input
                            value={
                              item.name_ar ??
                              ""
                            }
                            onChange={(e) =>
                              updateCompetition(
                                item.id,
                                {
                                  name_ar:
                                    e.target
                                      .value,
                                }
                              )
                            }
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-yellow-500"
                          />
                        </label>

                        <label>
                          <span className="mb-1 block text-xs text-slate-500">
                            عدد المباريات
                          </span>

                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={
                              item.match_limit
                            }
                            onChange={(e) =>
                              updateCompetition(
                                item.id,
                                {
                                  match_limit:
                                    Math.min(
                                      20,
                                      Math.max(
                                        1,
                                        Number(
                                          e
                                            .target
                                            .value ||
                                            1
                                        )
                                      )
                                    ),
                                }
                              )
                            }
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-yellow-500"
                          />
                        </label>

                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          updateCompetition(
                            item.id,
                            {
                              is_active:
                                !item.is_active,
                            }
                          )
                        }
                        className={`rounded-xl p-3 ${
                          item.is_active
                            ? "bg-green-500/10 text-green-400"
                            : "bg-slate-800 text-slate-400"
                        }`}
                        title={
                          item.is_active
                            ? "إخفاء"
                            : "إظهار"
                        }
                      >
                        {item.is_active ? (
                          <Eye size={19} />
                        ) : (
                          <EyeOff
                            size={19}
                          />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          moveCompetition(
                            item.id,
                            "up"
                          )
                        }
                        disabled={
                          index === 0
                        }
                        className="rounded-xl bg-slate-800 p-3 text-slate-300 disabled:opacity-30"
                      >
                        <ArrowUp
                          size={18}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          moveCompetition(
                            item.id,
                            "down"
                          )
                        }
                        disabled={
                          index ===
                          filteredCompetitions.length -
                            1
                        }
                        className="rounded-xl bg-slate-800 p-3 text-slate-300 disabled:opacity-30"
                      >
                        <ArrowDown
                          size={18}
                        />
                      </button>

                    </div>
                  </div>
                )
              )}

            </div>
          )}

        </div>
      </div>
    </main>
  );
}