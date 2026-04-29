import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const sessionSchema = z.object({
  id: z.string().optional(),
  sessionDate: z.string().min(10),
  startTime: z.string().min(4),
  endTime: z.string().min(4),
  durationHours: z.coerce.number().positive(),
});

const updateActionSchema = z.object({
  courseId: z.string().min(1),
  trainerId: z.string().min(1),
  clientOrgId: z.string().optional().nullable(),
  roomId: z.string().optional().nullable(),
  startDate: z.string().min(10),
  endDate: z.string().min(10),
  format: z.enum(["PRESENCIAL", "ELEARNING", "BLENDED"]),
  status: z.enum(["DRAFT", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).default("DRAFT"),
  maxTrainees: z.coerce.number().int().positive().optional().nullable(),
  minTrainees: z.coerce.number().int().positive().optional().nullable(),
  sessions: z.array(sessionSchema).min(1),
  deletedSessionIds: z.array(z.string()).optional().default([]),
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

function dateFromInput(value: string) {
  return new Date(`${value}T00:00:00`);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireTenantId();
  if ("error" in auth) return auth.error;

  const json = await req.json().catch(() => null);
  const parsed = updateActionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const tenantId = auth.tenantId;

  const existing = await prisma.trainingAction.findFirst({
    where: { id: params.id, tenantId },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [course, trainer, clientOrg, room] = await Promise.all([
    prisma.course.findFirst({ where: { id: parsed.data.courseId, tenantId }, select: { id: true } }),
    prisma.trainer.findFirst({ where: { id: parsed.data.trainerId, tenantId }, select: { id: true } }),
    parsed.data.clientOrgId
      ? prisma.clientOrg.findFirst({ where: { id: parsed.data.clientOrgId, tenantId }, select: { id: true } })
      : Promise.resolve(null),
    parsed.data.roomId
      ? prisma.room.findFirst({ where: { id: parsed.data.roomId, tenantId }, select: { id: true } })
      : Promise.resolve(null),
  ]);

  if (!course) return NextResponse.json({ error: "Curso inválido." }, { status: 400 });
  if (!trainer) return NextResponse.json({ error: "Formador inválido." }, { status: 400 });
  if (parsed.data.clientOrgId && !clientOrg) return NextResponse.json({ error: "Cliente inválido." }, { status: 400 });
  if (parsed.data.roomId && !room) return NextResponse.json({ error: "Sala inválida." }, { status: 400 });

  await prisma.$transaction(async (tx) => {
    await tx.trainingAction.update({
      where: { id: existing.id },
      data: {
        courseId: course.id,
        clientOrgId: clientOrg?.id ?? null,
        roomId: room?.id ?? null,
        startDate: dateFromInput(parsed.data.startDate),
        endDate: dateFromInput(parsed.data.endDate),
        format: parsed.data.format,
        status: parsed.data.status,
        maxTrainees: parsed.data.maxTrainees ?? null,
        minTrainees: parsed.data.minTrainees ?? null,
      },
    });

    await tx.trainingActionTrainer.deleteMany({ where: { trainingActionId: existing.id } });
    await tx.trainingActionTrainer.create({ data: { trainingActionId: existing.id, trainerId: trainer.id, role: "MAIN" } });

    if (parsed.data.deletedSessionIds.length > 0) {
      await tx.checkIn.deleteMany({ where: { sessionId: { in: parsed.data.deletedSessionIds } } });
      await tx.documentSignature.deleteMany({ where: { sessionId: { in: parsed.data.deletedSessionIds } } });
      await tx.trainingSession.deleteMany({ where: { id: { in: parsed.data.deletedSessionIds }, trainingActionId: existing.id } });
    }

    for (const s of parsed.data.sessions) {
      if (s.id) {
        await tx.trainingSession.update({
          where: { id: s.id },
          data: {
            trainerId: trainer.id,
            sessionDate: dateFromInput(s.sessionDate),
            startTime: s.startTime,
            endTime: s.endTime,
            durationHours: s.durationHours,
          },
        });
      } else {
        await tx.trainingSession.create({
          data: {
            trainingActionId: existing.id,
            trainerId: trainer.id,
            sessionDate: dateFromInput(s.sessionDate),
            startTime: s.startTime,
            endTime: s.endTime,
            durationHours: s.durationHours,
            didacticResources: [],
          },
        });
      }
    }
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireTenantId();
  if ("error" in auth) return auth.error;

  const tenantId = auth.tenantId;

  const action = await prisma.trainingAction.findFirst({
    where: { id: params.id, tenantId },
    select: { id: true, sessions: { select: { id: true } } },
  });
  if (!action) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const sessionIds = action.sessions.map((s) => s.id);

  await prisma.$transaction(async (tx) => {
    if (sessionIds.length > 0) {
      await tx.checkIn.deleteMany({ where: { sessionId: { in: sessionIds } } });
      await tx.documentSignature.deleteMany({ where: { sessionId: { in: sessionIds } } });
      await tx.trainingSession.deleteMany({ where: { id: { in: sessionIds } } });
    }

    await tx.trainingDocument.deleteMany({ where: { trainingActionId: action.id } });
    await tx.occurrence.deleteMany({ where: { trainingActionId: action.id } });
    await tx.enrollment.deleteMany({ where: { trainingActionId: action.id } });
    await tx.trainingActionTrainer.deleteMany({ where: { trainingActionId: action.id } });
    await tx.trainingAction.delete({ where: { id: action.id } });
  });

  return NextResponse.json({ ok: true });
}

