-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'TENANT_ADMIN', 'TENANT_STAFF', 'TRAINER', 'CLIENT_HR', 'TRAINEE');

-- CreateEnum
CREATE TYPE "TrainingFormat" AS ENUM ('PRESENCIAL', 'ELEARNING', 'BLENDED');

-- CreateEnum
CREATE TYPE "TrainingStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'FEATURED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('FICHA_IDENTIFICACAO', 'CONTRATO_FORMANDO', 'CONTRATO_FORMADOR', 'REGISTO_PRESENCAS', 'AVALIACAO_FORMANDO', 'REGISTO_OCORRENCIAS', 'CERTIFICADO_CONCLUSAO', 'RELATORIO_FINAL');

-- CreateEnum
CREATE TYPE "SignatureStatus" AS ENUM ('PENDING', 'ENABLED', 'SIGNED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CheckInStatus" AS ENUM ('CHECKED_IN', 'CHECKED_OUT', 'ABSENT', 'MANUAL');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'WHATSAPP', 'PUSH', 'SMS');

-- CreateEnum
CREATE TYPE "NotificationEvent" AS ENUM ('ENROLLMENT_CONFIRMED', 'SESSION_REMINDER_24H', 'SESSION_REMINDER_2H', 'CHECKIN_AVAILABLE', 'SIGNATURE_ENABLED', 'CERTIFICATE_ISSUED', 'QUESTIONNAIRE_AVAILABLE', 'INQUIRY_RECEIVED', 'SESSION_CLOSED');

-- CreateEnum
CREATE TYPE "FinancingSystem" AS ENUM ('POPH', 'PORNORTE', 'FSE2020', 'PT2030', 'PRR', 'PRIVATE', 'OTHER');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "primaryColor" TEXT DEFAULT '#0B2447',
    "secondaryColor" TEXT DEFAULT '#1566C0',
    "accentColor" TEXT DEFAULT '#C9A520',
    "platformName" TEXT DEFAULT 'Academia Digital',
    "emailFromName" TEXT,
    "emailFromAddress" TEXT,
    "cssOverride" TEXT,
    "dgertCode" TEXT,
    "dgertLogoUrl" TEXT,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "phone" TEXT,
    "clientHrOrgId" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "magic_links" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "magic_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_orgs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "nif" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT NOT NULL DEFAULT 'PT',
    "postalCode" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_orgs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainers" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ccpNumber" TEXT,
    "isExternal" BOOLEAN NOT NULL DEFAULT false,
    "eTrainer" BOOLEAN NOT NULL DEFAULT false,
    "preferredSchedule" TEXT,
    "yearsExperiencePresential" INTEGER NOT NULL DEFAULT 0,
    "yearsExperienceDistance" INTEGER NOT NULL DEFAULT 0,
    "vatRate" DOUBLE PRECISION,
    "regions" TEXT[],

    CONSTRAINT "trainers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainees" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "clientOrgId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "preferredName" TEXT,
    "gender" TEXT,
    "birthDate" TIMESTAMP(3),
    "nationality" TEXT,
    "idType" TEXT,
    "idNumber" TEXT,
    "idValidUntil" TIMESTAMP(3),
    "nif" TEXT,
    "ssn" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "country" TEXT NOT NULL DEFAULT 'PT',
    "jobTitle" TEXT,
    "employmentStatus" TEXT,
    "educationLevel" TEXT,
    "educationCourse" TEXT,
    "caeCode" TEXT,
    "gdprConsent" BOOLEAN NOT NULL DEFAULT false,
    "gdprConsentAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_areas" (
    "id" TEXT NOT NULL,
    "citeCode" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "parentId" TEXT,
    "catalogVisible" BOOLEAN NOT NULL DEFAULT true,
    "catalogOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "training_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "code" TEXT,
    "sigla" TEXT,
    "durationHours" DOUBLE PRECISION NOT NULL,
    "areaId" TEXT,
    "format" "TrainingFormat" NOT NULL,
    "certType" TEXT,
    "shortDescription" TEXT,
    "fullDescription" TEXT,
    "objectives" TEXT,
    "specificObjectives" TEXT,
    "methodology" TEXT,
    "evaluationMethod" TEXT,
    "targetAudience" TEXT,
    "prerequisites" TEXT,
    "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "coverImageUrl" TEXT,
    "price" DOUBLE PRECISION,
    "priceNotes" TEXT,
    "tags" TEXT[],
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "publishedAt" TIMESTAMP(3),
    "requiresFinalGrade" BOOLEAN NOT NULL DEFAULT false,
    "requiresFullValidation" BOOLEAN NOT NULL DEFAULT false,
    "hasAssessment" BOOLEAN NOT NULL DEFAULT false,
    "hasAttendanceRegister" BOOLEAN NOT NULL DEFAULT true,
    "hasEvaluationRegister" BOOLEAN NOT NULL DEFAULT false,
    "hasFinalReport" BOOLEAN NOT NULL DEFAULT false,
    "hasCertificate" BOOLEAN NOT NULL DEFAULT true,
    "hasContractTrainee" BOOLEAN NOT NULL DEFAULT true,
    "hasContractTrainer" BOOLEAN NOT NULL DEFAULT false,
    "elearningContentUrl" TEXT,
    "elearningVideoUrl" TEXT,
    "elearningSlidesUrl" TEXT,
    "elearningQuizzes" JSONB,
    "evaluationScale" TEXT,
    "evaluationPassingGrade" DOUBLE PRECISION,
    "evaluationWeightTheory" DOUBLE PRECISION,
    "evaluationWeightPractical" DOUBLE PRECISION,
    "quantitativeEvaluation" BOOLEAN NOT NULL DEFAULT false,
    "qualificationLevel" TEXT,
    "moodleCourseId" TEXT,
    "moodleCategory" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_modules" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "durationHours" DOUBLE PRECISION NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "course_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_plans" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "budget" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_actions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "planId" TEXT,
    "clientOrgId" TEXT,
    "actionCode" TEXT,
    "actionNumber" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "roomId" TEXT,
    "format" "TrainingFormat" NOT NULL,
    "financingSystem" "FinancingSystem",
    "maxTrainees" INTEGER,
    "minTrainees" INTEGER,
    "status" "TrainingStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_action_trainers" (
    "id" TEXT NOT NULL,
    "trainingActionId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MAIN',

    CONSTRAINT "training_action_trainers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_sessions" (
    "id" TEXT NOT NULL,
    "trainingActionId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "durationHours" DOUBLE PRECISION NOT NULL,
    "checkinOpenAt" TIMESTAMP(3),
    "checkinCloseAt" TIMESTAMP(3),
    "checkinQrCode" TEXT,
    "checkinQrExpiresAt" TIMESTAMP(3),
    "isOpen" BOOLEAN NOT NULL DEFAULT false,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "closedAt" TIMESTAMP(3),
    "closedById" TEXT,
    "summary" TEXT,
    "didacticResources" TEXT[],
    "trainerSignatureUrl" TEXT,
    "trainerSignedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" TEXT NOT NULL,
    "trainingActionId" TEXT NOT NULL,
    "traineeId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "completedAt" TIMESTAMP(3),
    "finalGrade" DOUBLE PRECISION,
    "passed" BOOLEAN,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "check_ins" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "traineeId" TEXT NOT NULL,
    "status" "CheckInStatus" NOT NULL DEFAULT 'CHECKED_IN',
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedOutAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "isManual" BOOLEAN NOT NULL DEFAULT false,
    "manualNotes" TEXT,
    "registeredById" TEXT,

    CONSTRAINT "check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_signatures" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT,
    "traineeId" TEXT,
    "trainerId" TEXT,
    "documentType" "DocumentType" NOT NULL,
    "status" "SignatureStatus" NOT NULL DEFAULT 'PENDING',
    "enabledAt" TIMESTAMP(3),
    "enabledById" TEXT,
    "enabledNotes" TEXT,
    "signatureUrl" TEXT,
    "signedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "revokedAt" TIMESTAMP(3),
    "revokedById" TEXT,
    "revokedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_documents" (
    "id" TEXT NOT NULL,
    "trainingActionId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "fileUrl" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedById" TEXT,
    "verificationCode" TEXT,

    CONSTRAINT "training_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "occurrences" (
    "id" TEXT NOT NULL,
    "trainingActionId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "reportedById" TEXT NOT NULL,
    "trainerSignatureUrl" TEXT,
    "responsibleSignatureUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "occurrences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL,
    "traineeId" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "courseCode" TEXT,
    "durationHours" DOUBLE PRECISION NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "fileUrl" TEXT,
    "verificationCode" TEXT,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT,
    "country" TEXT NOT NULL DEFAULT 'PT',
    "address" TEXT,
    "capacity" INTEGER,
    "equipment" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "costPerDay" DOUBLE PRECISION,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "googleMapsUrl" TEXT,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiries" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "courseId" TEXT,
    "courseName" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "jobTitle" TEXT,
    "phone" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "event" "NotificationEvent" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "subject" TEXT,
    "bodyHtml" TEXT,
    "bodyText" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "event" "NotificationEvent" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "status" TEXT NOT NULL,
    "errorMsg" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "traineeId" TEXT,
    "trainerId" TEXT,
    "sessionId" TEXT,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questionnaires" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "format" "TrainingFormat" NOT NULL,
    "targetRole" TEXT NOT NULL,
    "context" TEXT NOT NULL,

    CONSTRAINT "questionnaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questionnaire_questions" (
    "id" TEXT NOT NULL,
    "questionnaireId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SCALE',
    "scaleMin" INTEGER NOT NULL DEFAULT 1,
    "scaleMax" INTEGER NOT NULL DEFAULT 5,
    "order" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "questionnaire_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questionnaire_responses" (
    "id" TEXT NOT NULL,
    "questionnaireId" TEXT NOT NULL,
    "trainingActionId" TEXT,
    "traineeId" TEXT,
    "trainerId" TEXT,
    "respondedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token" TEXT NOT NULL,

    CONSTRAINT "questionnaire_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questionnaire_answers" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "scaleValue" INTEGER,
    "textValue" TEXT,

    CONSTRAINT "questionnaire_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_financing_systems" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "system" "FinancingSystem" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tenant_financing_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "clientOrgId" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "value" DOUBLE PRECISION,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waitlist" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "courseId" TEXT,
    "courseName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "dataConsent" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "notifiedAt" TIMESTAMP(3),
    "enrolledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "changes" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TrainerToTrainingArea" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TrainerToTrainingArea_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_domain_key" ON "tenants"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "magic_links_token_key" ON "magic_links"("token");

-- CreateIndex
CREATE INDEX "magic_links_token_idx" ON "magic_links"("token");

-- CreateIndex
CREATE INDEX "client_orgs_tenantId_idx" ON "client_orgs"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "trainers_userId_key" ON "trainers"("userId");

-- CreateIndex
CREATE INDEX "trainers_tenantId_idx" ON "trainers"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "trainees_userId_key" ON "trainees"("userId");

-- CreateIndex
CREATE INDEX "trainees_tenantId_idx" ON "trainees"("tenantId");

-- CreateIndex
CREATE INDEX "trainees_clientOrgId_idx" ON "trainees"("clientOrgId");

-- CreateIndex
CREATE INDEX "trainees_email_idx" ON "trainees"("email");

-- CreateIndex
CREATE INDEX "courses_tenantId_status_idx" ON "courses"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "courses_tenantId_slug_key" ON "courses"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "course_modules_courseId_idx" ON "course_modules"("courseId");

-- CreateIndex
CREATE INDEX "training_plans_tenantId_idx" ON "training_plans"("tenantId");

-- CreateIndex
CREATE INDEX "training_actions_tenantId_idx" ON "training_actions"("tenantId");

-- CreateIndex
CREATE INDEX "training_actions_clientOrgId_idx" ON "training_actions"("clientOrgId");

-- CreateIndex
CREATE INDEX "training_actions_status_idx" ON "training_actions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "training_action_trainers_trainingActionId_trainerId_key" ON "training_action_trainers"("trainingActionId", "trainerId");

-- CreateIndex
CREATE INDEX "training_sessions_trainingActionId_idx" ON "training_sessions"("trainingActionId");

-- CreateIndex
CREATE INDEX "enrollments_traineeId_idx" ON "enrollments"("traineeId");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_trainingActionId_traineeId_key" ON "enrollments"("trainingActionId", "traineeId");

-- CreateIndex
CREATE INDEX "check_ins_sessionId_idx" ON "check_ins"("sessionId");

-- CreateIndex
CREATE INDEX "check_ins_traineeId_idx" ON "check_ins"("traineeId");

-- CreateIndex
CREATE UNIQUE INDEX "check_ins_sessionId_traineeId_key" ON "check_ins"("sessionId", "traineeId");

-- CreateIndex
CREATE INDEX "document_signatures_sessionId_idx" ON "document_signatures"("sessionId");

-- CreateIndex
CREATE INDEX "document_signatures_traineeId_idx" ON "document_signatures"("traineeId");

-- CreateIndex
CREATE UNIQUE INDEX "training_documents_verificationCode_key" ON "training_documents"("verificationCode");

-- CreateIndex
CREATE INDEX "training_documents_trainingActionId_idx" ON "training_documents"("trainingActionId");

-- CreateIndex
CREATE INDEX "occurrences_trainingActionId_idx" ON "occurrences"("trainingActionId");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_verificationCode_key" ON "certificates"("verificationCode");

-- CreateIndex
CREATE INDEX "certificates_traineeId_idx" ON "certificates"("traineeId");

-- CreateIndex
CREATE INDEX "rooms_tenantId_idx" ON "rooms"("tenantId");

-- CreateIndex
CREATE INDEX "inquiries_tenantId_idx" ON "inquiries"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_tenantId_event_channel_key" ON "notification_templates"("tenantId", "event", "channel");

-- CreateIndex
CREATE INDEX "notification_logs_tenantId_idx" ON "notification_logs"("tenantId");

-- CreateIndex
CREATE INDEX "questionnaires_tenantId_idx" ON "questionnaires"("tenantId");

-- CreateIndex
CREATE INDEX "questionnaire_questions_questionnaireId_idx" ON "questionnaire_questions"("questionnaireId");

-- CreateIndex
CREATE UNIQUE INDEX "questionnaire_responses_token_key" ON "questionnaire_responses"("token");

-- CreateIndex
CREATE INDEX "questionnaire_responses_questionnaireId_idx" ON "questionnaire_responses"("questionnaireId");

-- CreateIndex
CREATE INDEX "questionnaire_answers_responseId_idx" ON "questionnaire_answers"("responseId");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_financing_systems_tenantId_system_key" ON "tenant_financing_systems"("tenantId", "system");

-- CreateIndex
CREATE INDEX "contracts_clientOrgId_idx" ON "contracts"("clientOrgId");

-- CreateIndex
CREATE INDEX "waitlist_tenantId_idx" ON "waitlist"("tenantId");

-- CreateIndex
CREATE INDEX "waitlist_courseId_idx" ON "waitlist"("courseId");

-- CreateIndex
CREATE INDEX "audit_logs_tenantId_idx" ON "audit_logs"("tenantId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "_TrainerToTrainingArea_B_index" ON "_TrainerToTrainingArea"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_clientHrOrgId_fkey" FOREIGN KEY ("clientHrOrgId") REFERENCES "client_orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magic_links" ADD CONSTRAINT "magic_links_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_orgs" ADD CONSTRAINT "client_orgs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainers" ADD CONSTRAINT "trainers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainers" ADD CONSTRAINT "trainers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainees" ADD CONSTRAINT "trainees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainees" ADD CONSTRAINT "trainees_clientOrgId_fkey" FOREIGN KEY ("clientOrgId") REFERENCES "client_orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_areas" ADD CONSTRAINT "training_areas_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "training_areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "training_areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_plans" ADD CONSTRAINT "training_plans_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_actions" ADD CONSTRAINT "training_actions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_actions" ADD CONSTRAINT "training_actions_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_actions" ADD CONSTRAINT "training_actions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "training_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_actions" ADD CONSTRAINT "training_actions_clientOrgId_fkey" FOREIGN KEY ("clientOrgId") REFERENCES "client_orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_actions" ADD CONSTRAINT "training_actions_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_action_trainers" ADD CONSTRAINT "training_action_trainers_trainingActionId_fkey" FOREIGN KEY ("trainingActionId") REFERENCES "training_actions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_action_trainers" ADD CONSTRAINT "training_action_trainers_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "trainers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_trainingActionId_fkey" FOREIGN KEY ("trainingActionId") REFERENCES "training_actions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "trainers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_trainingActionId_fkey" FOREIGN KEY ("trainingActionId") REFERENCES "training_actions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "trainees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "training_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "trainees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_signatures" ADD CONSTRAINT "document_signatures_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "training_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_signatures" ADD CONSTRAINT "document_signatures_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "trainees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_documents" ADD CONSTRAINT "training_documents_trainingActionId_fkey" FOREIGN KEY ("trainingActionId") REFERENCES "training_actions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occurrences" ADD CONSTRAINT "occurrences_trainingActionId_fkey" FOREIGN KEY ("trainingActionId") REFERENCES "training_actions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "trainees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_templates" ADD CONSTRAINT "notification_templates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questionnaire_questions" ADD CONSTRAINT "questionnaire_questions_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "questionnaires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questionnaire_responses" ADD CONSTRAINT "questionnaire_responses_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "questionnaires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questionnaire_answers" ADD CONSTRAINT "questionnaire_answers_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "questionnaire_responses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questionnaire_answers" ADD CONSTRAINT "questionnaire_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questionnaire_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_financing_systems" ADD CONSTRAINT "tenant_financing_systems_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_clientOrgId_fkey" FOREIGN KEY ("clientOrgId") REFERENCES "client_orgs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TrainerToTrainingArea" ADD CONSTRAINT "_TrainerToTrainingArea_A_fkey" FOREIGN KEY ("A") REFERENCES "trainers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TrainerToTrainingArea" ADD CONSTRAINT "_TrainerToTrainingArea_B_fkey" FOREIGN KEY ("B") REFERENCES "training_areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
