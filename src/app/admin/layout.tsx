import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminMobileNav } from "@/components/layout/admin-mobile-nav";

export const metadata = {
  title: "Admin — Paga meu Churrasco",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.role !== "Admin") redirect("/dashboard");

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-64 shrink-0 flex-col h-full">
        <AdminSidebar userName={session.user.name} />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {/* Mobile/Tablet nav */}
        <div className="lg:hidden">
          <AdminMobileNav userName={session.user.name} />
        </div>

        <main className="flex-1 p-4 sm:p-6 max-w-5xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
