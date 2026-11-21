export const ROUTES = {
  home: "/",
  news: "/berita",
  newsNew: "/berita/baru",
  newsDetail: (id: string) => `/berita/${encodeURIComponent(id)}`,
  newsEdit: (id: string) => `/berita/${encodeURIComponent(id)}/edit`,
} as const;
