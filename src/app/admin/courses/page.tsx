import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminCoursesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cursos</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Área reservada para gestão de cursos (CRUD). Próximo passo: lista + formulário.
      </CardContent>
    </Card>
  );
}

