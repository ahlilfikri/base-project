import { isAxiosError } from "axios";
import { apiErrorResponseSchema } from "@/lib/validations/api";

function readApiError(
  error: unknown,
): { message: string; errors?: string } | undefined {
  if (!isAxiosError(error)) return undefined;
  const parsed = apiErrorResponseSchema.safeParse(error.response?.data);
  if (!parsed.success) return undefined;
  return { message: parsed.data.metadata.message, errors: parsed.data.errors };
}

export function getErrorStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined;
}

export function getErrorMessage(error: unknown): string {
  const apiError = readApiError(error);
  if (apiError) {
    return apiError.errors
      ? `${apiError.message}: ${apiError.errors}`
      : apiError.message;
  }

  if (isAxiosError(error)) {
    if (error.response) return `Permintaan gagal (${error.response.status})`;
    if (error.code === "ERR_CANCELED") return "Permintaan dibatalkan";
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return "Permintaan ke server melebihi batas waktu";
    }
    return "Tidak dapat terhubung ke server";
  }

  if (error instanceof Error && error.message) return error.message;
  return "Terjadi kesalahan yang tidak diketahui";
}
