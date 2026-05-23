import { cookies } from "next/headers";
import { createServerPocketBase, PB_AUTH_COOKIE } from "./pocketbase";

export async function getAuthenticatedPocketBase() {
  const cookieStore = await cookies();
  const header = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const pb = createServerPocketBase(header);
  if (!pb.authStore.isValid) {
    throw new Error("Not authenticated");
  }
  return pb;
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const header = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  if (!header) return false;
  const pb = createServerPocketBase(header);
  return pb.authStore.isValid;
}

export async function getAuthCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(PB_AUTH_COOKIE);
  if (!cookie) return "";
  return `${PB_AUTH_COOKIE}=${cookie.value}`;
}
