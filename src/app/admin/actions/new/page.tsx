import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActionForm } from "../ActionForm";

export default async function NewActionPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const tenantId = (session as any).tenantId as string | undefined;
  if (!tenantId) redirect("/login");

  const [courses, trainers, clientOrgs, rooms] = await Promise.all([
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
  ]);

  return (
    <ActionForm
      mode="create"
      courses={courses}
      trainers={trainers.map((t) => ({ id: t.id, name: `${t.user.firstName} ${t.user.lastName}` }))}
      clientOrgs={clientOrgs}
      rooms={rooms}
    />
  );
}

