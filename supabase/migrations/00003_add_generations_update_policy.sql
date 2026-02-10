-- ============================================
-- Migration 003: Add update policy for generations
-- ============================================
-- The generations table was missing an update policy, which meant
-- the brain generation could not save its output (status + raw_output).
-- Run this in the Supabase SQL Editor after 00002.
-- ============================================

create policy "Users can update own generations"
  on public.generations for update
  using (
    exists (
      select 1 from public.products
      where products.id = generations.product_id
        and products.user_id = auth.uid()
    )
  );
