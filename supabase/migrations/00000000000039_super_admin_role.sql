-- Migration 39: add the super_admin role value.
--
-- Postgres requires a newly added enum value to be committed before it can
-- be referenced elsewhere (default values, check constraints, comparisons
-- in the same transaction), so this is its own migration — everything that
-- actually uses 'super_admin' lives in migration 40.

alter type public.user_role add value 'super_admin';
