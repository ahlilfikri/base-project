import { redirect } from "next/navigation";
import { ROUTES } from "@/constant/routes";

export default function Home() {
  redirect(ROUTES.news);
}
