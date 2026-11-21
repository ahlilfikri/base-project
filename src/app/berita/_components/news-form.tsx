"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  NEWS_CATEGORIES,
  NEWS_CATEGORY_LABELS,
  NEWS_STATUSES,
  NEWS_STATUS_LABELS,
} from "@/constant/news";
import { ROUTES } from "@/constant/routes";
import { getErrorMessage } from "@/lib/errors";
import { newsInputSchema } from "@/lib/validations/news";
import type { NewsFormValues, NewsInput } from "@/types/news";

const EMPTY_VALUES: NewsFormValues = {
  title: "",
  content: "",
  category: "nasional",
  status: "draft",
  author: "",
  imageUrl: "",
};

type NewsFormProps = {
  defaultValues?: NewsFormValues;
  submitLabel: string;
  cancelHref?: string;
  onSubmit: (values: NewsFormValues) => Promise<void>;
};

export function NewsForm({
  defaultValues = EMPTY_VALUES,
  submitLabel,
  cancelHref = ROUTES.news,
  onSubmit,
}: NewsFormProps) {
  const form = useForm<NewsFormValues, unknown, NewsInput>({
    resolver: zodResolver(newsInputSchema),
    defaultValues,
  });
  const { control, register, handleSubmit, setError, formState } = form;
  const { errors, isSubmitting } = formState;

  const submit = handleSubmit(async (parsed) => {
    if (isSubmitting) return;
    try {
      await onSubmit(parsed);
    } catch (error) {
      // BaseResponse hanya membawa `errors` sebagai satu string, jadi kesalahan
      // dari server (mis. 422) ditampilkan sebagai satu pesan, bukan per field.
      setError("root", {
        type: "server",
        message: getErrorMessage(error),
      });
    }
  });

  return (
    <form onSubmit={submit} noValidate className="max-w-2xl">
      <FieldGroup>
        <Field data-invalid={!!errors.title}>
          <FieldLabel htmlFor="title">Judul</FieldLabel>
          <Input
            id="title"
            aria-invalid={!!errors.title}
            {...register("title")}
          />
          <FieldError errors={[errors.title]} />
        </Field>

        <Field data-invalid={!!errors.author}>
          <FieldLabel htmlFor="author">Penulis</FieldLabel>
          <Input
            id="author"
            aria-invalid={!!errors.author}
            {...register("author")}
          />
          <FieldError errors={[errors.author]} />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field data-invalid={!!errors.category}>
            <FieldLabel htmlFor="category">Kategori</FieldLabel>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="category"
                    className="w-full"
                    aria-invalid={!!errors.category}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NEWS_CATEGORIES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {NEWS_CATEGORY_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.category]} />
          </Field>

          <Field data-invalid={!!errors.status}>
            <FieldLabel htmlFor="status">Status</FieldLabel>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="status"
                    className="w-full"
                    aria-invalid={!!errors.status}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NEWS_STATUSES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {NEWS_STATUS_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.status]} />
          </Field>
        </div>

        <Field data-invalid={!!errors.imageUrl}>
          <FieldLabel htmlFor="imageUrl">URL gambar (opsional)</FieldLabel>
          <Input
            id="imageUrl"
            inputMode="url"
            placeholder="https://…"
            aria-invalid={!!errors.imageUrl}
            {...register("imageUrl")}
          />
          <FieldError errors={[errors.imageUrl]} />
        </Field>

        <Field data-invalid={!!errors.content}>
          <FieldLabel htmlFor="content">Isi berita</FieldLabel>
          <Textarea
            id="content"
            rows={8}
            aria-invalid={!!errors.content}
            {...register("content")}
          />
          <FieldError errors={[errors.content]} />
        </Field>

        {errors.root ? <FieldError errors={[errors.root]} /> : null}

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan…" : submitLabel}
          </Button>
          <Button asChild variant="outline">
            <Link href={cancelHref}>Batal</Link>
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
