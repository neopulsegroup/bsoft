import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type CourseCardProps = {
  tenantSlug: string;
  course: {
    slug: string;
    name: string;
    durationHours: number;
    format: string;
    status: string;
    area?: { name: string } | null;
  };
};

export function CourseCard({ tenantSlug, course }: CourseCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{course.format}</Badge>
          {course.status === "FEATURED" ? <Badge>Em Destaque</Badge> : null}
        </div>
        <CardTitle className="text-base">{course.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <div>Duração: {course.durationHours}h</div>
        <div>Área: {course.area?.name ?? "—"}</div>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button asChild className="w-full">
          <Link href={`/${tenantSlug}/catalog/${course.slug}`}>Saber mais</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

