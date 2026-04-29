"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type AdminSidebarProps = {
  tenantSlug: string;
};

const items = (tenantSlug: string) => [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/courses", label: "Cursos" },
  { href: "/admin/actions", label: "Ações" },
  { href: "/admin/client-orgs", label: "Entidades" },
  { href: "/admin/settings", label: "Configurações" },
  { href: `/${tenantSlug}/catalog`, label: "Catálogo Público" },
];

export function AdminSidebar({ tenantSlug }: AdminSidebarProps) {
  const pathname = usePathname();
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-background md:block">
      <div className="flex h-14 items-center px-4 font-semibold">Admin</div>
      <div className="space-y-1 px-2 pb-4">
        {items(tenantSlug).map((item) => {
          const active = pathname === item.href || (item.href.startsWith("/admin") && pathname.startsWith(item.href));
          return (
            <Button
              key={item.href}
              asChild
              variant={active ? "secondary" : "ghost"}
              className={cn("w-full justify-start")}
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          );
        })}
      </div>
    </aside>
  );
}
