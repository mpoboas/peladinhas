import { NextResponse } from "next/server";
import { createServerPocketBase } from "@/lib/pocketbase";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e password são obrigatórios." },
        { status: 400 },
      );
    }

    const pb = createServerPocketBase();
    await pb.collection("users").authWithPassword(email, password);

    const response = NextResponse.json({ success: true });
    response.headers.set(
      "Set-Cookie",
      pb.authStore.exportToCookie({
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      }),
    );
    return response;
  } catch {
    return NextResponse.json(
      { error: "Credenciais inválidas." },
      { status: 401 },
    );
  }
}
