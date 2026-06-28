import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/queryClient";
import { ToastProvider } from "@/components/animations/Toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SEAPEDIA - Platform Belanja Terpercaya",
  description: "Platform belanja terpercaya untuk semua kebutuhan Anda",
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
