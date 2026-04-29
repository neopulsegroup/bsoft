import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Academia Digital</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Ambiente de produção: {process.env.NEXT_PUBLIC_APP_URL}
          </div>
          <Button asChild className="w-full">
            <Link href="/login">Entrar</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
