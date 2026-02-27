-- ============================================
-- Migration 017: Add 'invited' status to profiles
-- ============================================
-- Adds an 'invited' status so admins can track users who have been
-- invited but haven't completed account setup yet.
-- Once an invited user completes /setup, their status moves to 'active'.
-- ============================================

-- 1. Drop existing check constraint and recreate with 'invited'
alter table public.profiles
  drop constraint if exists profiles_status_check;

alter table public.profiles
  add constraint profiles_status_check
  check (status in ('waitlist', 'invited', 'active'));

-- ============================================
-- Done.
-- ============================================
