import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

const updateCourseSchema = z.object({
  name: z.string().min(2),
  durationHours: z.coerce.number().positive(),
  format: z.enum(["PRESENCIAL", "ELEARNING", "BLENDED"]),
  status: z.enum(["DRAFT", "PUBLISHED", "FEATURED", "ARCHIVED"]).default("DRAFT"),
  areaId: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  fullDescription: z.string().optional().nullable(),
  objectives: z.string().optional().nullable(),
  targetAudience: z.string().optional().nullable(),
  prerequisites: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
});

async function requireTenantId() {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role as string | undefined;
  const tenantId = (session as any)?.tenantId as string | undefined;

  if (!session || !tenantId) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "TENANT_STAFF"].includes(role ?? "")) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { tenantId };
}

async function ensureUniqueSlug(tenantId: string, baseSlug: string, courseId: string) {
  let slug = baseSlug;
  let i = 2;
  while (true) {
    const exists = await prisma.course.findUnique({
      where: { tenantId_slug: { tenantId, slug } },
      select: { id: true },
    });
    if (!exists || exists.id === courseId) return slug;
    slug = `${baseSlug}-${i}`;
    i += 1;
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireTenantId();
  if ("error" in auth) return auth.error;

  const json = await req.json().catch(() => null);
  const parsed = updateCourseSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const tenantId = auth.tenantId;

  const existing = await prisma.course.findFirst({
    where: { id: params.id, tenantId },
    select: { id: true, publishedAt: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const baseSlug = slugify(parsed.data.name);
  const slug = await ensureUniqueSlug(tenantId, baseSlug || `course-${Date.now()}`, existing.id);

  const publishedAt =
    (parsed.data.status === "PUBLISHED" || parsed.data.status === "FEATURED") && !existing.publishedAt
      ? new Date()
      : existing.publishedAt;

  await prisma.course.update({
    where: { id: existing.id },
    data: {
      name: parsed.data.name,
      slug,
      durationHours: parsed.data.durationHours,
      format: parsed.data.format,
      status: parsed.data.status,
      publishedAt,
      areaId: parsed.data.areaId ?? null,
      shortDescription: parsed.data.shortDescription ?? null,
      fullDescription: parsed.data.fullDescription ?? null,
      objectives: parsed.data.objectives ?? null,
      targetAudience: parsed.data.targetAudience ?? null,
      prerequisites: parsed.data.prerequisites ?? null,
      tags: parsed.data.tags ?? [],
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true });
}

