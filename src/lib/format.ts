// Zona waktu dikunci agar hasil render server dan browser sama (hindari hydration mismatch).
const dateTimeFormat = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso));
}
