import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/queryClient";
import { ToastProvider } from "@/components/animations/Toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SEAPEDIA - Marketplace Terpercaya Indonesia",
  description: "Platform marketplace terpercaya di Indonesia. Belanja berbagai produk berkualitas dari ribuan seller terpercaya - makanan, fashion, elektronik, dan lainnya!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <QueryProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
