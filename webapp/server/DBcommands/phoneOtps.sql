create extension if not exists pgcrypto;

create table if not exists public.phone_otps (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  otp_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  request_ip_hash text,
  provider_message_id text,
  provider_status text,
  provider_error text,
  accepted_at timestamptz,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.phone_otps
  add column if not exists request_ip_hash text,
  add column if not exists provider_message_id text,
  add column if not exists provider_status text,
  add column if not exists provider_error text,
  add column if not exists accepted_at timestamptz,
  add column if not exists verified_at timestamptz;

create index if not exists phone_otps_phone_idx on public.phone_otps(phone);
create index if not exists phone_otps_expires_idx on public.phone_otps(expires_at);
create index if not exists idx_phone_otps_request_ip_created_at
  on public.phone_otps (request_ip_hash, created_at desc);
