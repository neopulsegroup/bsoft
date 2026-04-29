import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const tenantId = (session as any).tenantId as string | undefined;
  if (!tenantId) redirect("/login");

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { slug: true } });
  const tenantSlug = tenant?.slug ?? "oportoforte";

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] w-full">
      <AdminSidebar tenantSlug={tenantSlug} />
      <div className="flex w-full flex-1 flex-col">
        <div className="mx-auto w-full max-w-6xl px-4 py-8">{children}</div>
      </div>
    </div>
  );
}
