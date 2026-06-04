-- ==========================================================
-- GFXTAB AI Studio — Supabase Database & Storage Setup Script
-- ==========================================================

-- 1. Profiles Table (extending auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'creator', 'admin')),
  credits integer default 50,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

-- Policies for Profiles
create policy "Allow public read access to profiles" 
  on public.profiles for select 
  using (true);

create policy "Allow users to update their own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- Trigger to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'user'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Creator Profiles Table
create table if not exists public.creator_profiles (
  id uuid references public.profiles(id) on delete cascade primary key,
  bio text,
  website text,
  sales_count integer default 0,
  rating numeric(3,2) default 5.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.creator_profiles enable row level security;

-- Policies for Creator Profiles
create policy "Allow public read access to creator profiles" 
  on public.creator_profiles for select 
  using (true);

create policy "Creators can manage their own profile"
  on public.creator_profiles for all
  using (auth.uid() = id);


-- 3. Mockup Templates Table (Asset Store / Marketplace)
create table if not exists public.mockups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  category text not null,
  image_url text not null, -- Mockup background photo from storage
  placement_data jsonb not null, -- Zone configurations: {x, y, w, h, rotation, blend_mode}
  tags text[],
  downloads_count integer default 0,
  creator_id uuid references public.creator_profiles(id) on delete set null,
  is_approved boolean default false,
  is_premium boolean default false,
  price numeric(10,2) default 0.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.mockups enable row level security;

-- Policies for Mockup Templates
create policy "Allow public read of approved mockups" 
  on public.mockups for select 
  using (is_approved = true or auth.uid() = creator_id);

create policy "Creators can insert mockups" 
  on public.mockups for insert 
  with check (auth.uid() = creator_id);

create policy "Creators can update/delete their own mockups"
  on public.mockups for all
  using (auth.uid() = creator_id);


-- 4. Projects Table
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  mockup_id uuid references public.mockups(id) on delete cascade not null,
  artwork_url text not null,
  canvas_state jsonb not null, -- Coordinate adjustments: {x, y, scale, rotation, color}
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.projects enable row level security;

-- Policies for Projects
create policy "Users can manage their own projects" 
  on public.projects for all 
  using (auth.uid() = user_id);


-- 5. Downloads Table
create table if not exists public.downloads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  mockup_id uuid references public.mockups(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.downloads enable row level security;

-- Policies for Downloads
create policy "Users can manage their own downloads" 
  on public.downloads for all 
  using (auth.uid() = user_id);


-- ==========================================================
-- 6. Storage Buckets and RLS Setup
-- ==========================================================

-- Create storage buckets if they do not exist
insert into storage.buckets (id, name, public)
values ('mockups', 'mockups', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('artworks', 'artworks', true)
on conflict (id) do nothing;

-- Allow public read access to mockups and artworks storage buckets
create policy "Public Access to Assets"
  on storage.objects for select
  using ( bucket_id in ('mockups', 'artworks') );

-- Allow authenticated uploads to mockups and artworks buckets
create policy "Authenticated Asset Uploads"
  on storage.objects for insert
  with check (
    bucket_id in ('mockups', 'artworks') 
    and auth.role() = 'authenticated'
  );

-- Allow users to manage (update/delete) their own uploaded assets
create policy "Manage Own Asset Uploads"
  on storage.objects for all
  using (
    bucket_id in ('mockups', 'artworks')
    and auth.uid()::text = owner::text
  );
