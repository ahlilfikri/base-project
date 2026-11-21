# Implementation Plan: Starter Next.js + CRUD Berita (Backend Terpisah / Mock)

- Tanggal: 2026-11-21
- Status: **PLANNING COMPLETED — WAITING FOR APPROVAL** (belum ada implementasi)
- Bahasa dokumen: Indonesia

---

## 1. Executive Summary

**Masalah/tujuan.** Membuat repository Next.js baru yang baik dan benar, dengan backend terpisah, memakai versi terbaru package, Tailwind, TanStack Query, Zod, shadcn/ui, struktur folder `src/` sesuai permintaan, dan contoh CRUD Berita terhadap API imajiner.

**Root cause.** Tidak ada bug; ini pekerjaan greenfield. Padanan "root cause" adalah risiko desain hasil investigasi dan review:
1. `create-next-app` tidak dapat dipakai apa adanya (direktori berisi `prompt.txt`, dan default `--yes` menyalakan fitur eksperimental serta `git init`).
2. "Semua versi terbaru" tidak sepenuhnya kompatibel: TypeScript 7.0.2 merusak typescript-eslint.
3. Beberapa API TanStack Query yang biasa dipakai sudah deprecated di versi terbaru.

**Expected outcome.** Project yang lulus `lint`, `typecheck`, `test`, dan `build`. CRUD Berita berjalan terhadap mock server di proses terpisah. Semua pengecualian versi tercatat dengan alasan.

---

## 2. Scope

**In scope:** scaffold manual Next, Tailwind v4, shadcn/ui, TanStack Query, Zod, struktur folder, CRUD Berita (list + cari + paginasi, detail, tambah, ubah, hapus), mock server `Bun.serve`, validasi env, unit test (vitest, environment node), README.

**Out of scope:** autentikasi, database sungguhan, repo backend sungguhan, deployment, i18n, upload gambar (hanya field `imageUrl`), test komponen berbasis jsdom, Playwright.

**Keputusan user yang sudah dikonfirmasi:**
- D-1: satu repo Next + mock server lokal sebagai "backend terpisah".
- D-2: `public/` di **root** (aturan Next.js), tidak ada `src/public`.
- D-3: package manager **bun**, dijalankan lewat comma Nix dengan awalan `,` (contoh `, bun install`). **Tidak ada instalasi global** (`npm i -g bun` dibatalkan). `,` ada di `~/.nix-profile/bin/,` (diverifikasi). Versi bun yang di-resolve `,` belum diverifikasi; di Nix store hanya terlihat bun 1.3.13 (bukan 1.4.5 dari npm).
- D-4 (jawaban user 2026-11-21): tafsir "terbaru" = **terbaru yang kompatibel**, dengan pengecualian tercatat: TypeScript `~6.0.3`, `@types/node@^22`.
- D-5 (jawaban user): shadcn varian **Radix** (`-b radix`).
- D-6 (jawaban user): **git dikerjakan manual oleh user**. Agent tidak menjalankan `git init`, `git add`, atau `git commit`.

**Related repositories:** tidak ada. Isi `../` (chat-engine-be dst.) tidak berkaitan dengan pekerjaan ini.

---

## 3. Repository Overview

| Item | Fakta (diverifikasi 2026-11-21) |
|---|---|
| Path | `/home/ahlil/reacteev-linux/ppe/latihan_magang` |
| Isi | hanya `prompt.txt` (1088 baris, 30008 byte) — **dilindungi, tidak boleh diubah** |
| Git | bukan git repository; tidak ada branch/perubahan lokal |
| Dokumentasi repo | tidak ada (AGENTS/CLAUDE/README/docs) |
| Node / npm | v22.20.0 / 10.9.3 |
| bun | **belum terpasang** (`which bun` gagal; `~/.bun` hanya berisi cache) |
| `npm prefix` | `~/.local` (bisa ditulis tanpa sudo) |

Versi terbaru di registry (2026-11-21): next 16.4.6, react/react-dom 19.3.1, tailwindcss + @tailwindcss/postcss 4.3.5, @tanstack/react-query 5.108.2, zod 4.6.7, shadcn 4.23.0, typescript 7.0.2 (dist-tag latest; 6.0.3 tersedia), eslint 10.15.0 (maintenance 9.39.5), vitest 5.1.1, bun 1.4.5.

---

## 4. Investigation Findings

Project greenfield: tidak ada source code repo untuk dirujuk dengan nomor baris. Bukti berasal dari isi paket di registry npm (dibaca lewat `npm view` dan `curl | tar -xzO`), sehingga referensi berupa **path berkas di dalam paket**. Status: Confirmed = terbukti dari isi paket; "Tidak terverifikasi" = belum dijalankan.

| ID | Temuan | Bukti | Severity | Confidence | Status |
|---|---|---|---|---|---|
| F-01 | `create-next-app` gagal bila direktori berisi `prompt.txt` | `create-next-app@16.4.6/dist/index.js` `isFolderEmpty` hanya mengabaikan `.git .gitignore docs LICENSE …` | High | High | Confirmed |
| F-02 | `--yes` menyalakan `cacheComponents`, `agentsMd`, `agentFeedback`, dan `git init` otomatis | `create-next-app@16.4.6/dist/index.js` (opsi `agentsMd`, `agentFeedback`, `tryGitInit`); default Next sendiri `cacheComponents:false` (`next/dist/server/config-shared.js:146`) | High | High | Confirmed (statis) |
| F-03 | TypeScript 7.0.2 tidak menyediakan API JS; typescript-eslint peer `<6.1.0` | `typescript@7.0.2/lib/` hanya `version.cjs getExePath.js tsc.js`; `typescript-eslint@8.73.0` peer `typescript >=4.8.4 <6.1.0`; `@typescript/native` 404 | High | High | Confirmed. `next build` aman di TS 7 (`config-shared.js:263`); `eslint` tidak |
| F-04 | ESLint 10 punya peer mismatch di plugin, tetapi `eslint-config-next` menambalnya | `eslint-plugin-react@7.37.5`, `-import@2.32.0`, `-jsx-a11y@6.10.2` peer hanya sampai `^9`; `eslint-config-next@16.4.6` punya `rule-context.js` (fixupPluginRules) dan `parser.js` (patch ESLint 10) | Low-Med | Medium | Probable; **hasil lint belum diuji** |
| F-05 | `fetchQuery`, `prefetchQuery`, `ensureQueryData` deprecated | `@tanstack/query-core@5.108.2/build/modern/hydration-C1yRFalg.d.ts:3176,3383,3392` ("Use queryClient.query(...)") | Medium | High | Confirmed (diverifikasi main agent) |
| F-06 | `z.uuid()` menolak UUID seed buatan tangan; `z.httpUrl()` menolak `localhost`; `z.url()` polos menerima `javascript:` | regex `zod@4.6.7/v4/core/regexes.js`, dieksekusi di node: `…0001`→false, `randomUUID()`→true | Medium | High | Confirmed (dieksekusi) |
| F-07 | `jsdom@31` butuh Node `^22.22.2`; Node lokal 22.20.0 | `npm view jsdom@31.0.1 engines` | Medium | High | Confirmed |
| F-08 | Komponen shadcn `form` kosong di registry radix-nova; `field` tersedia dan tidak memakai react-hook-form | `radix-nova/form.json` tanpa berkas, `field.json` ada | Medium | High | Confirmed (statis) |
| F-09 | `.gitignore` template memuat `.env*` tanpa `!.env.example` | `create-next-app/templates/app-tw/ts/gitignore` baris 33–34 | Low-Med | High | Confirmed |
| F-10 | `id` rute dipakai mentah di URL → path traversal ke endpoint lain (`/news/../admin`) | dieksekusi: `new URL("http://localhost:4000/news/../admin").pathname`=`/admin` | Medium | Medium | Confirmed (perilaku URL) |
| F-11 | Preflight CORS: `PUT`/`DELETE` + JSON memerlukan handler `OPTIONS`; `Bun.serve` default bind `0.0.0.0` | `bun-types` default `hostname:"0.0.0.0"`; preflight dari pengetahuan umum | Medium | Medium | Probable |
| F-12 | Template CNA mem-pin versi lama (typescript ^5, eslint ^9, tailwind 4.3.3, react 19.3.0) | template `package.json` CNA | Medium | High | Confirmed |
| F-13 | Next 16: `params`/`searchParams` adalah Promise; `next lint` dihapus | `next@16.4.6` dist | Low | High | Confirmed |

**Hipotesis yang belum terbukti (wajib diuji saat implementasi):** `eslint .` dengan ESLint 10 + `eslint-config-next` lulus; `bunx shadcn init` non-interaktif berjalan di Tailwind 4.3.5/Next 16.4.6/React 19.3.1; `@types/bun` tidak bentrok dengan lib DOM; react 19.3.1 (npm) vs 19.3.0 (vendored Next) tanpa warning; bun 1.4.5 menjalankan impor TS lintas folder.

**Alur end-to-end:** Browser → halaman Next (server component prefetch + `HydrationBoundary`) → komponen client `useQuery` / `useMutation` (`hooks/api`) → `services/news.service.ts` → `services/http.ts` (fetch + timeout + validasi Zod) → mock server `Bun.serve` (`127.0.0.1:4000`) → respons divalidasi Zod → cache TanStack Query → UI.

---

## 5. Proposed Solution

### 5.1 Strategi scaffold — **manual, tanpa `create-next-app`** (F-01, F-02)
Menulis ±10 berkas konfigurasi sendiri, lalu `bun add` tanpa pin versi sehingga otomatis terbaru. Tidak ada `git init`, `AGENTS.md`, atau flag eksperimental yang tidak diminta. `cacheComponents` dibiarkan mati dan dicatat di README.

### 5.2 Versi dan pengecualian (tafsir "terbaru yang kompatibel") — **perlu konfirmasi user**
| Paket | Versi | Catatan |
|---|---|---|
| next, react, react-dom, tailwindcss, @tailwindcss/postcss, @tanstack/react-query, zod | terbaru (`bun add`) | memenuhi permintaan |
| typescript | **`~6.0.3` (pengecualian)** | TS 7 merusak typescript-eslint (F-03). Naikkan ke 7 saat typescript-eslint mendukung |
| eslint | **coba 10.15.0**; bila `bun run lint` gagal turun ke `^9.39.5` | F-04 |
| @types/node | `^22` | sesuai runtime Node 22 |
| vitest + vite | terbaru, environment `node` | tanpa jsdom |

### 5.3 Dependency
- **Wajib dari user:** next react react-dom tailwindcss @tailwindcss/postcss @tanstack/react-query zod.
- **Toolchain:** typescript@~6.0.3, @types/node@^22, @types/react, @types/react-dom, eslint, eslint-config-next.
- **Dibawa shadcn (dicatat saat `init`):** class-variance-authority clsx tailwind-merge lucide-react radix-ui tw-animate-css next-themes sonner; dev: shadcn.
- **Tambahan beralasan:** react-hook-form + @hookform/resolvers (form + Zod; resolvers 7.0.8 mendukung zod 4). Alasan *bukan* "default shadcn" (F-08), melainkan ekosistem form yang matang.
- **Test:** vitest + vite. **Tidak dipakai:** jsdom, @testing-library/*, @vitejs/plugin-react, MSW, json-server.
- **Mock server:** tanpa dependency (`Bun.serve` + `Request/Response` standar); `@types/bun` hanya untuk `mock-server/tsconfig.json`.

### 5.4 Struktur folder
```
latihan_magang/
├─ public/                         # root (D-2)
├─ mock-server/                    # backend terpisah, port 4000
│  ├─ tsconfig.json  server.ts  seed.ts
├─ docs/plans/2026-11-21-nextjs-news-crud-starter.md
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx  page.tsx(redirect /berita)  globals.css  not-found.tsx  error.tsx
│  │  └─ berita/
│  │     ├─ page.tsx  loading.tsx  baru/page.tsx  [id]/page.tsx  [id]/edit/page.tsx
│  │     ├─ _components/   # news-list, news-form, news-table, delete-dialog
│  │     └─ _lib/          # parser search params (satu sumber default untuk server+client)
│  ├─ assets/
│  ├─ components/ui/  components/shared/
│  ├─ constant/   hooks/api/   lib/   providers/   services/   types/
```
Alias `@/*→./src/*`; `tsconfig` `exclude: ["node_modules","mock-server"]`.

### 5.5 Kontrak API imajiner (base URL `NEXT_PUBLIC_API_URL`, default `http://127.0.0.1:4000`)
Model `News`: `id` (UUID), `title` (3–150), `content` (min 10), `category` (`nasional|ekonomi|teknologi|olahraga|hiburan`), `status` (`draft|published`), `author` (2–80), `imageUrl` (opsional/null), `createdAt`, `updatedAt` (ISO).

| Method | Endpoint | Request | Sukses | Error |
|---|---|---|---|---|
| GET | `/news?page&limit(≤50)&q&status&category` | query | 200 `{data,meta{page,limit,total,totalPages}}` | 400 |
| GET | `/news/:id` | – | 200 `{data}` | 400 id bukan UUID, 404 |
| POST | `/news` | `NewsInput` (JSON wajib) | 201 `{data}` | 400 JSON rusak, 415 bukan JSON, 422 validasi |
| PUT | `/news/:id` | `NewsInput` (replace penuh) | 200 `{data}` | 400/404/415/422 |
| DELETE | `/news/:id` | – | 204 | 400/404 |
| OPTIONS | `*` | preflight | 204 + header CORS | – |
Error: `{error:{code,message,details?}}`. Tanpa auth. CORS hanya `http://localhost:3000` + `Vary: Origin`. Batas ukuran body. Rute tak dikenal → 404. Tidak ada klien lama → tidak ada isu kompatibilitas. Batasan diketahui: `PUT` penuh tanpa ETag → lost update (diterima untuk contoh).

### 5.6 Pola data (TanStack Query)
- `newsQueries` via `queryOptions()` (satu sumber key + queryFn) di `hooks/api`; key factory di `constant/query-keys.ts`.
- `lib/query-client.ts`: `QueryClient` per-request di server, singleton di browser, memakai `environmentManager.isServer()`; `staleTime` 60 detik; tidak retry untuk 4xx.
- Prefetch server: `await queryClient.query(...)` dalam try/catch; 404 → `notFound()`; `await params/searchParams`; `id` divalidasi `z.uuid()` (gagal → `notFound()`). **Tidak memakai** `fetchQuery/prefetchQuery` (F-05).
- List: `placeholderData: keepPreviousData`, debounce input cari. Key server & klien dari parser `_lib` yang sama (default `page=1, limit=10, q=""`).
- Mutasi: `onSuccess` mengembalikan `invalidateQueries`; delete → `removeQueries(detail(id))` + `invalidateQueries(list)`; hapus item terakhir di halaman terakhir → klamp ke halaman terakhir. Navigasi pasca-mutasi lewat callback tingkat-hook. Guard `isPending`/`isSubmitting` di handler (cegah submit ganda). Error 422 → `setError` per field.

### 5.7 Validasi (Zod 4)
`lib/validations/news.ts`: `newsSchema`, `newsInputSchema`, `newsListQuerySchema`, `newsListResponseSchema`. `id` = `z.uuid()`; `imageUrl` = `z.url({protocol:/^https?$/})` (izinkan localhost). Tipe di `types/` via `z.infer` (output) dan `z.input` untuk form. `validations/news.ts` hanya mengimpor `zod` dengan **path relatif** (tanpa `@/`) agar bisa dipakai mock server. `lib/env.ts` memvalidasi env dengan akses literal `process.env.NEXT_PUBLIC_API_URL`.

### 5.8 Service layer
`services/http.ts`: `fetch` + `AbortSignal.timeout`, non-2xx → `ApiError` (status, code, details), respons sukses divalidasi `schema.parse`. `news.service.ts`: `encodeURIComponent(id)` (F-10). `fetch(` hanya muncul di `http.ts`.

### 5.9 shadcn
Setelah tsconfig/struktur siap: `, bun x shadcn@latest init -t next -b radix` (padanan `bunx`; tanpa `--bun`), lalu `add button input textarea select label field table card badge skeleton alert-dialog dropdown-menu pagination separator sonner`. Selalu `add … --dry-run` dan tinjau diff sebelum menulis. Perlu jaringan; hasil nyata dicatat.

### 5.10 Skrip `package.json`
`dev`=`next dev`, `dev:mock`=`bun mock-server/server.ts`, `build`, `start`, `lint`=`eslint . --max-warnings 0`, `typecheck`=`tsc --noEmit`, `test`=`vitest run`. Dokumentasikan selalu `bun run test` (bukan `bun test`).

### 5.11 File yang dibuat
Semua **Create**; **tidak ada Modify/Delete**; `prompt.txt` tidak disentuh. Rincian: konfigurasi (`package.json`, `bun.lock`, `tsconfig.json`, `next.config.ts` kosong, `postcss.config.mjs`, `eslint.config.mjs`, `vitest.config.ts`, `components.json`, `.gitignore` dengan `!.env.example`, `.env.example`, `.nvmrc`, `README.md`); `src/**` sesuai 5.4; `mock-server/**`; test `*.test.ts`.

---

## 6. Implementation Sequence

0. **Prasyarat:** semua perintah bun memakai awalan `,` (`, bun add`, `, bun run lint`, `, bun mock-server/server.ts`). Tidak ada instalasi global. Langkah pertama: `, bun --version` dan catat versi aktual (bisa mengunduh dari cache Nix). Catatan: skrip `package.json` yang memanggil `bun` (mis. `dev:mock`) hanya jalan bila `bun` ada di PATH skrip; bun biasanya menyediakannya saat `bun run` (tidak terverifikasi). Bila tidak, `dev:mock` didokumentasikan sebagai `, bun mock-server/server.ts`. Git: tidak disentuh agent (D-6).
1. Scaffold manual + `bun add` (5.1–5.3). 
2. **Gerbang baseline:** `bun run lint`, `typecheck`, `build` pada halaman kosong. ESLint 10 gagal → turun `^9.39.5`. Bila react 19.3.1 bermasalah → pin 19.3.0.
3. shadcn `init` + `add` (5.9), tinjau diff.
4. Konstanta, types, validations, env.
5. `services` (http, news.service) + unit test.
6. Mock server + uji `curl`.
7. Provider + `hooks/api` + test.
8. `components/shared` + halaman berita.
9. Gerbang akhir: lint, typecheck, test, build; jalankan mock + `next dev`; uji E2E API (curl) dan SSR HTML; smoke test browser bila Chrome headless/agent-browser tersedia, selain itu checklist manual untuk user.
10. Final diff review, isi Bagian 12.

---

## 7. Acceptance Criteria

| ID | Kriteria | Verifikasi objektif |
|---|---|---|
| AC-1 | Versi terbaru kompatibel | `bun outdated` hanya memuat pengecualian tercatat (typescript, @types/node, + eslint/react bila turun) beserta alasannya di README |
| AC-2 | Tailwind aktif | `globals.css` memuat `@import "tailwindcss"`; tidak ada `tailwind.config.js` v3; `grep -r` utility yang dipakai di `.next/static/**/*.css` ≥ 1 |
| AC-3 | TanStack Query satu-satunya pengatur query | `grep -rn "useQuery\|useMutation" src` hanya di `hooks/api`; `grep -rn "fetch(" src` hanya di `services/http.ts` |
| AC-4 | Zod untuk form, query param, env, respons API | test: input invalid ditolak, respons malformed melempar error, `id` non-UUID ditolak, `imageUrl` `javascript:` ditolak |
| AC-5 | Struktur folder sesuai (kecuali D-2) | `find src -maxdepth 2 -type d` memuat semua folder yang diminta; folder privat berawalan `_` |
| AC-6 | CRUD via mock | skrip curl: POST→201, list memuat item, GET→200, PUT→200, DELETE→204, GET→404; `OPTIONS`→204 + header CORS; `/berita` SSR memuat data seed |
| AC-7 | Validasi/error | POST invalid→422 `details`; JSON rusak→400; bukan JSON→415; id bukan UUID→400; `limit>50` ditolak/diklamp |
| AC-8 | Kualitas | `bun run lint` (`--max-warnings 0`), `typecheck`, `test`, `build` exit 0 |
| AC-9 | Backend terpisah | mock di proses/port terpisah, bind `127.0.0.1`; tanpa route handler `/api/news` di Next |
| AC-10 | Tanpa secrets | `.env.example` hanya URL publik; `.env*` lain di-gitignore |
| AC-11 | Kontrak | satu test memastikan respons mock server lolos schema klien |

---

## 8. Testing Strategy
- **Unit (vitest, env node):** schema Zod (valid/invalid/batas, UUID, URL), `http.ts` (2xx, 4xx→`ApiError`, timeout, malformed), `news.service.ts` (URL builder, `encodeURIComponent`, `../`), query-keys, parser search params.
- **Kontrak:** mock server dijalankan, respons divalidasi schema klien (AC-11).
- **Integrasi:** skrip curl terhadap mock (AC-6/7).
- **UI/hydration:** tidak dapat dibuktikan lewat unit test node. Dilakukan smoke test browser jika tooling ada (`/usr/bin/google-chrome` dan `~/.local/bin/agent-browser` ditemukan, belum dicoba), atau checklist manual yang dilaporkan jujur sebagai "diverifikasi manual".
- **Regression:** baseline `build` sebelum fitur ditambah.
- **Security:** cek secret, tidak ada `dangerouslySetInnerHTML`, gambar via `<img referrerPolicy="no-referrer">` (atau `next/image unoptimized`; `remotePatterns` default kosong), tes traversal.

---

## 9. Risk Assessment

| ID | Risiko | Mitigasi |
|---|---|---|
| R-1 | ESLint 10 + plugin Next belum terbukti jalan | gerbang lint di baseline; fallback `^9.39.5` |
| R-2 | `shadcn init` non-interaktif/registry berubah | `--dry-run`, tinjau diff, catat hasil nyata |
| R-3 | bun via `,` kemungkinan 1.3.13 (bukan 1.4.5); `Bun.serve` 1.3.13 sudah dicoba reviewer #2, impor TS lintas folder belum | catat versi aktual; uji mock server di langkah 6; `bun` di PATH skrip `package.json` belum terverifikasi (lihat langkah 0); fallback `npx bun@1.4.5` atau npm hanya dengan persetujuan |
| R-4 | `@types/bun` bentrok dengan lib DOM | `mock-server/tsconfig.json` terpisah, dikecualikan dari tsconfig utama |
| R-5 | React 19.3.1 vs vendored 19.3.0 | pin 19.3.0 bila ada warning |
| R-6 | Hydration mismatch / perilaku mutasi tak teruji otomatis | smoke test browser atau checklist manual |
| R-7 | Mock in-memory hilang saat restart; PUT tanpa ETag | diterima, didokumentasikan |
| R-8 | Peer warning ESLint 10 | dicatat; jangan abaikan bila lint gagal |
**Breaking change:** tidak ada (greenfield). **Rollback:** hapus berkas yang dibuat (daftar di Bagian 12) kecuali `prompt.txt`; `npm rm -g bun` bila dipasang; hapus `/tmp/.nx.tgz` (sisa sub-agent #1, di luar proyek, 44 MB). Tanpa DB/deployment.

---

## 10. Independent Verification

Kedua reviewer adalah sub-agent terpisah (Plan agent) dengan akses baca ke registry dan lingkungan; keduanya tidak menjalankan install/build/lint (read-only). Reviewer #2 menerima laporan lengkap #1 dan memverifikasi ulang. **Batas:** tidak ada pengujian runtime (create-next-app, shadcn init, eslint, next build, bun 1.4.5), tidak ada uji browser. Sub-agent #1 tanpa sengaja membuat `/tmp/.nx.tgz` (di luar proyek).

### Sub-Agent #1 (15 temuan R1-001…R1-015)
Ringkasan: scaffold gagal di direktori berisi `prompt.txt` (High); TS 7 vs typescript-eslint (High); AC-1 vs AC-8 kontradiktif (High); ESLint 10 peer mismatch, jsdom 31 vs Node, dependency test hilang, jebakan Zod 4, CORS/`OPTIONS`, celah desain TanStack Query, `.gitignore` menyembunyikan `.env.example`, testing tidak membuktikan UI.

### Sub-Agent #2
- **Valid:** R1-001, R1-002, R1-005, R1-007, R1-011, R1-013, R1-015.
- **Partially valid / diturunkan:** R1-003 (ESLint 10 sudah ditambal Next → uji dulu, bukan pin ^9), R1-004 (High→Medium), R1-006, R1-008 (risiko `::1` terbantah: `localhost` hanya resolve ke `127.0.0.1`), R1-009 (rekomendasi `fetchQuery` salah, deprecated), R1-010, R1-012, R1-014.
- **Ditolak:** klaim "`tw-animate-css` mungkin tak persis" (registry memuatnya).
- **Temuan baru:** R2-001 (default `--yes` CNA), R2-002 (Cache Components), R2-003 (API deprecated), R2-004 (shadcn: `form` kosong, perlu `field`, pilih Radix/Base UI), R2-005 (path traversal `id`), R2-006 (keamanan mock), R2-007 (justifikasi RHF), R2-008 (over-engineering stack test), R2-009 (tafsir "terbaru"), R2-010 (urutan), R2-011 (opsi instal bun), R2-012 (`next/image`, `error.tsx` `retry`).

### Final Decision (Decision Log)
| Finding | Sumber | Keputusan | Alasan |
|---|---|---|---|
| R1-001 / R2-001 | #1,#2 | **Diterima**, solusi #2 (scaffold manual) | Template CNA di temp dir tetap membawa default tersembunyi |
| R1-002 | #1 | Diterima | Terbukti dari isi paket; pin TS ~6.0.3 |
| R1-003 | #1 | Diterima sebagian | Uji ESLint 10 dulu, fallback ^9; pin ^9 dari awal ditolak (ditambal Next) |
| R1-004 / R2-009 | #1,#2 | Diterima | AC-1 ditulis ulang; tafsir butuh konfirmasi user |
| R1-005 / R2-008 | #1,#2 | Diterima | jsdom dan testing-library dibuang; vitest env node |
| R1-006 | #1 | Diterima sebagian | tsconfig mock terpisah; `@testing-library/dom` moot |
| R1-007 | #1 | Diterima | dieksekusi, terbukti |
| R1-008 | #1 | Diterima sebagian | `OPTIONS` + bind `127.0.0.1`; `API_URL` ganda ditolak (starter cukup satu env) |
| R1-009 / R2-003 | #1,#2 | Diterima, rekomendasi diganti | `query()` bukan `fetchQuery` |
| R1-010 | #1 | Diterima (diturunkan) | impor relatif + tes kontrak AC-11 |
| R1-011 | #1 | Diterima | `.gitignore` manual + README |
| R1-012 | #1 | Diterima sebagian | `bunx` tanpa `--bun`; dokumentasikan `bun run test` |
| R1-013 | #1 | Diterima | smoke/manual jujur; AC diberi perintah konkret |
| R1-014 | #1 | Diterima kecuali klaim `tw-animate-css` | ditolak: terbantah registry |
| R2-002, R2-005, R2-006, R2-007, R2-010, R2-012 | #2 | Diterima | masuk desain dan AC |
| R2-004 | #2 | Diterima | `field`, `-b radix`, `--dry-run`; **Radix vs Base UI butuh konfirmasi** |
| R2-011 | #2 | Diterima | opsi A disarankan, butuh persetujuan |

**Perubahan dari plan awal:** scaffold manual (bukan CNA); TypeScript ~6.0.3; ESLint dengan gerbang; vitest env node tanpa jsdom/RTL; `query()` menggantikan `prefetchQuery`; `id`/`limit` divalidasi; mock server diperkuat (OPTIONS, 415, 127.0.0.1); AC-1/2/3/6/7/8 ditulis ulang; AC-11 baru; README + `.gitignore` benar. **Risiko tersisa:** R-1…R-8. **Semua acceptance criteria terakomodasi** dalam rencana (belum terverifikasi; itu pekerjaan implementasi).

---

## 11. Implementation Progress (selesai 2026-11-21)

- [x] Step 0a — Keputusan user: bun via `,` (D-3), tafsir versi (D-4), Radix (D-5), git manual (D-6)
- [x] Step 0b — Persetujuan eksplisit user atas plan final diterima ("plan disetujui, mulai implementasi")
- [x] Step 0c — `, bun --version` = **1.3.13** (bukan 1.4.5)
- [x] Step 1 — Scaffold manual + `bun add` (next 16.4.6, react 19.3.1, @tanstack/react-query 5.108.2, zod 4.6.7, RHF 7.92.0, resolvers 7.0.8; dev: tailwindcss 4.3.5, typescript 6.0.3, @types/node 22.20.5, eslint 10.15.0, eslint-config-next 16.4.6, vitest 5.1.1, vite 8.3.8)
- [x] Step 2 — Gerbang baseline: `, bun run lint` exit 0 (ESLint 10.15.0 jalan, hanya peer warning bun), `typecheck` exit 0, `build` exit 0 (Next 16.4.6 Turbopack); utility Tailwind ada di `.next/static/chunks/*.css`
- [x] Step 3 — shadcn `init -t next -b radix -p nova` + `add` 14 komponen (dry-run dulu: 14 file baru, 0 ditimpa). Lihat catatan implementasi I-1 dan I-2
- [x] Step 4 — constant, types, validations, env
- [x] Step 5 — services + unit test
- [x] Step 6 — mock server + uji curl + tes kontrak
- [x] Step 7 — providers + hooks/api
- [x] Step 8 — components/shared + halaman berita
- [x] Step 9 — lint, typecheck, test, build (exit 0 semua); curl terhadap `next start`; uji interaksi di browser lewat agent-browser
- [x] Step 10 — Review file akhir (repo bukan git, jadi bukan git diff) + README + Bagian 12

### Catatan implementasi (penyimpangan dan temuan baru)

| ID | Temuan / penyimpangan | Tindakan |
|---|---|---|
| I-1 | `,` (comma Nix) tidak menaruh `bun` di PATH untuk proses anak: `shadcn init` gagal `spawn bun ENOENT` | Perintah sesudahnya dijalankan dengan `PATH` berisi direktori bun 1.3.13 dari Nix store (`/nix/store/…-bun-1.3.13/bin`). Ini menyimpang dari "awalan `,`" |
| I-2 | `shadcn init` tanpa flag lengkap berhenti di prompt interaktif (preset, lalu reinstall). Percobaan pertama menulis `components.json` sebelum gagal | Dijalankan ulang dengan `-p nova -f --no-reinstall --no-monorepo --no-rtl --no-pointer` dan stdin ditutup. Hanya `components.json`, `button.tsx`, `utils.ts`, `globals.css`, `layout.tsx` berubah |
| I-3 | shadcn 4.23 memakai paket npm `cn@0.5.2` (maintainer terdaftar: `shadcn`) di `src/lib/utils.ts`, bukan `clsx` + `tailwind-merge` seperti di plan | Dibiarkan sesuai hasil CLI; dicatat sebagai dependency tak terduga |
| I-4 | **`loading.tsx` di `berita/` membuat `notFound()` pada `/berita/[id]` berstatus HTTP 200** (streaming sudah terkirim). Ketahuan lewat curl, bukan lewat build/lint/test | `page.tsx` dan `loading.tsx` daftar dipindah ke route group `berita/(list)/`. Diverifikasi ulang: id bukan UUID → 404, UUID tak ada → 404 |
| I-5 | Port 3000 sudah dipakai proses lain (`bun`, cwd `/home/ahlil/self-project/portfolio`) | **Tidak disentuh.** Uji memakai port 3100 |
| I-6 | CORS mock hanya mengizinkan `localhost:3000`, sehingga mutasi dari browser di port 3100 gagal `Failed to fetch` (ketahuan di browser) | Ditambah env `MOCK_ALLOWED_ORIGINS` (default tetap port 3000). Penambahan kecil di luar plan |
| I-7 | `src/components/ui/**` dikecualikan dari ESLint | Keputusan saya: kode hasil generate shadcn. Tidak ada di plan |
| I-8 | `vitest.config.ts` diganti `vitest.config.mts` | Menghilangkan peringatan Vite soal ESM di file CommonJS |
| I-9 | Berkas tambahan di luar daftar plan: `src/assets/logo.svg`, `public/robots.txt`, `src/lib/errors.ts`, `src/lib/format.ts`, `src/lib/validations/api.ts`, `src/app/berita/_components/news-{badges,filters}.tsx`, `src/app/berita/_lib/prefetch.ts` | Diperlukan agar struktur folder terisi dan UI lengkap |
| I-10 | Ketahuan lewat uji: klik tombol Simpan lewat koordinat gagal karena tombol di luar viewport (577px) | Masalah alat uji, bukan aplikasi. Dipakai `scrollintoview` sebelum klik |

---

## 12. Final Verification

### Revisi pasca-implementasi (permintaan user, 2026-11-21)

Atas permintaan user setelah status COMPLETED di bawah, lapisan API diubah mengikuti `/home/ahlil/reacteev-linux/tutoria.id/admin` (dibaca saja; repo itu tidak diubah). Bagian lain di dokumen ini yang menyebut `http.ts`, `ApiError`, `{data, meta}`, atau error 422 per field **sudah usang** dan menggambarkan keadaan sebelum revisi.

| Perubahan | Rincian |
|---|---|
| `services/http.ts` dan `types/api.ts` | Dihapus (sesuai permintaan; "`@types.tsx`" ditafsirkan `src/types/api.ts`, dikonfirmasi user) |
| axios | `axios@1.21.1`; `lib/axios.ts` = instance `api` (baseURL dari env, timeout 10 dtk); `constant/endpoint.ts` mengikuti `ENDPOINTS` referensi |
| Service | `services/news.service.ts` berisi fungsi `getListNews/getDetailNews/createNews/updateNews/deleteNews`; respons tetap divalidasi Zod (pilihan user) |
| Hooks | Lima file `use-*.ts` digabung menjadi `hooks/api/use-news.ts` (pola `use-universities.ts`); `news-queries.ts` tetap untuk prefetch server |
| `QueryProvider` / `query-client` | `useState` + nilai dasar referensi (`staleTime` 1 mnt, `gcTime` 5 mnt, `refetchOnWindowFocus: false`). Penyimpangan: `retry` fungsi (tanpa retry di server dan untuk 4xx), bukan `retry: 1`; `getQueryClient()` tetap dipakai untuk SSR |
| `BaseResponse` | Tipe persis dari user di `types/base-response.ts`; schema Zod padanannya di `lib/validations/api.ts`; mock server memakai bentuk ini |
| Error | Error axios tidak dibungkus; `lib/errors.ts` (`getErrorStatus`, `getErrorMessage`). Pesan memakai `metadata.message` + `errors` |

**Perubahan perilaku yang perlu diketahui:**
- Pesan validasi server (422) kini satu string `errors`, jadi form menampilkannya sebagai satu pesan umum, **bukan per field** seperti sebelumnya. Validasi per field di form tetap berjalan dari Zod di klien. Jalur 422 dari server tidak diuji di browser (klien memvalidasi lebih dulu); hanya diuji di tingkat service.
- Respons satu data wajib membawa `pagination` (tipe user mewajibkannya), sehingga mock mengisi nilai tetap. Ini kebiasaan mock saya, bukan keputusan user.
- `total` vs `totalItems`: keduanya diisi jumlah seluruh item (asumsi).
- Di repo referensi **tidak ada** berkas atau kode bernama `baseResponse` maupun `fetcher`. `fetcher` ditafsirkan sebagai instance `api` (pilihan user); `baseResponse` memakai tipe dari user.
- `ApiError`, `TBaseResponse`, `TBaseListResponse`, `getErrorDetails`, dan tes `http`-based lama dihapus.

**Revisi lanjutan: TanStack Query murni sisi klien (permintaan user).** User menilai prefetch server + `HydrationBoundary` tidak umum untuk proyek ini. Dihapus: `src/app/berita/_lib/prefetch.ts`, `src/hooks/api/news-queries.ts`, route group `berita/(list)` (halaman daftar kembali ke `berita/page.tsx`), `export const dynamic = "force-dynamic"`, dependency `server-only`, dan `getQueryClient()` + `environmentManager` (diganti `createQueryClient()` yang dipanggil `QueryProvider` lewat `useState`). Halaman `[id]` dan `[id]/edit` hanya memvalidasi id sebagai UUID (bukan UUID → `notFound()`), lalu merender komponen klien. Konsekuensi yang sudah diverifikasi: HTML awal berisi skeleton `Memuat berita`, dan `/berita/<UUID tak ada>` kini HTTP 200 dengan pesan "Berita tidak ditemukan" di halaman (sebelumnya 404). `/berita/abc` tetap 404. Keputusan desain dan temuan I-4 (`loading.tsx` vs `notFound()`) di dokumen ini tidak berlaku lagi. Pengecualian: pada `query-client`, penyimpangan "tanpa retry di server" ikut hilang karena tidak ada lagi query di server; penyimpangan "tanpa retry untuk 4xx" tetap.

**Verifikasi ulang setelah revisi:** `lint` exit 0 (`--max-warnings 0`), `typecheck` exit 0, `test` **60 lulus** (6 file), `build` exit 0. curl ke mock (bentuk `BaseResponse`, 422/404/204), SSR (`/berita`, paginasi, filter, detail valid/tak ada/bukan UUID → 200/404/404), dan browser (agent-browser): validasi form, tambah, ubah, hapus dengan dua klik cepat, klamp `page=99`→`page=3`, dan tampilan saat API mati ("Tidak dapat terhubung ke server" + tombol "Coba lagi"). AC-3 diperiksa ulang: `useQuery`/`useMutation` hanya di `src/hooks/api`; tidak ada `fetch(` di `src`; `lib/axios` hanya diimpor `services/news.service.ts` (dan tesnya).

### Hasil pengujian (run terakhir, 2026-11-21, bun 1.3.13)
*Tabel ini dan tabel AC di bawah ditulis sebelum revisi di atas; angka test saat itu 45, kini 60.*
| Perintah | Hasil |
|---|---|
| `bun run lint` (`eslint . --max-warnings 0`, ESLint 10.15.0) | exit 0 |
| `bun run typecheck` (`tsc` app + `tsc -p mock-server`, TypeScript 6.0.3) | exit 0 |
| `bun run test` (vitest 5.1.1) | exit 0, 5 file, **45 test lulus** |
| `bun run build` (Next 16.4.6, Turbopack) | exit 0; rute `/`, `/berita`, `/berita/[id]`, `/berita/[id]/edit`, `/berita/baru` |
| curl ke mock server (CRUD, 422, 400, 415, 404, OPTIONS, CORS) | sesuai kontrak |
| curl ke `next start` (SSR memuat data seed, filter `q`, param invalid tetap 200, 404 untuk id salah/tak ada, logo, `robots.txt`) | sesuai |
| agent-browser (Chrome): tambah (invalid, URL `javascript:` ditolak, valid → redirect), ubah, hapus dari halaman detail (2 klik cepat), paginasi, klamp `page=99`→`page=3`, pencarian debounce | sesuai |

### Acceptance criteria
| ID | Status | Evidence |
|---|---|---|
| AC-1 | Passed | `bun outdated` hanya memuat `typescript` 6.0.3 (latest 7.0.2) dan `@types/node` 22.20.5 (latest 26.6.6); keduanya pengecualian tercatat di README |
| AC-2 | Passed | `globals.css` memuat `@import "tailwindcss"`; tidak ada `tailwind.config.*`; utility `font-semibold` ada di `.next/static/chunks/*.css` (dicek pada build baseline, tidak diulang pada build akhir) |
| AC-3 | Passed | `useQuery`/`useMutation` hanya di `src/hooks/api`; satu-satunya `fetch(` non-test ada di `src/services/http.ts:39`. Halaman server memanggil `queryClient.query()` langsung (TanStack Query, bukan fetch) |
| AC-4 | Passed | tes Zod (input invalid, `id` non-UUID, `imageUrl` `javascript:`/`data:`, respons malformed → `INVALID_RESPONSE`); validasi form terlihat di browser |
| AC-5 | Passed | `src/{app,assets,components/{ui,shared},constant,hooks/api,lib,providers,services,types}`; `public/` di root (D-2); folder privat `_components`, `_lib` |
| AC-6 | Passed | curl: POST 201, list, GET 200, PUT 200, DELETE 204, GET 404, `OPTIONS` 204 + CORS; `/berita` SSR memuat seed |
| AC-7 | Passed | 422 dengan `details`, JSON rusak 400, bukan JSON 415, id bukan UUID 400, `limit=51` 400, body besar 413 (tes) |
| AC-8 | Passed | lint, typecheck, test, build semuanya exit 0 |
| AC-9 | Passed | mock di proses/port sendiri, bind `127.0.0.1`; tidak ada `route.ts` atau folder `api` di `src/app` |
| AC-10 | Passed | satu-satunya berkas env adalah `.env.example` (hanya URL); tidak ada `dangerouslySetInnerHTML`. Aturan `.gitignore` hanya dibaca, belum diuji dengan git |
| AC-11 | Passed | `mock-server/app.test.ts`: respons mock lolos `newsListResponseSchema`/`newsResponseSchema` |

### Daftar berkas
Semua **Create** (tidak ada Modify/Delete atas berkas yang sudah ada; `prompt.txt` tetap 30008 byte). Daftar lengkap ada di keluaran `find` pada sesi implementasi: konfigurasi (`package.json`, `bun.lock`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `vitest.config.mts`, `components.json`, `.gitignore`, `.env.example`, `.nvmrc`, `README.md`), `src/**`, `mock-server/**`, `public/robots.txt`. Artefak hasil tooling: `next-env.d.ts`, `tsconfig.tsbuildinfo` (keduanya di-gitignore), `node_modules/`, `.next/`.

### Remaining issues / keterbatasan
- **Tidak diuji:** `next dev` (hanya `next start`); tampilan saat API mati (ErrorState + coba lagi); pemetaan 422 server ke field di UI (hanya diuji di level service); hapus dari tabel daftar (hanya dari halaman detail); apakah klik ganda cepat benar-benar hanya mengirim satu `DELETE` (yang diamati hanya hasil akhir); hydration mismatch (tidak ada error teramati, tetapi tidak diperiksa sistematis).
- `bun run dev:mock` berhasil dijalankan dengan bun di PATH (smoke test akhir). Lewat `, bun run dev:mock` **belum diuji**: skrip memanggil `bun`, dan `,` tidak menaruh bun di PATH proses anak (I-1). Jika gagal `spawn bun ENOENT`, jalankan `, bun mock-server/server.ts`.
- bun yang dipakai 1.3.13, bukan 1.4.5.
- Peer warning ESLint 10 dari `bun install` masih muncul; lint tetap lulus.
- Tidak ada tes komponen React otomatis (keputusan plan: tanpa jsdom).
- Batasan desain: `PUT` tanpa ETag; data mock hilang saat restart.
- Sisa di luar proyek: `/tmp/.nx.tgz` (44 MB, dari sub-agent #1) dan berkas scratch di `/tmp` (`before-shadcn.txt`, `dom.html`, `*.log`, dll.). Belum dihapus.

### Final Git diff review
Repo bukan git (D-6: git dikerjakan user), jadi tidak ada `git diff`. Sebagai gantinya: daftar berkas dibandingkan dengan plan (penambahan di luar plan dicatat di I-9), dan tidak ditemukan secret, kode debug, atau `dangerouslySetInnerHTML`.

### Status akhir
**COMPLETED** — seluruh AC-1…AC-11 Passed dengan bukti di atas, dengan keterbatasan pengujian yang tercantum.
