-- Run this once in Supabase SQL Editor

create extension if not exists "pgcrypto";

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price numeric not null,
  old_price numeric,
  image_url text not null,
  drive_file_id text,
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  customer_name text not null,
  phone text not null,
  price numeric not null,
  created_at timestamptz default now()
);

-- Public read for products, restricted writes (server uses service role)
alter table products enable row level security;
alter table orders enable row level security;

create policy "public read products" on products for select using (true);
create policy "public insert orders" on orders for insert with check (true);
