-- Keep gallery homepage image selection tenant-aware and aligned with services/siteControl.ts.
alter table public.site_control
  add column if not exists gallery_images_home boolean[]
  not null
  default array[false, false, false, false, false, false]::boolean[];

update public.site_control
set gallery_images_home = (
  select coalesce(array_agg(false order by ord), array[]::boolean[])
  from unnest(gallery_images) with ordinality as t(image, ord)
)
where gallery_images_home is null
   or cardinality(gallery_images_home) <> cardinality(gallery_images);
