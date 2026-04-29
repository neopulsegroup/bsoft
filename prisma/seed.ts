import bcrypt from "bcryptjs";
import { PrismaClient, CourseStatus, TrainingFormat, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

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

  const areas = await Promise.all(
    ["Gestão", "Saúde e Bem-Estar", "Tecnologia"].map((name) =>
      prisma.trainingArea.upsert({
        where: { id: slugify(name) },
        update: { name, isActive: true, catalogVisible: true },
        create: { id: slugify(name), name, isActive: true, catalogVisible: true },
      }),
    ),
  );

  const courses = [
    { name: "Gestão de Equipas", durationHours: 16, areaId: areas[0].id, format: TrainingFormat.PRESENCIAL },
    { name: "Liderança e Comunicação", durationHours: 12, areaId: areas[0].id, format: TrainingFormat.BLENDED },
    { name: "Ergonomia no Trabalho", durationHours: 8, areaId: areas[1].id, format: TrainingFormat.PRESENCIAL },
    { name: "Primeiros Socorros", durationHours: 14, areaId: areas[1].id, format: TrainingFormat.PRESENCIAL },
    { name: "Introdução a Excel", durationHours: 10, areaId: areas[2].id, format: TrainingFormat.ELEARNING },
  ];

  for (const course of courses) {
    await prisma.course.upsert({
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
  }

  console.log("Seed concluído:");
  console.log(`- tenant: ${tenant.slug} (${tenant.id})`);
  console.log(`- admin: ${adminUser.email}`);
  console.log(`- password: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
