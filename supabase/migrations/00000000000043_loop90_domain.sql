-- Loop/90 now has its own subdomain (loop90.getmedloop.com) instead of the
-- placeholder sehat90.com used in migration 25's seed defaults. Updates the
-- live config values — the migration 25 defaults were never customized by
-- an admin, so they're still sitting at the placeholder domain.
update public.automation_config
set value = 'https://loop90.getmedloop.com/app'
where key = 'app_url' and value = 'https://sehat90.com/app';

update public.automation_config
set value = 'https://loop90.getmedloop.com/guide'
where key = 'guide_url' and value = 'https://sehat90.com/guide';
