"use client";

export function LogoutButton() {
  return (
    <button
      type="button"
      className="min-h-10 rounded-lg px-3 text-sm font-medium text-text-secondary hover:bg-surface hover:text-gold"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/";
      }}
    >
      Sair
    </button>
  );
}
