import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { SignOutButton } from "./SignOutButton";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Dashboard</CardTitle>
        <SignOutButton />
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <span className="font-medium">Utilizador:</span> {session.user?.email ?? "-"}
        </div>
        <div>
          <span className="font-medium">Tenant:</span> {(session as any).tenantId ?? "-"}
        </div>
        <div>
          <span className="font-medium">Role:</span> {(session as any).role ?? "-"}
        </div>
      </CardContent>
    </Card>
  );
}
