# Latihan Magang — Starter Next.js + CRUD Berita

Starter Next.js (App Router) dengan **Tailwind v4**, **shadcn/ui (Radix)**, **TanStack Query**, dan **Zod**.
Contoh fitur: CRUD Berita yang memanggil API REST di proses terpisah (mock server).

## Menjalankan

Prasyarat: Node `>=22.12` (lihat `.nvmrc`) dan bun.

```bash
bun install
cp .env.example .env.local     # opsional; default sudah http://127.0.0.1:4000
```

Jalankan **dua terminal**:

```bash
bun run dev:mock               # backend terpisah → http://127.0.0.1:4000
bun run dev                    # Next.js          → http://localhost:3000
```

> Selalu pakai `bun run test`, bukan `bun test` (yang memanggil test runner bawaan bun, bukan Vitest).
> Jika port 3000 terpakai, jalankan mock dengan `MOCK_ALLOWED_ORIGINS=http://localhost:3100 bun run dev:mock`
> agar CORS mengizinkan origin Next yang dipakai.

Skrip: `dev`, `dev:mock`, `build`, `start`, `lint`, `typecheck`, `test`.

## Struktur folder

```
public/             aset statis yang di-serve lewat URL (HARUS di root, aturan Next.js)
mock-server/        backend terpisah (Bun.serve) + tsconfig sendiri
src/
  app/              halaman; folder berawalan "_" (mis. berita/_components, _lib) = privat per halaman
  assets/           aset yang di-import ke kode
  components/ui/    komponen shadcn (hasil generate)
  components/shared/ komponen custom yang dipakai di banyak tempat
  constant/         konstanta, query key, rute
  hooks/api/        semua hook TanStack Query (satu-satunya tempat useQuery/useMutation)
  lib/              util, env, query client, schema Zod (lib/validations)
  providers/        provider React
  services/         akses API lewat instance axios `lib/axios.ts` (pola tutoria.id/admin)
  types/            tipe turunan schema Zod
```

## Kontrak API (imajiner) — `NEXT_PUBLIC_API_URL`

| Method | Endpoint | Sukses | Error |
|---|---|---|---|
| GET | `/news?page&limit(≤50)&q&status&category` | 200 `BaseResponse<News[]>` | 400 |
| GET | `/news/:id` | 200 `BaseResponse<News>` | 400 (id bukan UUID), 404 |
| POST | `/news` | 201 `BaseResponse<News>` | 400 JSON rusak, 413, 415 (wajib `application/json`), 422 |
| PUT | `/news/:id` (replace penuh) | 200 `BaseResponse<News>` | 400, 404, 413, 415, 422 |
| DELETE | `/news/:id` | 204 | 400, 404 |
| OPTIONS | `*` | 204 + header CORS | – |

Semua respons berbody memakai `BaseResponse<T>` (`src/types/base-response.ts`):

```ts
type Pagination = { page: number; limit: number; pages: number; total: number; totalItems: number };
type BaseResponse<T> = {
  metadata: { timestamp: string; code: number; message: string };
  data: T;
  pagination: Pagination;
  errors?: string;
};
```

- Respons gagal: `data: null`, `metadata.code` = status HTTP, rincian validasi dalam **satu string** `errors`
  (mis. `"title: Judul minimal 3 karakter; author: …"`), sehingga UI menampilkannya sebagai satu pesan, bukan per field.
- `pagination` wajib ada di tipe, jadi respons satu data (detail/POST/PUT) mengisinya dengan nilai tetap
  `{ page: 1, limit: 1, pages: 1, total: 1, totalItems: 1 }`.
- Asumsi: `total` dan `totalItems` sama-sama jumlah seluruh item (belum ada penjelasan perbedaannya).
- `DELETE` berhasil mengembalikan 204 tanpa body (tidak dibungkus `BaseResponse`).
Model `News`: `id` (UUID), `title`, `content`, `category`, `status`, `author`, `imageUrl?`, `createdAt`, `updatedAt`.

Batasan yang diketahui: `PUT` tanpa ETag/versi → pembaruan bersamaan bisa saling menimpa (lost update);
data mock disimpan in-memory dan kembali ke seed saat mock server dihidupkan ulang.

## Keputusan desain

- **axios** (`lib/axios.ts`) mengikuti pola tutoria.id/admin: satu instance `api`, fungsi service per endpoint,
  satu file hook per fitur di `hooks/api/` (mis. `use-news.ts`). Error axios **tidak dibungkus ulang** menjadi
  `new Error(message)` seperti di referensi, karena UI butuh status HTTP (404 → `notFound()` / toast); baca lewat `lib/errors.ts`.
  `withCredentials` tidak dipakai (mock tanpa cookie/auth).
- **Zod** memvalidasi form, query param, env, dan **respons API** (drift kontrak terdeteksi di klien).
  `src/lib/validations/*` hanya mengimpor `zod` dengan path relatif agar bisa dipakai bersama mock server.
- **TanStack Query murni sisi klien**: data diambil di komponen `"use client"` lewat hook di `hooks/api/`,
  seperti pola referensi (tanpa prefetch server, `HydrationBoundary`, atau `dehydrate`). `QueryProvider`
  membuat `QueryClient` lewat `useState`. Konsekuensinya: HTML awal berisi skeleton (data muncul setelah fetch
  di browser), server Next tidak perlu menjangkau API, dan id berformat UUID yang tidak ada di API menampilkan
  pesan "Berita tidak ditemukan" di halaman (HTTP 200), bukan 404. Id yang bukan UUID tetap 404 (dicek di server tanpa memanggil API).
- **Cache Components dimatikan** (default Next).
- Gambar berita memakai `<img referrerPolicy="no-referrer">` karena domain gambar bebas
  (`next/image` butuh `remotePatterns`).

## Pengecualian versi ("terbaru yang kompatibel")

Semua dependency memakai versi terbaru, kecuali:

| Paket | Dipakai | Terbaru | Alasan |
|---|---|---|---|
| `typescript` | `~6.0.3` | 7.0.2 | TS 7 tidak menyediakan API JS; `typescript-eslint` (peer `<6.1.0`) tidak bisa memuatnya, sehingga `eslint` rusak. `next build` sebenarnya aman di TS 7. |
| `@types/node` | `^22` | 26.x | Menyamai runtime Node 22; tipe Node 26 bisa memuat API yang tidak ada saat runtime. |

Naikkan keduanya saat `typescript-eslint` mendukung TS 7 / saat runtime Node dinaikkan.
`bun install` menampilkan peer warning ESLint 10 dari beberapa plugin bawaan `eslint-config-next`; lint tetap lulus.

## Pengujian

```bash
bun run lint        # eslint --max-warnings 0
bun run typecheck   # tsc app + tsc mock-server
bun run test        # vitest (environment node)
bun run build
```

Tes mencakup schema Zod, `lib/errors.ts`, `news.service.ts` (adapter axios diganti di tes), parser search params, dan **tes kontrak**
yang memastikan respons mock server lolos schema yang dipakai klien. Interaksi UI (hydration, form, dialog)
tidak punya tes otomatis; diverifikasi manual lewat browser (lihat dokumen plan, Bagian 12).
