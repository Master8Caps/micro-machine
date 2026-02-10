-- ============================================
-- Micro Machine — Initial Database Schema
-- ============================================
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Or via Supabase CLI: supabase db push
--
-- Prerequisites:
--   1. Create a Supabase project at https://supabase.com
--   2. Copy the project URL and keys into your .env.local files
--   3. Run this migration
-- ============================================


-- ============================================
-- 1. Extensions
-- ============================================

-- pgvector will be enabled later when embedding columns are added.
-- create extension if not exists "vector" with schema "extensions";

create extension if not exists "moddatetime" with schema "extensions";


-- ============================================
-- 2. Profiles (extends Supabase Auth)
-- ============================================

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute procedure extensions.moddatetime(updated_at);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================
-- 3. Products (briefs)
-- ============================================

create table public.products (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  description text not null default '',
  market      text not null default '',
  goals       text not null default '',
  channels    text[] not null default '{}',
  status      text not null default 'draft'
                check (status in ('draft', 'active', 'archived')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_products_user_id on public.products(user_id);

create trigger handle_products_updated_at
  before update on public.products
  for each row execute procedure extensions.moddatetime(updated_at);

alter table public.products enable row level security;

create policy "Users can view own products"
  on public.products for select using (auth.uid() = user_id);

create policy "Users can create own products"
  on public.products for insert with check (auth.uid() = user_id);

create policy "Users can update own products"
  on public.products for update using (auth.uid() = user_id);

create policy "Users can delete own products"
  on public.products for delete using (auth.uid() = user_id);


-- ============================================
-- 4. Generations (Marketing Brain runs)
-- ============================================
-- Each row is one "brain generation" run.
-- Stores the full raw JSON output for debugging and iteration.

create table public.generations (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references public.products(id) on delete cascade,
  raw_output      jsonb not null default '{}',
  model           text not null default '',
  prompt_version  text not null default '1.0',
  status          text not null default 'pending'
                    check (status in ('pending', 'processing', 'completed', 'failed')),
  error_message   text,
  created_at      timestamptz not null default now()
);

create index idx_generations_product_id on public.generations(product_id);

alter table public.generations enable row level security;

create policy "Users can view own generations"
  on public.generations for select
  using (
    exists (
      select 1 from public.products
      where products.id = generations.product_id
        and products.user_id = auth.uid()
    )
  );

create policy "Users can create own generations"
  on public.generations for insert
  with check (
    exists (
      select 1 from public.products
      where products.id = generations.product_id
        and products.user_id = auth.uid()
    )
  );


-- ============================================
-- 5. Avatars (target personas)
-- ============================================

create table public.avatars (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references public.products(id) on delete cascade,
  generation_id   uuid references public.generations(id) on delete set null,
  name            text not null,
  description     text not null default '',
  pain_points     text[] not null default '{}',
  channels        text[] not null default '{}',
  icp_details     jsonb not null default '{}',
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_avatars_product_id on public.avatars(product_id);

create trigger handle_avatars_updated_at
  before update on public.avatars
  for each row execute procedure extensions.moddatetime(updated_at);

alter table public.avatars enable row level security;

create policy "Users can view own avatars"
  on public.avatars for select
  using (
    exists (
      select 1 from public.products
      where products.id = avatars.product_id
        and products.user_id = auth.uid()
    )
  );

create policy "Users can create own avatars"
  on public.avatars for insert
  with check (
    exists (
      select 1 from public.products
      where products.id = avatars.product_id
        and products.user_id = auth.uid()
    )
  );

create policy "Users can update own avatars"
  on public.avatars for update
  using (
    exists (
      select 1 from public.products
      where products.id = avatars.product_id
        and products.user_id = auth.uid()
    )
  );

create policy "Users can delete own avatars"
  on public.avatars for delete
  using (
    exists (
      select 1 from public.products
      where products.id = avatars.product_id
        and products.user_id = auth.uid()
    )
  );


-- ============================================
-- 6. Campaigns (angles per avatar)
-- ============================================

create table public.campaigns (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references public.products(id) on delete cascade,
  avatar_id       uuid not null references public.avatars(id) on delete cascade,
  generation_id   uuid references public.generations(id) on delete set null,
  angle           text not null,
  channel         text not null default '',
  hook            text not null default '',
  content_type    text not null default 'text-post'
                    check (content_type in (
                      'text-post', 'thread', 'video-hook', 'video-script',
                      'image-prompt', 'landing-page', 'email', 'ad-copy'
                    )),
  status          text not null default 'draft'
                    check (status in ('draft', 'active', 'paused', 'completed')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_campaigns_product_id on public.campaigns(product_id);
create index idx_campaigns_avatar_id on public.campaigns(avatar_id);

create trigger handle_campaigns_updated_at
  before update on public.campaigns
  for each row execute procedure extensions.moddatetime(updated_at);

alter table public.campaigns enable row level security;

create policy "Users can view own campaigns"
  on public.campaigns for select
  using (
    exists (
      select 1 from public.products
      where products.id = campaigns.product_id
        and products.user_id = auth.uid()
    )
  );

create policy "Users can create own campaigns"
  on public.campaigns for insert
  with check (
    exists (
      select 1 from public.products
      where products.id = campaigns.product_id
        and products.user_id = auth.uid()
    )
  );

create policy "Users can update own campaigns"
  on public.campaigns for update
  using (
    exists (
      select 1 from public.products
      where products.id = campaigns.product_id
        and products.user_id = auth.uid()
    )
  );

create policy "Users can delete own campaigns"
  on public.campaigns for delete
  using (
    exists (
      select 1 from public.products
      where products.id = campaigns.product_id
        and products.user_id = auth.uid()
    )
  );


-- ============================================
-- 7. Content Pieces (generated content)
-- ============================================

create table public.content_pieces (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references public.products(id) on delete cascade,
  campaign_id     uuid references public.campaigns(id) on delete set null,
  avatar_id       uuid references public.avatars(id) on delete set null,
  type            text not null default 'text-post'
                    check (type in (
                      'linkedin-post', 'twitter-post', 'twitter-thread',
                      'video-hook', 'video-script', 'image-prompt',
                      'landing-page-copy', 'email', 'ad-copy'
                    )),
  title           text,
  body            text not null default '',
  metadata        jsonb not null default '{}',
  status          text not null default 'draft'
                    check (status in ('draft', 'ready', 'published', 'archived')),
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_content_pieces_product_id on public.content_pieces(product_id);
create index idx_content_pieces_campaign_id on public.content_pieces(campaign_id);
create index idx_content_pieces_status on public.content_pieces(status);

create trigger handle_content_pieces_updated_at
  before update on public.content_pieces
  for each row execute procedure extensions.moddatetime(updated_at);

alter table public.content_pieces enable row level security;

create policy "Users can view own content"
  on public.content_pieces for select
  using (
    exists (
      select 1 from public.products
      where products.id = content_pieces.product_id
        and products.user_id = auth.uid()
    )
  );

create policy "Users can create own content"
  on public.content_pieces for insert
  with check (
    exists (
      select 1 from public.products
      where products.id = content_pieces.product_id
        and products.user_id = auth.uid()
    )
  );

create policy "Users can update own content"
  on public.content_pieces for update
  using (
    exists (
      select 1 from public.products
      where products.id = content_pieces.product_id
        and products.user_id = auth.uid()
    )
  );

create policy "Users can delete own content"
  on public.content_pieces for delete
  using (
    exists (
      select 1 from public.products
      where products.id = content_pieces.product_id
        and products.user_id = auth.uid()
    )
  );


-- ============================================
-- 8. Links (tracked redirect URLs)
-- ============================================

create table public.links (
  id                uuid primary key default gen_random_uuid(),
  product_id        uuid not null references public.products(id) on delete cascade,
  content_piece_id  uuid references public.content_pieces(id) on delete set null,
  campaign_id       uuid references public.campaigns(id) on delete set null,
  slug              text not null unique,
  destination_url   text not null,
  utm_source        text not null default '',
  utm_medium        text not null default '',
  utm_campaign      text not null default '',
  utm_content       text not null default '',
  utm_term          text not null default '',
  click_count       integer not null default 0,
  created_at        timestamptz not null default now()
);

create unique index idx_links_slug on public.links(slug);
create index idx_links_product_id on public.links(product_id);
create index idx_links_campaign_id on public.links(campaign_id);

alter table public.links enable row level security;

create policy "Users can view own links"
  on public.links for select
  using (
    exists (
      select 1 from public.products
      where products.id = links.product_id
        and products.user_id = auth.uid()
    )
  );

create policy "Users can create own links"
  on public.links for insert
  with check (
    exists (
      select 1 from public.products
      where products.id = links.product_id
        and products.user_id = auth.uid()
    )
  );


-- ============================================
-- 9. Clicks (event log)
-- ============================================
-- Append-only table. Inserts come from the server-side redirect
-- endpoint using the service role key (bypasses RLS).

create table public.clicks (
  id          uuid primary key default gen_random_uuid(),
  link_id     uuid not null references public.links(id) on delete cascade,
  clicked_at  timestamptz not null default now(),
  user_agent  text,
  referer     text,
  ip_hash     text,
  country     text,
  device_type text
);

create index idx_clicks_link_id on public.clicks(link_id);
create index idx_clicks_clicked_at on public.clicks(clicked_at);

alter table public.clicks enable row level security;

-- Users can view clicks on their own links (for analytics)
create policy "Users can view own clicks"
  on public.clicks for select
  using (
    exists (
      select 1 from public.links
      join public.products on products.id = links.product_id
      where links.id = clicks.link_id
        and products.user_id = auth.uid()
    )
  );

-- No client-side insert policy. Clicks are inserted server-side
-- using the service role key which bypasses RLS.

-- Auto-increment click_count on the parent link
create or replace function public.increment_click_count()
returns trigger as $$
begin
  update public.links
  set click_count = click_count + 1
  where id = new.link_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_click_inserted
  after insert on public.clicks
  for each row execute procedure public.increment_click_count();


-- ============================================
-- 10. Customers (Stripe mapping)
-- ============================================

create table public.customers (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null unique references public.profiles(id) on delete cascade,
  stripe_customer_id  text not null unique,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create unique index idx_customers_user_id on public.customers(user_id);
create unique index idx_customers_stripe_id on public.customers(stripe_customer_id);

create trigger handle_customers_updated_at
  before update on public.customers
  for each row execute procedure extensions.moddatetime(updated_at);

alter table public.customers enable row level security;

create policy "Users can view own customer record"
  on public.customers for select using (auth.uid() = user_id);


-- ============================================
-- 11. Subscriptions (Stripe billing state)
-- ============================================
-- Updated via Stripe webhooks using the service role key.

create table public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  customer_id             uuid not null references public.customers(id) on delete cascade,
  stripe_subscription_id  text not null unique,
  stripe_price_id         text not null,
  status                  text not null default 'inactive'
                            check (status in (
                              'active', 'canceled', 'incomplete', 'incomplete_expired',
                              'past_due', 'trialing', 'unpaid', 'paused', 'inactive'
                            )),
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  cancel_at_period_end    boolean not null default false,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create unique index idx_subscriptions_stripe_id on public.subscriptions(stripe_subscription_id);
create index idx_subscriptions_customer_id on public.subscriptions(customer_id);

create trigger handle_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure extensions.moddatetime(updated_at);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscription"
  on public.subscriptions for select
  using (
    exists (
      select 1 from public.customers
      where customers.id = subscriptions.customer_id
        and customers.user_id = auth.uid()
    )
  );


-- ============================================
-- Done.
-- ============================================
-- Next steps:
--   1. Set up Supabase Auth (email + password)
--   2. Add environment variables to your .env.local
--   3. Connect the app to Supabase using the client libraries
--
-- Future additions:
--   - pgvector embedding columns on avatars and content_pieces
--   - Performance scoring views / materialized views
--   - Partitioning on clicks table if volume grows
-- ============================================
