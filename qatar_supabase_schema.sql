create extension if not exists pgcrypto;

create table if not exists public.qatar_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete set null,
  job_title text null,
  pending_email text null,
  source text null,
  data jsonb not null default '{}'::jsonb,
  payment_reference text null,
  payment_status text not null default 'unpaid',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.qatar_interview_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete set null,
  company text null,
  position text null,
  interview_type text not null default 'video',
  interview_at timestamptz not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.qatar_payment_attempts (
  id uuid primary key default gen_random_uuid(),
  checkout_request_id text not null,
  phone_number text null,
  amount numeric null,
  status text not null default 'pending',
  purpose text not null default 'unknown',
  user_id uuid null references auth.users(id) on delete set null,
  application_id uuid null references public.qatar_applications(id) on delete set null,
  interview_booking_id uuid null references public.qatar_interview_bookings(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (checkout_request_id)
);

create or replace view public.qatar_transactions_explorer as
select
  pa.id as payment_attempt_id,
  pa.checkout_request_id,
  pa.purpose,
  pa.status as payment_status,
  pa.amount,
  pa.phone_number,
  pa.created_at as payment_created_at,
  pa.updated_at as payment_updated_at,

  a.id as application_id,
  a.job_title as application_job_title,
  a.pending_email as application_email,
  a.user_id as application_user_id,
  a.data as application_data,

  ib.id as interview_booking_id,
  ib.company as interview_company,
  ib.position as interview_position,
  ib.interview_type,
  ib.interview_at,
  ib.status as interview_status
from public.qatar_payment_attempts pa
left join public.qatar_applications a on a.id = pa.application_id
left join public.qatar_interview_bookings ib on ib.id = pa.interview_booking_id;
