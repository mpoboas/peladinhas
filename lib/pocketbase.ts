import PocketBase from "pocketbase";

const url = (
  process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "http://127.0.0.1:8090"
).replace(/\/+$/, "");

let browserPb: PocketBase | null = null;

export function getPocketBaseUrl() {
  return url;
}

/** Browser singleton (dashboard client helpers). */
export function getPocketBase() {
  if (typeof window === "undefined") {
    return new PocketBase(url);
  }
  if (!browserPb) {
    browserPb = new PocketBase(url);
  }
  return browserPb;
}

/** Fresh server instance; pass request cookie header for authenticated requests. */
export function createServerPocketBase(cookieHeader?: string) {
  const pb = new PocketBase(url);
  if (cookieHeader) {
    pb.authStore.loadFromCookie(cookieHeader);
  }
  return pb;
}

export const PB_AUTH_COOKIE = "pb_auth";
