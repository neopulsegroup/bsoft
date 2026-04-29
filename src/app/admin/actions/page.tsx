import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminActionsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações de Formação</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Área reservada para gestão de ações/sessões e inscrições. Próximo passo: lista + estados.
      </CardContent>
    </Card>
  );
}

