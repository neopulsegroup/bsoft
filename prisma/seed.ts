import bcrypt from "bcryptjs";
import { CourseStatus, PrismaClient, TrainingFormat, TrainingStatus, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

type AreaDef = { id: string; name: string; parentId?: string };

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: "oportoforte" },
    update: {
      name: "Grupo Oporto Forte",
      isActive: true,
    },
    create: {
      name: "Grupo Oporto Forte",
      slug: "oportoforte",
      isActive: true,
      platformName: "Academia Digital",
      primaryColor: "#0B2447",
      secondaryColor: "#1566C0",
      accentColor: "#C9A520",
    },
  });

  const adminEmail = "admin@oportoforte.com";
  const adminPassword = "Admin123!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      tenantId: tenant.id,
      role: UserRole.TENANT_ADMIN,
      isActive: true,
      passwordHash,
      firstName: "Admin",
      lastName: "Oporto Forte",
    },
    create: {
      tenantId: tenant.id,
      email: adminEmail,
      role: UserRole.TENANT_ADMIN,
      isActive: true,
      passwordHash,
      firstName: "Admin",
      lastName: "Oporto Forte",
    },
  });

  const areaDefs: AreaDef[] = [
    { id: "area:administracao-gestao", name: "Administração e Gestão" },
    { id: "area:gestao-equipas", name: "Gestão de Equipas", parentId: "area:administracao-gestao" },
    { id: "area:gestao-projetos", name: "Gestão de Projetos", parentId: "area:administracao-gestao" },
    { id: "area:recursos-humanos", name: "Recursos Humanos", parentId: "area:administracao-gestao" },
    { id: "area:contabilidade-financas", name: "Contabilidade e Finanças" },
    { id: "area:contabilidade", name: "Contabilidade", parentId: "area:contabilidade-financas" },
    { id: "area:financas", name: "Finanças", parentId: "area:contabilidade-financas" },
    { id: "area:marketing-vendas", name: "Marketing e Vendas" },
    { id: "area:marketing-digital", name: "Marketing Digital", parentId: "area:marketing-vendas" },
    { id: "area:vendas", name: "Vendas", parentId: "area:marketing-vendas" },
    { id: "area:tecnologia", name: "Tecnologia" },
    { id: "area:informatica", name: "Informática", parentId: "area:tecnologia" },
    { id: "area:programacao", name: "Programação", parentId: "area:tecnologia" },
    { id: "area:redes", name: "Redes e Sistemas", parentId: "area:tecnologia" },
    { id: "area:ciberseguranca", name: "Cibersegurança", parentId: "area:tecnologia" },
    { id: "area:saude-bem-estar", name: "Saúde e Bem-Estar" },
    { id: "area:saude-ocupacional", name: "Saúde Ocupacional", parentId: "area:saude-bem-estar" },
    { id: "area:primeiros-socorros", name: "Primeiros Socorros", parentId: "area:saude-bem-estar" },
    { id: "area:ergonomia", name: "Ergonomia", parentId: "area:saude-bem-estar" },
    { id: "area:seguranca-trabalho", name: "Segurança no Trabalho" },
    { id: "area:higiene-seguranca", name: "Higiene e Segurança", parentId: "area:seguranca-trabalho" },
    { id: "area:qualidade-ambiente", name: "Qualidade e Ambiente" },
    { id: "area:qualidade", name: "Qualidade", parentId: "area:qualidade-ambiente" },
    { id: "area:ambiente", name: "Ambiente", parentId: "area:qualidade-ambiente" },
    { id: "area:logistica", name: "Logística" },
    { id: "area:logistica-armazem", name: "Logística e Armazém", parentId: "area:logistica" },
    { id: "area:linguas", name: "Línguas" },
    { id: "area:ingles", name: "Inglês", parentId: "area:linguas" },
    { id: "area:soft-skills", name: "Competências Comportamentais" },
    { id: "area:comunicacao", name: "Comunicação", parentId: "area:soft-skills" },
    { id: "area:lideranca", name: "Liderança", parentId: "area:soft-skills" },
  ];

  for (const area of areaDefs) {
    await prisma.trainingArea.upsert({
      where: { id: area.id },
      update: {
        name: area.name,
        parentId: area.parentId ?? null,
        isActive: true,
        catalogVisible: true,
      },
      create: {
        id: area.id,
        name: area.name,
        parentId: area.parentId ?? null,
        isActive: true,
        catalogVisible: true,
      },
    });
  }

  const clientOrgNames = ["Decathlon", "ZF Automotive", "Safira Services"];
  for (const name of clientOrgNames) {
    await prisma.clientOrg.upsert({
      where: { id: `${tenant.id}:${slugify(name)}` },
      update: { name, tenantId: tenant.id, isActive: true },
      create: {
        id: `${tenant.id}:${slugify(name)}`,
        tenantId: tenant.id,
        name,
        isActive: true,
      },
    });
  }

  const trainerEmail = "trainer@oportoforte.com";
  const trainerPassword = "Trainer123!";
  const trainerPasswordHash = await bcrypt.hash(trainerPassword, 12);

  const trainerUser = await prisma.user.upsert({
    where: { email: trainerEmail },
    update: {
      tenantId: tenant.id,
      role: UserRole.TRAINER,
      isActive: true,
      passwordHash: trainerPasswordHash,
      firstName: "Formador",
      lastName: "Demo",
    },
    create: {
      tenantId: tenant.id,
      email: trainerEmail,
      role: UserRole.TRAINER,
      isActive: true,
      passwordHash: trainerPasswordHash,
      firstName: "Formador",
      lastName: "Demo",
    },
  });

  const trainer = await prisma.trainer.upsert({
    where: { userId: trainerUser.id },
    update: {
      tenantId: tenant.id,
      regions: ["Norte", "Centro"],
    },
    create: {
      tenantId: tenant.id,
      userId: trainerUser.id,
      regions: ["Norte", "Centro"],
      trainingAreas: {
        connect: [{ id: "area:gestao-equipas" }, { id: "area:lideranca" }, { id: "area:primeiros-socorros" }],
      },
    },
  });

  const room = await prisma.room.upsert({
    where: { id: `${tenant.id}:room:porto` },
    update: {
      tenantId: tenant.id,
      name: "Sala Porto",
      city: "Porto",
      country: "PT",
      isActive: true,
      equipment: ["PROJETOR", "COMPUTADOR"],
    },
    create: {
      id: `${tenant.id}:room:porto`,
      tenantId: tenant.id,
      name: "Sala Porto",
      city: "Porto",
      country: "PT",
      isActive: true,
      equipment: ["PROJETOR", "COMPUTADOR"],
    },
  });

  const courses = [
    { name: "Gestão de Equipas", durationHours: 16, areaId: "area:gestao-equipas", format: TrainingFormat.PRESENCIAL },
    { name: "Liderança e Comunicação", durationHours: 12, areaId: "area:lideranca", format: TrainingFormat.BLENDED },
    { name: "Ergonomia no Trabalho", durationHours: 8, areaId: "area:ergonomia", format: TrainingFormat.PRESENCIAL },
    { name: "Primeiros Socorros", durationHours: 14, areaId: "area:primeiros-socorros", format: TrainingFormat.PRESENCIAL },
    { name: "Introdução a Excel", durationHours: 10, areaId: "area:informatica", format: TrainingFormat.ELEARNING },
  ] as const;

  const createdCourses = [];
  for (const course of courses) {
    const created = await prisma.course.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug: slugify(course.name) } },
      update: {
        name: course.name,
        durationHours: course.durationHours,
        areaId: course.areaId,
        format: course.format,
        status: CourseStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      create: {
        tenantId: tenant.id,
        name: course.name,
        slug: slugify(course.name),
        durationHours: course.durationHours,
        areaId: course.areaId,
        format: course.format,
        status: CourseStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
    createdCourses.push(created);
  }

  const baseStart = new Date();
  baseStart.setDate(baseStart.getDate() + 14);
  baseStart.setHours(9, 0, 0, 0);

  for (const course of createdCourses) {
    const actionId = `${tenant.id}:action:${course.slug}:v1`;
    const startDate = new Date(baseStart);
    startDate.setDate(baseStart.getDate() + Math.floor(Math.random() * 10));
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    const action = await prisma.trainingAction.upsert({
      where: { id: actionId },
      update: {
        tenantId: tenant.id,
        courseId: course.id,
        startDate,
        endDate,
        roomId: room.id,
        format: course.format,
        status: TrainingStatus.SCHEDULED,
      },
      create: {
        id: actionId,
        tenantId: tenant.id,
        courseId: course.id,
        startDate,
        endDate,
        roomId: room.id,
        format: course.format,
        status: TrainingStatus.SCHEDULED,
      },
    });

    await prisma.trainingActionTrainer.upsert({
      where: { trainingActionId_trainerId: { trainingActionId: action.id, trainerId: trainer.id } },
      update: { role: "MAIN" },
      create: { trainingActionId: action.id, trainerId: trainer.id, role: "MAIN" },
    });

    const session1Date = new Date(startDate);
    const session2Date = new Date(startDate);
    session2Date.setDate(startDate.getDate() + 1);

    await prisma.trainingSession.upsert({
      where: { id: `${action.id}:s1` },
      update: {
        trainingActionId: action.id,
        trainerId: trainer.id,
        sessionDate: session1Date,
        startTime: "09:00",
        endTime: "17:00",
        durationHours: Math.max(1, course.durationHours / 2),
        didacticResources: [],
      },
      create: {
        id: `${action.id}:s1`,
        trainingActionId: action.id,
        trainerId: trainer.id,
        sessionDate: session1Date,
        startTime: "09:00",
        endTime: "17:00",
        durationHours: Math.max(1, course.durationHours / 2),
        didacticResources: [],
      },
    });

    await prisma.trainingSession.upsert({
      where: { id: `${action.id}:s2` },
      update: {
        trainingActionId: action.id,
        trainerId: trainer.id,
        sessionDate: session2Date,
        startTime: "09:00",
        endTime: "17:00",
        durationHours: Math.max(1, course.durationHours / 2),
        didacticResources: [],
      },
      create: {
        id: `${action.id}:s2`,
        trainingActionId: action.id,
        trainerId: trainer.id,
        sessionDate: session2Date,
        startTime: "09:00",
        endTime: "17:00",
        durationHours: Math.max(1, course.durationHours / 2),
        didacticResources: [],
      },
    });
  }

  console.log("Seed concluído:");
  console.log(`- tenant: ${tenant.slug} (${tenant.id})`);
  console.log(`- admin: ${adminUser.email}`);
  console.log(`- password: ${adminPassword}`);
  console.log(`- trainer: ${trainerEmail}`);
  console.log(`- trainerPassword: ${trainerPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
