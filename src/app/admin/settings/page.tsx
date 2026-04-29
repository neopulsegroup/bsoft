import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Área reservada para branding do tenant, email sender e domínio. Próximo passo: formulário com preview.
      </CardContent>
    </Card>
  );
}

