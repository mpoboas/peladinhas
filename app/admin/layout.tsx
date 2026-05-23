import { DashboardNav } from "@/components/layout/DashboardNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-10 min-h-screen bg-navy">
      <DashboardNav />
      <div className="mx-auto max-w-lg px-4 py-5 md:max-w-2xl">
        {children}
      </div>
    </div>
  );
}
