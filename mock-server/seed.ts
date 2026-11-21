import type { NEWS_CATEGORIES, NEWS_STATUSES } from "../src/constant/news";

export type NewsRecord = {
  id: string;
  title: string;
  content: string;
  category: (typeof NEWS_CATEGORIES)[number];
  status: (typeof NEWS_STATUSES)[number];
  author: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

const samples: Array<Pick<NewsRecord, "title" | "category" | "status" | "author">> = [
  { title: "Pemerintah umumkan program digitalisasi desa", category: "nasional", status: "published", author: "Sari Wulandari" },
  { title: "Rupiah menguat tipis di akhir pekan", category: "ekonomi", status: "published", author: "Dimas Prakoso" },
  { title: "Startup lokal luncurkan platform belajar berbasis AI", category: "teknologi", status: "published", author: "Rina Maharani" },
  { title: "Tim nasional bersiap hadapi laga kualifikasi", category: "olahraga", status: "published", author: "Agus Santoso" },
  { title: "Festival film independen digelar bulan depan", category: "hiburan", status: "draft", author: "Maya Putri" },
  { title: "Inflasi bulanan tetap terkendali", category: "ekonomi", status: "published", author: "Dimas Prakoso" },
  { title: "Peluncuran satelit komunikasi generasi baru", category: "teknologi", status: "published", author: "Rina Maharani" },
  { title: "Musim baru liga domestik resmi dimulai", category: "olahraga", status: "published", author: "Agus Santoso" },
  { title: "Konser amal kumpulkan donasi untuk korban banjir", category: "hiburan", status: "published", author: "Maya Putri" },
  { title: "Revisi aturan transportasi daring masuk pembahasan", category: "nasional", status: "draft", author: "Sari Wulandari" },
  { title: "Bursa saham ditutup menghijau", category: "ekonomi", status: "published", author: "Dimas Prakoso" },
  { title: "Peneliti kembangkan baterai berumur panjang", category: "teknologi", status: "published", author: "Rina Maharani" },
];

/** Data awal; ID dibuat dengan crypto.randomUUID() (UUID v4 valid untuk z.uuid()). */
export function createSeed(): NewsRecord[] {
  const base = Date.parse("2026-11-01T08:00:00.000Z");
  return samples.map((sample, index) => {
    const timestamp = new Date(base + index * 6 * 60 * 60 * 1000).toISOString();
    return {
      ...sample,
      id: crypto.randomUUID(),
      content: `${sample.title}. Ini adalah isi berita contoh nomor ${index + 1} yang dibuat oleh mock server untuk keperluan latihan CRUD.`,
      imageUrl: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  });
}
