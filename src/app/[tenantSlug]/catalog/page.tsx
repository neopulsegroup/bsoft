import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CourseCard } from "@/components/catalog/CourseCard";

type PageProps = {
  params: { tenantSlug: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: params.tenantSlug },
    select: { platformName: true, name: true },
  });

  if (!tenant) return {};

  const title = `${tenant.platformName ?? "Academia Digital"} — Catálogo`;
  const description = `Catálogo público de cursos da entidade ${tenant.name}.`;

  return { title, description };
}

export default async function CatalogPage({ params }: PageProps) {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: params.tenantSlug },
    select: { id: true, name: true, platformName: true, isActive: true },
  });

  if (!tenant || !tenant.isActive) notFound();

  const courses = await prisma.course.findMany({
    where: {
      tenantId: tenant.id,
      status: { in: ["PUBLISHED", "FEATURED"] },
      OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
    },
    orderBy: [{ status: "desc" }, { publishedAt: "desc" }, { name: "asc" }],
    select: {
      slug: true,
      name: true,
      durationHours: true,
      format: true,
      status: true,
      area: { select: { name: true } },
    },
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {tenant.platformName ?? "Academia Digital"} — Catálogo
        </h1>
        <div className="text-sm text-muted-foreground">{tenant.name}</div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.slug} tenantSlug={params.tenantSlug} course={course} />
        ))}
      </div>

      {courses.length === 0 ? (
        <div className="mt-10 text-sm text-muted-foreground">Sem cursos publicados neste momento.</div>
      ) : null}
    </div>
  );
}

