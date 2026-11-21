import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/logo.svg";
import { Toaster } from "@/components/ui/sonner";
import { ROUTES } from "@/constant/routes";
import { cn } from "@/lib/utils";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: "Latihan Magang", template: "%s · Latihan Magang" },
  description: "Starter Next.js dengan contoh CRUD Berita",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={cn("font-sans", geist.variable)}>
      <body>
        <QueryProvider>
          <header className="border-b">
            <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
              <Link href={ROUTES.home} className="flex items-center gap-2 font-semibold">
                <Image src={logo} alt="" width={24} height={24} priority />
                Latihan Magang
              </Link>
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
          <Toaster richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
