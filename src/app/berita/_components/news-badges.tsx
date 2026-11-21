import { Badge } from "@/components/ui/badge";
import {
  NEWS_CATEGORY_LABELS,
  NEWS_STATUS_LABELS,
  type NewsCategoryValue,
  type NewsStatusValue,
} from "@/constant/news";

export function StatusBadge({ status }: { status: NewsStatusValue }) {
  return (
    <Badge variant={status === "published" ? "default" : "secondary"}>
      {NEWS_STATUS_LABELS[status]}
    </Badge>
  );
}

export function CategoryBadge({ category }: { category: NewsCategoryValue }) {
  return <Badge variant="outline">{NEWS_CATEGORY_LABELS[category]}</Badge>;
}
