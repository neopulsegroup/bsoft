import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./UserMenu";

export async function AppHeader() {
  const session = await getServerSession(authOptions);
  const tenantId = (session as any)?.tenantId as string | undefined;

  const tenantSlug = tenantId
    ? (
        await prisma.tenant.findUnique({
          where: { id: tenantId },
          select: { slug: true },
        })
      )?.slug
    : null;

  const catalogHref = `/${tenantSlug ?? "oportoforte"}/catalog`;

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="font-semibold tracking-tight">
          Academia Digital
        </Link>

        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href={catalogHref}>Catálogo</Link>
          </Button>
          {session ? <UserMenu email={session.user?.email} tenantSlug={tenantSlug} /> : <Button asChild><Link href="/login">Entrar</Link></Button>}
        </nav>
      </div>
    </header>
  );
}

