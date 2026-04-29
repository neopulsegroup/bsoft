import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CourseForm } from "../CourseForm";

export default async function EditCoursePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const tenantId = (session as any).tenantId as string | undefined;
  if (!tenantId) redirect("/login");

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { slug: true } });
  const tenantSlug = tenant?.slug ?? "oportoforte";

  const [areas, course] = await Promise.all([
    prisma.trainingArea.findMany({
      where: { isActive: true, catalogVisible: true },
      orderBy: [{ name: "asc" }],
      select: { id: true, name: true },
      take: 500,
    }),
    prisma.course.findFirst({
      where: { id: params.id, tenantId },
      select: {
        id: true,
        name: true,
        durationHours: true,
        format: true,
        status: true,
        areaId: true,
        shortDescription: true,
        fullDescription: true,
        objectives: true,
        targetAudience: true,
        prerequisites: true,
        tags: true,
      },
    }),
  ]);

  if (!course) notFound();

  return (
    <CourseForm
      mode="edit"
      courseId={course.id}
      tenantSlug={tenantSlug}
      areas={areas}
      initialValues={{
        name: course.name,
        durationHours: course.durationHours,
        format: course.format,
        status: course.status,
        areaId: course.areaId,
        shortDescription: course.shortDescription ?? "",
        fullDescription: course.fullDescription ?? "",
        objectives: course.objectives ?? "",
        targetAudience: course.targetAudience ?? "",
        prerequisites: course.prerequisites ?? "",
        tags: (course.tags ?? []).join(", "),
      }}
    />
  );
}

