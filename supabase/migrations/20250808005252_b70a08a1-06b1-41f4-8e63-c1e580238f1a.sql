-- Create storage bucket for chat attachments
insert into storage.buckets (id, name, public)
values ('chat_attachments', 'chat_attachments', true)
on conflict (id) do nothing;

-- Table for community message attachments
create table if not exists public.community_message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.community_messages(id) on delete cascade,
  bucket_id text not null default 'chat_attachments',
  path text not null,
  mime_type text,
  size integer,
  created_at timestamptz not null default now(),
  uploaded_by uuid not null
);

alter table public.community_message_attachments enable row level security;

-- Index for faster lookups
create index if not exists idx_cma_message_id on public.community_message_attachments(message_id);

-- Policies
create policy if not exists "Community attachments are readable" on public.community_message_attachments
for select using (true);

create policy if not exists "Users can insert their own community attachments" on public.community_message_attachments
for insert with check (auth.uid() = uploaded_by);

create policy if not exists "Users can update their own community attachments" on public.community_message_attachments
for update using (auth.uid() = uploaded_by);

create policy if not exists "Users can delete their own community attachments" on public.community_message_attachments
for delete using (auth.uid() = uploaded_by);

-- Table for conversation message attachments
create table if not exists public.conversation_message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.conversation_messages(id) on delete cascade,
  bucket_id text not null default 'chat_attachments',
  path text not null,
  mime_type text,
  size integer,
  created_at timestamptz not null default now(),
  uploaded_by uuid not null
);

alter table public.conversation_message_attachments enable row level security;

create index if not exists idx_vma_message_id on public.conversation_message_attachments(message_id);

create policy if not exists "Conversation attachments are readable" on public.conversation_message_attachments
for select using (true);

create policy if not exists "Users can insert their own conversation attachments" on public.conversation_message_attachments
for insert with check (auth.uid() = uploaded_by);

create policy if not exists "Users can update their own conversation attachments" on public.conversation_message_attachments
for update using (auth.uid() = uploaded_by);

create policy if not exists "Users can delete their own conversation attachments" on public.conversation_message_attachments
for delete using (auth.uid() = uploaded_by);

-- Storage policies for chat_attachments bucket
-- Public read
create policy if not exists "Public read for chat_attachments" on storage.objects
for select using (bucket_id = 'chat_attachments');

-- Only allow users to upload/update files in a folder matching their user id
create policy if not exists "Users can upload to their folder in chat_attachments" on storage.objects
for insert with check (
  bucket_id = 'chat_attachments' and auth.uid()::text = (storage.foldername(name))[1]
);

create policy if not exists "Users can update their files in chat_attachments" on storage.objects
for update using (
  bucket_id = 'chat_attachments' and auth.uid()::text = (storage.foldername(name))[1]
);

create policy if not exists "Users can delete their files in chat_attachments" on storage.objects
for delete using (
  bucket_id = 'chat_attachments' and auth.uid()::text = (storage.foldername(name))[1]
);
