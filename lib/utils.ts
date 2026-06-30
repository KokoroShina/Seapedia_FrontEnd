import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format angka ke Rupiah
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Format tanggal ke bahasa Indonesia
export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

// Format tanggal + jam
export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

// Label status pesanan
export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    sedang_dikemas: "Sedang Dikemas",
    menunggu_pengirim: "Menunggu Pengirim",
    sedang_dikirim: "Sedang Dikirim",
    pesanan_selesai: "Pesanan Selesai",
    dikembalikan: "Dikembalikan",
  };
  return labels[status] ?? status;
}

// Get image URL with /storage/ prefix for local images
export function getImageUrl(path: string | null | undefined): string {
  if (!path || path === 'null' || path === 'undefined') {
    return '' // Let caller handle empty images
  }
  // If it's already a full URL with localhost, convert to /storage/ path
  if (path.startsWith('http://localhost') || path.startsWith('https://localhost')) {
    const match = path.match(/\/storage\/(.+)$/)
    if (match) return `/storage/${match[1]}`
  }
  // If it starts with /storage/ already, return as is
  if (path.startsWith('/storage/')) return path
  // If it's a full URL, return as is
  if (path.startsWith('http')) return path
  // Otherwise add /storage/ prefix
  return `/storage/${path}`
}

// Label metode pengiriman
export function getDeliveryMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    instant: "Instant (3 jam)",
    next_day: "Next Day (1 hari)",
    regular: "Regular (3 hari)",
  };
  return labels[method] ?? method;
}
