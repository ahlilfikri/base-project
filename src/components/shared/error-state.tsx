import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Terjadi kesalahan",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-2 rounded-xl border border-destructive/40 p-10 text-center"
    >
      <p className="font-medium text-destructive">{title}</p>
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry ? (
        <Button variant="outline" className="mt-2" onClick={onRetry}>
          Coba lagi
        </Button>
      ) : null}
    </div>
  );
}
