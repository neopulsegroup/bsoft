import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActionForm } from "../ActionForm";

function toDateInput(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function EditActionPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const tenantId = (session as any).tenantId as string | undefined;
  if (!tenantId) redirect("/login");

  const [courses, trainers, clientOrgs, rooms, action] = await Promise.all([
    prisma.course.findMany({
      where: { tenantId },
      orderBy: [{ name: "asc" }],
      select: { id: true, name: true },
      take: 500,
    }),
    prisma.trainer.findMany({
      where: { tenantId },
      orderBy: [{ user: { firstName: "asc" } }],
      select: { id: true, user: { select: { firstName: true, lastName: true } } },
      take: 200,
    }),
    prisma.clientOrg.findMany({
      where: { tenantId },
      orderBy: [{ name: "asc" }],
      select: { id: true, name: true },
      take: 500,
    }),
    prisma.room.findMany({
      where: { tenantId },
      orderBy: [{ name: "asc" }],
      select: { id: true, name: true },
      take: 200,
    }),
    prisma.trainingAction.findFirst({
      where: { id: params.id, tenantId },
      select: {
        id: true,
        courseId: true,
        clientOrgId: true,
        roomId: true,
        startDate: true,
        endDate: true,
        format: true,
        status: true,
        maxTrainees: true,
        minTrainees: true,
        trainers: { select: { trainerId: true, role: true } },
        sessions: {
          orderBy: [{ sessionDate: "asc" }],
          select: { id: true, sessionDate: true, startTime: true, endTime: true, durationHours: true },
        },
      },
    }),
  ]);

  if (!action) notFound();

  const mainTrainerId = action.trainers.find((t) => t.role === "MAIN")?.trainerId ?? trainers[0]?.id ?? "";

  return (
    <ActionForm
      mode="edit"
      actionId={action.id}
      courses={courses}
      trainers={trainers.map((t) => ({ id: t.id, name: `${t.user.firstName} ${t.user.lastName}` }))}
      clientOrgs={clientOrgs}
      rooms={rooms}
      initialValues={{
        courseId: action.courseId,
        trainerId: mainTrainerId,
        clientOrgId: action.clientOrgId,
        roomId: action.roomId,
        startDate: toDateInput(action.startDate),
        endDate: toDateInput(action.endDate),
        format: action.format,
        status: action.status,
        maxTrainees: action.maxTrainees ?? "",
        minTrainees: action.minTrainees ?? "",
        sessions: action.sessions.map((s) => ({
          id: s.id,
          sessionDate: toDateInput(s.sessionDate),
          startTime: s.startTime,
          endTime: s.endTime,
          durationHours: s.durationHours,
        })),
      }}
    />
  );
}

