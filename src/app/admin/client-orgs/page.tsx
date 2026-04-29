import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminClientOrgsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Entidades Cliente</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Área reservada para gestão de empresas cliente (ClientOrgs). Próximo passo: lista + upload de logo.
      </CardContent>
    </Card>
  );
}

