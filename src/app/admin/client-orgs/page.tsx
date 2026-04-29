import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminClientOrgsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const tenantId = (session as any).tenantId as string | undefined;
  if (!tenantId) redirect("/login");

  const orgs = await prisma.clientOrg.findMany({
    where: { tenantId },
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      name: true,
      nif: true,
      email: true,
      phone: true,
      city: true,
      isActive: true,
    },
    take: 200,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>Entidades Cliente</CardTitle>
          <Button asChild>
            <Link href="/admin/client-orgs/new">Nova entidade</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>NIF</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orgs.map((org) => (
              <TableRow key={org.id}>
                <TableCell className="font-medium">
                  {org.name} {!org.isActive ? <span className="text-muted-foreground">(inativo)</span> : null}
                </TableCell>
                <TableCell className="text-muted-foreground">{org.nif ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{org.email ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{org.phone ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{org.city ?? "—"}</TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/client-orgs/${encodeURIComponent(org.id)}`}>Abrir</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {orgs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-sm text-muted-foreground">
                  Ainda não existem entidades cliente.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
