"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type CourseStatus = "DRAFT" | "PUBLISHED" | "FEATURED" | "ARCHIVED";
type TrainingFormat = "PRESENCIAL" | "ELEARNING" | "BLENDED";

type AreaOption = { id: string; name: string };

type CourseFormValues = {
  name: string;
  durationHours: number;
  format: TrainingFormat;
  status: CourseStatus;
  areaId: string | null;
  shortDescription: string;
  fullDescription: string;
  objectives: string;
  targetAudience: string;
  prerequisites: string;
  tags: string;
};

type CourseFormProps = {
  mode: "create" | "edit";
  courseId?: string;
  tenantSlug: string;
  areas: AreaOption[];
  initialValues?: Partial<CourseFormValues>;
};

export function CourseForm({ mode, courseId, tenantSlug, areas, initialValues }: CourseFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const defaults: CourseFormValues = useMemo(
    () => ({
      name: initialValues?.name ?? "",
      durationHours: initialValues?.durationHours ?? 8,
      format: (initialValues?.format ?? "PRESENCIAL") as TrainingFormat,
      status: (initialValues?.status ?? "DRAFT") as CourseStatus,
      areaId: initialValues?.areaId ?? null,
      shortDescription: initialValues?.shortDescription ?? "",
      fullDescription: initialValues?.fullDescription ?? "",
      objectives: initialValues?.objectives ?? "",
      targetAudience: initialValues?.targetAudience ?? "",
      prerequisites: initialValues?.prerequisites ?? "",
      tags: initialValues?.tags ?? "",
    }),
    [initialValues],
  );

  const [values, setValues] = useState<CourseFormValues>(defaults);

  function update<K extends keyof CourseFormValues>(key: K, value: CourseFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        name: values.name.trim(),
        durationHours: Number(values.durationHours),
        format: values.format,
        status: values.status,
        areaId: values.areaId || null,
        shortDescription: values.shortDescription.trim() || null,
        fullDescription: values.fullDescription.trim() || null,
        objectives: values.objectives.trim() || null,
        targetAudience: values.targetAudience.trim() || null,
        prerequisites: values.prerequisites.trim() || null,
        tags: values.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const url =
        mode === "create" ? "/api/admin/courses" : `/api/admin/courses/${encodeURIComponent(courseId ?? "")}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error ?? "Falha ao guardar.");
        return;
      }

      if (mode === "create") {
        const newId = data?.id as string | undefined;
        if (newId) {
          toast.success("Curso criado.");
          router.push(`/admin/courses/${newId}`);
          router.refresh();
          return;
        }
      }

      toast.success("Alterações guardadas.");
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  async function onDelete() {
    if (mode !== "edit" || !courseId) return;
    const ok = window.confirm("Apagar este curso? Esta ação não pode ser desfeita.");
    if (!ok) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/courses/${encodeURIComponent(courseId)}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error ?? "Falha ao apagar.");
        return;
      }

      toast.success("Curso apagado.");
      router.push("/admin/courses");
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{mode === "create" ? "Novo curso" : "Editar curso"}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <div className="text-sm font-medium">Nome</div>
            <Input value={values.name} onChange={(e) => update("name", e.target.value)} required />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Estado</div>
            <Select value={values.status} onValueChange={(v) => update("status", v as CourseStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">DRAFT</SelectItem>
                <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
                <SelectItem value="FEATURED">FEATURED</SelectItem>
                <SelectItem value="ARCHIVED">ARCHIVED</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Formato</div>
            <Select value={values.format} onValueChange={(v) => update("format", v as TrainingFormat)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecionar formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRESENCIAL">PRESENCIAL</SelectItem>
                <SelectItem value="ELEARNING">ELEARNING</SelectItem>
                <SelectItem value="BLENDED">BLENDED</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Área</div>
            <Select value={values.areaId ?? "none"} onValueChange={(v) => update("areaId", v === "none" ? null : v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecionar área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                {areas.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Duração (horas)</div>
            <Input
              type="number"
              min={1}
              step={0.5}
              value={String(values.durationHours)}
              onChange={(e) => update("durationHours", Number(e.target.value))}
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="text-sm font-medium">Tags (separadas por vírgula)</div>
            <Input value={values.tags} onChange={(e) => update("tags", e.target.value)} placeholder="ex: excel, liderança" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conteúdo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Descrição curta</div>
            <Textarea value={values.shortDescription} onChange={(e) => update("shortDescription", e.target.value)} />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Descrição completa</div>
            <Textarea value={values.fullDescription} onChange={(e) => update("fullDescription", e.target.value)} rows={8} />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Objetivos</div>
            <Textarea value={values.objectives} onChange={(e) => update("objectives", e.target.value)} rows={6} />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Destinatários</div>
            <Textarea value={values.targetAudience} onChange={(e) => update("targetAudience", e.target.value)} rows={4} />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Pré-requisitos</div>
            <Textarea value={values.prerequisites} onChange={(e) => update("prerequisites", e.target.value)} rows={4} />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="outline" disabled={isSaving || isDeleting}>
          <a href="/admin/courses">Voltar</a>
          </Button>
          {mode === "edit" ? (
            <Button type="button" variant="destructive" onClick={onDelete} disabled={isSaving || isDeleting}>
              {isDeleting ? "A apagar..." : "Apagar"}
            </Button>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="secondary" disabled={isSaving || isDeleting}>
            <a href={`/${tenantSlug}/catalog`}>Ver catálogo</a>
          </Button>
          <Button type="submit" disabled={isSaving || isDeleting}>
            {isSaving ? "A guardar..." : "Guardar"}
          </Button>
        </div>
      </div>
    </form>
  );
}
