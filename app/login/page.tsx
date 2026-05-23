"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, Suspense } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { PageContainer } from "@/components/layout/PageContainer";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erro ao entrar.");
      return;
    }
    router.push(redirect);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-sm space-y-5">
      <Field label="Email">
        <Input
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
        />
      </Field>
      <Field label="Password">
        <Input
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </Field>
      {error && (
        <p className="rounded-lg bg-red-950/50 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "A entrar…" : "Entrar"}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <PageContainer>
      <header className="mb-8 text-center">
        <h1 className="font-display text-4xl text-text-primary">Admin</h1>
        <p className="mt-2 text-base text-text-secondary">
          Entra para gerir peladinhas e resultados.
        </p>
      </header>
      <Suspense>
        <LoginForm />
      </Suspense>
    </PageContainer>
  );
}
