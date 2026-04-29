import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PageProps = {
  params: { tenantSlug: string; courseSlug: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const course = await prisma.course.findFirst({
    where: { tenant: { slug: params.tenantSlug }, slug: params.courseSlug, status: { in: ["PUBLISHED", "FEATURED"] } },
    select: { name: true, shortDescription: true, seoTitle: true, seoDescription: true },
  });

  if (!course) return {};

  return {
    title: course.seoTitle ?? course.name,
    description: course.seoDescription ?? course.shortDescription ?? undefined,
  };
}

export default async function CoursePage({ params }: PageProps) {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: params.tenantSlug },
    select: { id: true, name: true, platformName: true, isActive: true },
  });

  if (!tenant || !tenant.isActive) notFound();

  const course = await prisma.course.findFirst({
    where: { tenantId: tenant.id, slug: params.courseSlug, status: { in: ["PUBLISHED", "FEATURED"] } },
    select: {
      name: true,
      durationHours: true,
      format: true,
      shortDescription: true,
      fullDescription: true,
      objectives: true,
      targetAudience: true,
      prerequisites: true,
      area: { select: { name: true } },
    },
  });

  if (!course) notFound();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="mb-6">
        <Button asChild variant="outline">
          <Link href={`/${params.tenantSlug}/catalog`}>Voltar ao catálogo</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{course.name}</CardTitle>
          <div className="text-sm text-muted-foreground">
            {course.area?.name ?? "—"} · {course.format} · {course.durationHours}h
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {course.shortDescription ? <p className="text-muted-foreground">{course.shortDescription}</p> : null}
          {course.fullDescription ? (
            <div className="space-y-2">
              <div className="font-medium">Descrição</div>
              <div className="text-muted-foreground whitespace-pre-wrap">{course.fullDescription}</div>
            </div>
          ) : null}
          {course.objectives ? (
            <div className="space-y-2">
              <div className="font-medium">Objetivos</div>
              <div className="text-muted-foreground whitespace-pre-wrap">{course.objectives}</div>
            </div>
          ) : null}
          {course.targetAudience ? (
            <div className="space-y-2">
              <div className="font-medium">Destinatários</div>
              <div className="text-muted-foreground whitespace-pre-wrap">{course.targetAudience}</div>
            </div>
          ) : null}
          {course.prerequisites ? (
            <div className="space-y-2">
              <div className="font-medium">Pré-requisitos</div>
              <div className="text-muted-foreground whitespace-pre-wrap">{course.prerequisites}</div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

