# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Internal tool to log notes (`apuntes`) from weekly project-tracking meetings. Astro (static output) + React islands + Supabase (Postgres + Auth). Client-side only — no server/SSR: every page mounts a React component with `client:only="react"` that talks to `supabase-js` directly from the browser, session kept in localStorage.

Styling is Bootstrap 5 (CSS only, imported once in `Layout.astro`) plus a few hand-written inline SVG icons in `src/components/icons.tsx` — no `bootstrap-icons` package, no Bootstrap JS bundle. The navbar's hamburger collapse is driven by React state toggling the `show` class, not Bootstrap's own JS, to avoid mixing DOM-mutation strategies. Dark/light theme uses Bootstrap's native `data-bs-theme` attribute on `<html>`, set by an inline script in `Layout.astro` (before paint, reads `localStorage`/`prefers-color-scheme`) and flipped by the toggle button in `NavBar.tsx`.

## Commands

- `npm install`
- `npm run dev` — dev server
- `npm run build` — `astro check` (type-check) then `astro build`; use this to verify changes compile
- `npm run preview` — preview the static build

Requires `.env` (see `.env.example`) with `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` from a Supabase project. Without it, `npm run dev`/`build` still compile, but any page hitting Supabase will fail at runtime.

## Database

Schema lives in `supabase/schema.sql` — run it manually in the Supabase SQL Editor (there is no local Supabase CLI/migrations setup). Two tables:
- `proyecto(id, proyecto, contratista)` — `proyecto` (name) is unique, it's the natural key other rows reference.
- `apuntes(id, fecha, titulo_reunion, apuntes, proyecto)` — `proyecto` is a FK to `proyecto.proyecto` (not the numeric id).

RLS: any authenticated user has full read/write on both tables (shared team tool, no per-row ownership). Signup is open (no invite flow) — Supabase Auth handles both login and signup.

## Structure

- `src/lib/supabase.ts` — the one Supabase client instance, import this everywhere.
- `src/lib/useSession.ts` — shared hook: resolves the current session and redirects to `/login` if none. Used by every protected view (`NavBar`, `ApuntesView`, `ProyectosView`).
- `src/pages/*.astro` — one real page per view (`/`, `/login`, `/proyectos`), each just mounts its React component. Navigation between them is plain `<a>` links / `window.location`, no client router.
- `src/components/*.tsx` — the actual views. Each protected view owns its own data fetching (Supabase queries inline via `useEffect`) — there's no shared data layer/store beyond the Supabase client itself.
