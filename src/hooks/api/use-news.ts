"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { newsKeys } from "@/constant/query-keys";
import {
  createNews,
  deleteNews,
  getDetailNews,
  getListNews,
  updateNews,
  type TResponseListNews,
} from "@/services/news.service";
import type { News, NewsFormValues, NewsListQuery } from "@/types/news";

export function useGetListNews(query: NewsListQuery) {
  return useQuery<TResponseListNews, Error>({
    queryKey: newsKeys.list(query),
    queryFn: ({ signal }) => getListNews(query, { signal }),
    // Data halaman sebelumnya tetap tampil saat pindah halaman/filter (tanpa berkedip).
    placeholderData: keepPreviousData,
  });
}

export function useGetDetailNews(id: string) {
  return useQuery<News, Error>({
    queryKey: newsKeys.detail(id),
    queryFn: async ({ signal }) => (await getDetailNews(id, { signal })).data,
  });
}

export function useCreateNews() {
  const queryClient = useQueryClient();
  return useMutation<News, Error, NewsFormValues>({
    mutationKey: ["news"],
    mutationFn: async (values) => (await createNews(values)).data,
    // Mengembalikan promise invalidate agar isPending bertahan sampai list segar.
    onSuccess: (news) => {
      queryClient.setQueryData(newsKeys.detail(news.id), news);
      return queryClient.invalidateQueries({ queryKey: newsKeys.lists() });
    },
  });
}

type TUpdateNewsVariables = { id: string; values: NewsFormValues };

export function useUpdateNews() {
  const queryClient = useQueryClient();
  return useMutation<News, Error, TUpdateNewsVariables>({
    mutationKey: ["news"],
    mutationFn: async ({ id, values }) => (await updateNews(id, values)).data,
    onSuccess: (news) => {
      queryClient.setQueryData(newsKeys.detail(news.id), news);
      return queryClient.invalidateQueries({ queryKey: newsKeys.lists() });
    },
  });
}

export function useDeleteNews() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationKey: ["news"],
    mutationFn: deleteNews,
    onSuccess: (_data, id) => {
      // Detail yang sudah dihapus dibuang, bukan di-set ulang.
      queryClient.removeQueries({ queryKey: newsKeys.detail(id) });
    },
    // Sukses maupun gagal (mis. 404 karena sudah terhapus) list perlu disegarkan.
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: newsKeys.lists() }),
  });
}
