-- Ejecutar en el SQL Editor del proyecto Supabase.

create table proyecto (
  id bigint generated always as identity primary key,
  proyecto text not null unique,
  contratista text
);

create table apuntes (
  id bigint generated always as identity primary key,
  fecha date not null,
  titulo_reunion text not null,
  apuntes text,
  proyecto text not null references proyecto(proyecto) on update cascade
);

alter table proyecto enable row level security;
alter table apuntes enable row level security;

create policy "authenticated full access" on proyecto
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access" on apuntes
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
