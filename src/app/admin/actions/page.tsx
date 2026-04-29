import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminActionsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const tenantId = (session as any).tenantId as string | undefined;
  if (!tenantId) redirect("/login");

  const actions = await prisma.trainingAction.findMany({
    where: { tenantId },
    orderBy: [{ startDate: "desc" }],
    select: {
      id: true,
      status: true,
      startDate: true,
      endDate: true,
      course: { select: { name: true } },
      clientOrg: { select: { name: true } },
      sessions: { select: { id: true } },
    },
    take: 200,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>Ações de Formação</CardTitle>
          <Button asChild>
            <Link href="/admin/actions/new">Nova ação</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Curso</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Fim</TableHead>
              <TableHead>Sessões</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actions.map((action) => (
              <TableRow key={action.id}>
                <TableCell className="font-medium">{action.course.name}</TableCell>
                <TableCell className="text-muted-foreground">{action.clientOrg?.name ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">
                  {action.startDate.toLocaleDateString("pt-PT")}
                </TableCell>
                <TableCell className="text-muted-foreground">{action.endDate.toLocaleDateString("pt-PT")}</TableCell>
                <TableCell className="text-muted-foreground">{action.sessions.length}</TableCell>
                <TableCell>
                  <Badge variant={action.status === "SCHEDULED" || action.status === "IN_PROGRESS" ? "default" : "secondary"}>
                    {action.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/actions/${encodeURIComponent(action.id)}`}>Abrir</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {actions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-sm text-muted-foreground">
                  Ainda não existem ações.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
