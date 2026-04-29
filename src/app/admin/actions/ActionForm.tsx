"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type TrainingFormat = "PRESENCIAL" | "ELEARNING" | "BLENDED";
type TrainingStatus = "DRAFT" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

type Option = { id: string; name: string };

type SessionRow = {
  id?: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  durationHours: number;
};

type ActionFormValues = {
  courseId: string;
  trainerId: string;
  clientOrgId: string | null;
  roomId: string | null;
  startDate: string;
  endDate: string;
  format: TrainingFormat;
  status: TrainingStatus;
  maxTrainees: number | "";
  minTrainees: number | "";
  sessions: SessionRow[];
};

type ActionFormProps = {
  mode: "create" | "edit";
  actionId?: string;
  courses: Option[];
  trainers: Option[];
  clientOrgs: Option[];
  rooms: Option[];
  initialValues?: Partial<ActionFormValues>;
};

export function ActionForm({ mode, actionId, courses, trainers, clientOrgs, rooms, initialValues }: ActionFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletedSessionIds, setDeletedSessionIds] = useState<string[]>([]);

  const defaults: ActionFormValues = useMemo(
    () => ({
      courseId: initialValues?.courseId ?? courses[0]?.id ?? "",
      trainerId: initialValues?.trainerId ?? trainers[0]?.id ?? "",
      clientOrgId: initialValues?.clientOrgId ?? null,
      roomId: initialValues?.roomId ?? null,
      startDate: initialValues?.startDate ?? new Date().toISOString().slice(0, 10),
      endDate: initialValues?.endDate ?? new Date().toISOString().slice(0, 10),
      format: (initialValues?.format ?? "PRESENCIAL") as TrainingFormat,
      status: (initialValues?.status ?? "DRAFT") as TrainingStatus,
      maxTrainees: initialValues?.maxTrainees ?? "",
      minTrainees: initialValues?.minTrainees ?? "",
      sessions:
        initialValues?.sessions ??
        [
          {
            sessionDate: new Date().toISOString().slice(0, 10),
            startTime: "09:00",
            endTime: "17:00",
            durationHours: 8,
          },
        ],
    }),
    [courses, initialValues, trainers],
  );

  const [values, setValues] = useState<ActionFormValues>(defaults);

  function update<K extends keyof ActionFormValues>(key: K, value: ActionFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function updateSession(index: number, patch: Partial<SessionRow>) {
    setValues((v) => ({
      ...v,
      sessions: v.sessions.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));
  }

  function addSession() {
    setValues((v) => ({
      ...v,
      sessions: [
        ...v.sessions,
        {
          sessionDate: v.sessions[v.sessions.length - 1]?.sessionDate ?? new Date().toISOString().slice(0, 10),
          startTime: "09:00",
          endTime: "17:00",
          durationHours: 8,
        },
      ],
    }));
  }

  function removeSession(index: number) {
    setValues((v) => {
      const s = v.sessions[index];
      if (s?.id) setDeletedSessionIds((prev) => [...prev, s.id!]);
      const next = v.sessions.filter((_, i) => i !== index);
      return { ...v, sessions: next.length > 0 ? next : v.sessions };
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        courseId: values.courseId,
        trainerId: values.trainerId,
        clientOrgId: values.clientOrgId || null,
        roomId: values.roomId || null,
        startDate: values.startDate,
        endDate: values.endDate,
        format: values.format,
        status: values.status,
        maxTrainees: values.maxTrainees === "" ? null : Number(values.maxTrainees),
        minTrainees: values.minTrainees === "" ? null : Number(values.minTrainees),
        sessions: values.sessions.map((s) => ({
          id: s.id,
          sessionDate: s.sessionDate,
          startTime: s.startTime,
          endTime: s.endTime,
          durationHours: Number(s.durationHours),
        })),
        deletedSessionIds,
      };

      const url = mode === "create" ? "/api/admin/actions" : `/api/admin/actions/${encodeURIComponent(actionId ?? "")}`;
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
        const id = data?.id as string | undefined;
        if (id) {
          toast.success("Ação criada.");
          router.push(`/admin/actions/${id}`);
          router.refresh();
          return;
        }
      }

      toast.success("Alterações guardadas.");
      setDeletedSessionIds([]);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  async function onDelete() {
    if (mode !== "edit" || !actionId) return;
    const ok = window.confirm("Apagar esta ação e todas as sessões associadas? Esta ação não pode ser desfeita.");
    if (!ok) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/actions/${encodeURIComponent(actionId)}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error ?? "Falha ao apagar.");
        return;
      }
      toast.success("Ação apagada.");
      router.push("/admin/actions");
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{mode === "create" ? "Nova ação" : "Editar ação"}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <div className="text-sm font-medium">Curso</div>
            <Select value={values.courseId} onValueChange={(v) => update("courseId", v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecionar curso" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Formador</div>
            <Select value={values.trainerId} onValueChange={(v) => update("trainerId", v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecionar formador" />
              </SelectTrigger>
              <SelectContent>
                {trainers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Estado</div>
            <Select value={values.status} onValueChange={(v) => update("status", v as TrainingStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">DRAFT</SelectItem>
                <SelectItem value="SCHEDULED">SCHEDULED</SelectItem>
                <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                <SelectItem value="CANCELLED">CANCELLED</SelectItem>
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
            <div className="text-sm font-medium">Início</div>
            <Input type="date" value={values.startDate} onChange={(e) => update("startDate", e.target.value)} required />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Fim</div>
            <Input type="date" value={values.endDate} onChange={(e) => update("endDate", e.target.value)} required />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Cliente</div>
            <Select value={values.clientOrgId ?? "none"} onValueChange={(v) => update("clientOrgId", v === "none" ? null : v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecionar cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                {clientOrgs.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Sala</div>
            <Select value={values.roomId ?? "none"} onValueChange={(v) => update("roomId", v === "none" ? null : v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecionar sala" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                {rooms.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Mín. formandos</div>
            <Input
              type="number"
              min={1}
              value={values.minTrainees === "" ? "" : String(values.minTrainees)}
              onChange={(e) => update("minTrainees", e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Máx. formandos</div>
            <Input
              type="number"
              min={1}
              value={values.maxTrainees === "" ? "" : String(values.maxTrainees)}
              onChange={(e) => update("maxTrainees", e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Sessões</CardTitle>
            <Button type="button" variant="secondary" onClick={addSession}>
              Adicionar sessão
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Fim</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {values.sessions.map((s, idx) => (
                <TableRow key={s.id ?? idx}>
                  <TableCell>
                    <Input
                      type="date"
                      value={s.sessionDate}
                      onChange={(e) => updateSession(idx, { sessionDate: e.target.value })}
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="time"
                      value={s.startTime}
                      onChange={(e) => updateSession(idx, { startTime: e.target.value })}
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="time"
                      value={s.endTime}
                      onChange={(e) => updateSession(idx, { endTime: e.target.value })}
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0.5}
                      step={0.5}
                      value={String(s.durationHours)}
                      onChange={(e) => updateSession(idx, { durationHours: Number(e.target.value) })}
                      required
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button type="button" variant="outline" size="sm" onClick={() => removeSession(idx)} disabled={values.sessions.length <= 1}>
                      Remover
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="outline" disabled={isSaving || isDeleting}>
            <a href="/admin/actions">Voltar</a>
          </Button>
          {mode === "edit" ? (
            <Button type="button" variant="destructive" onClick={onDelete} disabled={isSaving || isDeleting}>
              {isDeleting ? "A apagar..." : "Apagar"}
            </Button>
          ) : null}
        </div>
        <Button type="submit" disabled={isSaving || isDeleting}>
          {isSaving ? "A guardar..." : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
