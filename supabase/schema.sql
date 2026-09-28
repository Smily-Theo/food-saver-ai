-- FoodSaver AI Supabase schema
create extension if not exists "uuid-ossp";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Theo',
  created_at timestamptz not null default now()
);

create table if not exists food_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  quantity text not null,
  purchase_date date,
  expiry_date date not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists food_actions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  food_item_id uuid references food_items(id) on delete set null,
  action text not null,
  quantity_saved numeric default 0,
  money_saved numeric default 0,
  co2_saved numeric default 0,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table food_items enable row level security;
alter table food_actions enable row level security;

create policy "Users manage own profile" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users manage own food" on food_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own actions" on food_actions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
