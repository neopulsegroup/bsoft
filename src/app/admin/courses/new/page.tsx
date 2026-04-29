import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CourseForm } from "../CourseForm";

export default async function NewCoursePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const tenantId = (session as any).tenantId as string | undefined;
  if (!tenantId) redirect("/login");

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { slug: true } });
  const tenantSlug = tenant?.slug ?? "oportoforte";

  const areas = await prisma.trainingArea.findMany({
    where: { isActive: true, catalogVisible: true },
    orderBy: [{ name: "asc" }],
    select: { id: true, name: true },
    take: 500,
  });

  return <CourseForm mode="create" tenantSlug={tenantSlug} areas={areas} />;
}

