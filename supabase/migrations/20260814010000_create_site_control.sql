-- =========================================================
-- Hamset Mazaj - Site Control
-- =========================================================

-- ---------------------------------------------------------
-- 1) جدول المديرين
-- ---------------------------------------------------------

create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;


-- أول حساب Auth يصبح مديرًا
insert into public.admin_users (id)
select id
from auth.users
order by created_at
limit 1
on conflict (id) do nothing;


-- ---------------------------------------------------------
-- 2) دالة التحقق من المدير
-- ---------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where id = auth.uid()
  );
$$;

revoke all
on function public.is_admin()
from public;

grant execute
on function public.is_admin()
to anon, authenticated;


-- ---------------------------------------------------------
-- 3) جدول التحكم بالموقع
-- ---------------------------------------------------------

create table if not exists public.site_control (
  id uuid primary key default gen_random_uuid(),

  site_name text not null default 'همسة مزاج',
  tagline text null,
  description text null,
  logo_url text null,
  favicon_url text null,

  primary_color text not null default '#eab308',
  background_color text not null default '#050505',
  surface_color text not null default '#0b0b0b',

  hero_enabled boolean not null default true,
  hero_title text null,
  hero_subtitle text null,
  hero_description text null,
  hero_background_url text null,
  hero_badge text null,

  hero_primary_enabled boolean not null default true,
  hero_primary_text text null,
  hero_primary_url text null,

  hero_secondary_enabled boolean not null default true,
  hero_secondary_text text null,
  hero_secondary_url text null,

  featured_enabled boolean not null default true,
  featured_title text null,
  featured_description text null,
  featured_limit integer not null default 4,

  why_enabled boolean not null default true,
  why_title text null,
  why_description text null,

  matches_enabled boolean not null default true,
  matches_title text null,
  matches_description text null,

  gallery_enabled boolean not null default true,
  gallery_title text null,
  gallery_description text null,

  testimonials_enabled boolean not null default true,
  testimonials_title text null,
  testimonials_description text null,

  contact_enabled boolean not null default true,
  contact_title text null,
  contact_description text null,

  footer_enabled boolean not null default true,
  footer_description text null,

  show_phone boolean not null default true,
  show_address boolean not null default true,
  show_opening_hours boolean not null default true,
  show_social_links boolean not null default true,
  show_map boolean not null default true,

  section_order jsonb not null default
    '[
      "hero",
      "featured",
      "why",
      "matches",
      "gallery",
      "testimonials",
      "contact"
    ]'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ---------------------------------------------------------
-- 4) منع وجود أكثر من صف
-- ---------------------------------------------------------

create unique index if not exists
site_control_single_row_idx
on public.site_control ((true));


-- ---------------------------------------------------------
-- 5) تحديث updated_at
-- ---------------------------------------------------------

create or replace function public.update_site_control_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


drop trigger if exists
site_control_updated_at_trigger
on public.site_control;


create trigger
site_control_updated_at_trigger
before update on public.site_control
for each row
execute function public.update_site_control_updated_at();


-- ---------------------------------------------------------
-- 6) الإعداد الافتراضي
-- ---------------------------------------------------------

insert into public.site_control (
  site_name,
  tagline,
  description,
  hero_title,
  hero_subtitle,
  hero_description,
  hero_badge,
  hero_primary_text,
  hero_primary_url,
  hero_secondary_text,
  hero_secondary_url,
  featured_title,
  featured_description,
  why_title,
  why_description,
  matches_title,
  matches_description,
  gallery_title,
  gallery_description,
  testimonials_title,
  testimonials_description,
  contact_title,
  contact_description,
  footer_description
)
select
  'همسة مزاج',
  'أجواء راقية... ومزاج على كيفك',
  'تجربة راقية تجمع بين القهوة والشيشة والمشروبات والجلسات المميزة.',
  'همسة مزاج',
  'أجواء راقية... ومزاج على كيفك',
  'تجربة راقية تجمع بين القهوة والمشروبات والشيشة والجلسات المميزة.',
  'COFFEE • LOUNGE • MOMENTS',
  'تصفح المنيو',
  '/menu',
  'موقعنا وتواصل معنا',
  '/contact',
  'منتجاتنا المميزة',
  'مجموعة مختارة من المنتجات التي نحب أن نقدمها لكم.',
  'أكثر من مجرد مقهى',
  'نهتم بالتفاصيل التي تجعل جلستك أكثر راحة ومتعة.',
  'مباريات همسة مزاج',
  'استمتع بمشاهدة أهم المباريات على الشاشات الكبيرة.',
  'أجواء همسة مزاج',
  'لمحة من أجواء المقهى والجلسات.',
  'تجارب تتحدث عن نفسها',
  'نفتخر بثقة زوار همسة مزاج.',
  'يسعدنا استقبالكم',
  'جميع معلومات التواصل والموقع والحسابات الرسمية في مكان واحد.',
  'تجربة قهوة ومزاج تستحق التكرار.'
where not exists (
  select 1
  from public.site_control
);


-- ---------------------------------------------------------
-- 7) RLS
-- ---------------------------------------------------------

alter table public.site_control enable row level security;


drop policy if exists site_control_select_public
on public.site_control;

drop policy if exists site_control_update_admin
on public.site_control;

drop policy if exists site_control_insert_admin
on public.site_control;


create policy site_control_select_public
on public.site_control
for select
to anon, authenticated
using (true);


create policy site_control_update_admin
on public.site_control
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());


create policy site_control_insert_admin
on public.site_control
for insert
to authenticated
with check (public.is_admin());


-- ---------------------------------------------------------
-- 8) الصلاحيات
-- ---------------------------------------------------------

revoke all
on public.site_control
from anon;

grant select
on public.site_control
to anon, authenticated;

grant select, insert, update
on public.site_control
to authenticated;