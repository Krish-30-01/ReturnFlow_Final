-- ============================================================
-- ReturnFlow — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- Safe to re-run (idempotent).
--
-- NOTE ON SECURITY: These policies grant full anonymous access
-- because the app has no auth yet. Before production, replace
-- them with auth.uid()-based policies.
-- ============================================================

-- ---------- TABLES ----------

create table if not exists public.trips (
  id text primary key,
  driver_id text not null,
  driver_name text not null,
  driver_rating double precision not null default 4.9,
  driver_avatar_text text not null default '',
  driver_phone text not null default '',
  origin text not null,
  destination text not null,
  origin_lat double precision,
  origin_lng double precision,
  dest_lat double precision,
  dest_lng double precision,
  corridor text not null,
  vehicle text not null,
  vehicle_plate text not null,
  capacity integer not null,
  booked_capacity integer not null default 0,
  departure_date date not null,
  time_window text not null,
  payout double precision not null default 0,
  preferred_load_type text default 'FMCG & General Goods',
  status text not null default 'active',
  notes text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.load_requests (
  id text primary key,
  retailer_id text not null,
  retailer_name text not null,
  retailer_company text not null default '',
  retailer_phone text not null default '',
  origin text not null,
  destination text not null,
  origin_lat double precision,
  origin_lng double precision,
  dest_lat double precision,
  dest_lng double precision,
  corridor text not null,
  cargo_type text not null,
  weight double precision not null,
  weight_unit text not null default 'Kg',
  budget double precision not null default 0,
  time_window text not null default 'Flexible',
  departure_date date not null,
  special_instructions text default '',
  status text not null default 'Searching',
  matched_trip_id text,
  booking_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id text primary key,
  trip_id text not null,
  load_id text not null,
  booking_date date not null,
  driver_id text not null,
  driver_name text not null,
  driver_rating double precision not null default 4.9,
  driver_phone text not null default '',
  driver_avatar text not null default '',
  vehicle_type text not null default '',
  vehicle_plate text not null default '',
  customer_id text not null,
  customer_name text not null,
  customer_company text not null default '',
  customer_phone text not null default '',
  origin text not null,
  destination text not null,
  corridor text not null default '',
  goods_type text not null default '',
  weight_kg double precision not null default 0,
  special_instructions text default '',
  base_price double precision not null default 0,
  platform_fee double precision not null default 0,
  insurance_fee double precision not null default 0,
  total_price double precision not null default 0,
  payment_method text not null default 'UPI',
  escrow_status text not null default 'Held in Escrow',
  status text not null default 'Booked',
  estimated_pickup text default '',
  estimated_delivery text default '',
  telemetry jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.earnings (
  id text primary key,
  date_label text not null,
  route text not null default '',
  corridor text not null default '',
  loads_count integer not null default 1,
  weight_kg double precision not null default 0,
  amount double precision not null default 0,
  escrow_fee_deducted double precision not null default 0,
  status text not null default 'In Escrow',
  payout_reference text not null default '',
  created_at timestamptz not null default now()
);

-- ---------- ROW LEVEL SECURITY (demo-grade, anon full access) ----------

alter table public.trips enable row level security;
alter table public.load_requests enable row level security;
alter table public.bookings enable row level security;
alter table public.earnings enable row level security;

do $$
declare t text;
begin
  foreach t in array array['trips', 'load_requests', 'bookings', 'earnings'] loop
    execute format('drop policy if exists "returnflow_anon_full_access" on public.%I', t);
    execute format(
      'create policy "returnflow_anon_full_access" on public.%I for all to anon, authenticated using (true) with check (true)',
      t
    );
  end loop;
end $$;

-- ---------- REALTIME ----------

do $$
declare t text;
begin
  foreach t in array array['trips', 'load_requests', 'bookings', 'earnings'] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;
