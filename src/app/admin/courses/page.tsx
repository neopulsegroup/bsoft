import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminCoursesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const tenantId = (session as any).tenantId as string | undefined;
  if (!tenantId) redirect("/login");

  const courses = await prisma.course.findMany({
    where: { tenantId },
    orderBy: [{ status: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      format: true,
      durationHours: true,
      publishedAt: true,
      area: { select: { name: true } },
    },
    take: 200,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>Cursos</CardTitle>
          <Button asChild>
            <Link href="/admin/courses/new">Novo curso</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Curso</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Formato</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.name}</TableCell>
                <TableCell className="text-muted-foreground">{course.area?.name ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{course.format}</TableCell>
                <TableCell className="text-muted-foreground">{course.durationHours}h</TableCell>
                <TableCell>
                  <Badge variant={course.status === "PUBLISHED" || course.status === "FEATURED" ? "default" : "secondary"}>
                    {course.status}
                  </Badge>
                  {course.publishedAt ? (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Publicado: {course.publishedAt.toLocaleDateString("pt-PT")}
                    </div>
                  ) : null}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/courses/${course.id}`}>Abrir</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-sm text-muted-foreground">
                  Ainda não existem cursos.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
