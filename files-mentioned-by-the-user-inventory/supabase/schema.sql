create extension if not exists pgcrypto;

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create table if not exists public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  item_name text not null,
  category text,
  description text,
  quantity numeric not null default 1 check (quantity >= 0),
  unit text,
  location text,
  supplier_name text,
  supplier_contact text,
  supplier_website text,
  purchase_date date,
  cost numeric check (cost is null or cost >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create index if not exists inventory_items_household_id_idx
  on public.inventory_items(household_id);

create index if not exists inventory_items_search_idx
  on public.inventory_items using gin (
    to_tsvector(
      'english',
      coalesce(item_name, '') || ' ' ||
      coalesce(category, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(location, '') || ' ' ||
      coalesce(supplier_name, '') || ' ' ||
      coalesce(notes, '')
    )
  );

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists inventory_items_touch_updated_at on public.inventory_items;
create trigger inventory_items_touch_updated_at
before update on public.inventory_items
for each row execute function public.touch_updated_at();

create or replace function public.is_household_member(target_household_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members
    where household_id = target_household_id
      and user_id = auth.uid()
      and approved = true
  );
$$;

create or replace function public.is_household_owner(target_household_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members
    where household_id = target_household_id
      and user_id = auth.uid()
      and approved = true
      and role = 'owner'
  );
$$;

alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.inventory_items enable row level security;

drop policy if exists "Approved members can read households" on public.households;
create policy "Approved members can read households"
on public.households for select
using (public.is_household_member(id));

drop policy if exists "Authenticated users can create households" on public.households;
create policy "Authenticated users can create households"
on public.households for insert
to authenticated
with check (created_by = auth.uid());

drop policy if exists "Owners can update households" on public.households;
create policy "Owners can update households"
on public.households for update
using (public.is_household_owner(id))
with check (public.is_household_owner(id));

drop policy if exists "Members can read membership rows" on public.household_members;
create policy "Members can read membership rows"
on public.household_members for select
using (user_id = auth.uid() or public.is_household_owner(household_id));

drop policy if exists "Owners can add members" on public.household_members;
create policy "Owners can add members"
on public.household_members for insert
to authenticated
with check (public.is_household_owner(household_id));

drop policy if exists "Owners can update members" on public.household_members;
create policy "Owners can update members"
on public.household_members for update
using (public.is_household_owner(household_id))
with check (public.is_household_owner(household_id));

drop policy if exists "Owners can remove members" on public.household_members;
create policy "Owners can remove members"
on public.household_members for delete
using (public.is_household_owner(household_id));

drop policy if exists "Approved members can read inventory" on public.inventory_items;
create policy "Approved members can read inventory"
on public.inventory_items for select
using (public.is_household_member(household_id));

drop policy if exists "Approved members can add inventory" on public.inventory_items;
create policy "Approved members can add inventory"
on public.inventory_items for insert
to authenticated
with check (public.is_household_member(household_id));

drop policy if exists "Approved members can edit inventory" on public.inventory_items;
create policy "Approved members can edit inventory"
on public.inventory_items for update
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));

drop policy if exists "Approved members can delete inventory" on public.inventory_items;
create policy "Approved members can delete inventory"
on public.inventory_items for delete
using (public.is_household_member(household_id));
