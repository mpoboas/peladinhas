import { NextResponse } from "next/server";
import { createServerPocketBase } from "@/lib/pocketbase";

export async function POST() {
  const pb = createServerPocketBase();
  pb.authStore.clear();
  const response = NextResponse.json({ success: true });
  response.headers.set(
    "Set-Cookie",
    pb.authStore.exportToCookie({
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    }),
  );
  return response;
}
