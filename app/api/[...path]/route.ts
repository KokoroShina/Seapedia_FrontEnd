import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const LARAVEL_URL = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:80";

async function handler(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("seapedia_token")?.value;

  // Ambil path setelah /api/
  const pathname = req.nextUrl.pathname.replace(/^\/api\//, "");
  const search = req.nextUrl.search;
  const targetUrl = `${LARAVEL_URL}/api/${pathname}${search}`;

  const contentType = req.headers.get("content-type") || "";
  const isMultipart = contentType.includes("multipart/form-data");

  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let body: BodyInit | undefined;

  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    if (isMultipart) {
      // Untuk multipart, kita perlu ambil Content-Type lengkap dengan boundary
      // Browser akan set Content-Type yang benar, kita cukup lewatkan
      body = await req.arrayBuffer();

      // Extract Content-Type dari request headers
      const contentTypeHeader = req.headers.get("content-type");
      if (contentTypeHeader) {
        headers["Content-Type"] = contentTypeHeader;
      }
    } else {
      headers["Content-Type"] = "application/json";
      body = await req.text();
    }
  }

  const res = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
