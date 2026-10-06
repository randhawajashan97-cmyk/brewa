create type public.app_role as enum ('admin','user');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, role app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

-- first user to sign up becomes owner/admin
create or replace function public.handle_first_admin() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role='admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_admin after insert on auth.users for each row execute function public.handle_first_admin();

create table public.site_settings (id int primary key default 1 check (id=1), is_open boolean not null default true, updated_at timestamptz not null default now());
grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "anyone reads settings" on public.site_settings for select to anon, authenticated using (true);
create policy "admin updates settings" on public.site_settings for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
insert into public.site_settings(id,is_open) values (1,true);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(customer_name) between 1 and 100),
  phone text not null check (char_length(phone) between 6 and 20),
  order_type text not null check (order_type in ('dine_in','takeaway','drive_through','delivery')),
  address text check (address is null or char_length(address) <= 300),
  notes text check (notes is null or char_length(notes) <= 300),
  items jsonb not null,
  total integer not null check (total >= 0),
  status text not null default 'new' check (status in ('new','preparing','ready','completed','cancelled')),
  created_at timestamptz not null default now()
);
grant insert on public.orders to anon, authenticated;
grant select, update, delete on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "place order when open" on public.orders for insert to anon, authenticated with check (status='new' and exists (select 1 from public.site_settings where is_open));
create policy "admin reads orders" on public.orders for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin updates orders" on public.orders for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin deletes orders" on public.orders for delete to authenticated using (public.has_role(auth.uid(),'admin'));
alter publication supabase_realtime add table public.orders;