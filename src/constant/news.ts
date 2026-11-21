export const NEWS_CATEGORIES = [
  "nasional",
  "ekonomi",
  "teknologi",
  "olahraga",
  "hiburan",
] as const;

export const NEWS_STATUSES = ["draft", "published"] as const;

export type NewsCategoryValue = (typeof NEWS_CATEGORIES)[number];
export type NewsStatusValue = (typeof NEWS_STATUSES)[number];

export const NEWS_CATEGORY_LABELS: Record<NewsCategoryValue, string> = {
  nasional: "Nasional",
  ekonomi: "Ekonomi",
  teknologi: "Teknologi",
  olahraga: "Olahraga",
  hiburan: "Hiburan",
};

export const NEWS_STATUS_LABELS: Record<NewsStatusValue, string> = {
  draft: "Draft",
  published: "Terbit",
};
