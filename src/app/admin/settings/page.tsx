import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const tenantId = (session as any).tenantId as string | undefined;
  if (!tenantId) redirect("/login");

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      name: true,
      slug: true,
      domain: true,
      platformName: true,
      primaryColor: true,
      secondaryColor: true,
      accentColor: true,
      emailFromName: true,
      emailFromAddress: true,
      logoUrl: true,
      faviconUrl: true,
      cssOverride: true,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Visualização das configurações atuais do tenant. Próximo passo: formulário de edição com preview.
        </div>

        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="w-56 text-muted-foreground">Nome</TableCell>
              <TableCell className="font-medium">{tenant?.name ?? "—"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="w-56 text-muted-foreground">Slug</TableCell>
              <TableCell className="font-medium">{tenant?.slug ?? "—"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="w-56 text-muted-foreground">Domínio</TableCell>
              <TableCell className="font-medium">{tenant?.domain ?? "—"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="w-56 text-muted-foreground">Nome da plataforma</TableCell>
              <TableCell className="font-medium">{tenant?.platformName ?? "—"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="w-56 text-muted-foreground">Cores</TableCell>
              <TableCell className="font-medium">
                {tenant?.primaryColor ?? "—"} / {tenant?.secondaryColor ?? "—"} / {tenant?.accentColor ?? "—"}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="w-56 text-muted-foreground">Email from</TableCell>
              <TableCell className="font-medium">
                {tenant?.emailFromName ?? "—"} {tenant?.emailFromAddress ? `<${tenant.emailFromAddress}>` : ""}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="w-56 text-muted-foreground">Logo</TableCell>
              <TableCell className="font-medium">{tenant?.logoUrl ?? "—"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="w-56 text-muted-foreground">Favicon</TableCell>
              <TableCell className="font-medium">{tenant?.faviconUrl ?? "—"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="w-56 text-muted-foreground">CSS override</TableCell>
              <TableCell className="font-medium">{tenant?.cssOverride ? "Definido" : "—"}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
