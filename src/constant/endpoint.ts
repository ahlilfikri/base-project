export const ENDPOINTS = {
  NEWS: {
    LIST: "/news",
    CREATE: "/news",
    DETAIL: (id: string) => `/news/${encodeURIComponent(id)}`,
    UPDATE: (id: string) => `/news/${encodeURIComponent(id)}`,
    DELETE: (id: string) => `/news/${encodeURIComponent(id)}`,
  },
} as const;
