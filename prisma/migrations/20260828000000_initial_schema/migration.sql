-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'OPERATOR');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('OCCUPIED', 'VACANT', 'INACTIVE');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('ADVANCE', 'ARREARS');

-- CreateEnum
CREATE TYPE "GuaranteeType" AS ENUM ('CAUTION', 'BOOZ', 'LOFT');

-- CreateEnum
CREATE TYPE "IptuResponsibility" AS ENUM ('OWNER', 'TENANT');

-- CreateEnum
CREATE TYPE "CemigHolder" AS ENUM ('TENANT', 'OWNER', 'THIRD_PARTY');

-- CreateEnum
CREATE TYPE "AdministrationFeeType" AS ENUM ('COMMON_RENTAL_10', 'SEASONAL_20');

-- CreateEnum
CREATE TYPE "IntermediationFeeType" AS ENUM ('EXEMPT', 'FIFTY_AFTER_THREE_MONTHS');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('ACTIVE', 'VACANT', 'CLOSED');

-- CreateEnum
CREATE TYPE "ContractLifecycleStatus" AS ENUM ('NORMAL', 'EXPIRING', 'RENEWED', 'MOVING_OUT');

-- CreateEnum
CREATE TYPE "ObligationStatus" AS ENUM ('NOT_APPLICABLE', 'PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('NOT_APPLICABLE', 'PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ChargeStatus" AS ENUM ('NONE', 'D5', 'D7', 'D10', 'D15', 'D20', 'D30', 'MANUAL_DECISION', 'RESOLVED');

-- CreateEnum
CREATE TYPE "ProofType" AS ENUM ('RENT', 'WATER', 'ENERGY', 'IPTU', 'DISCOUNT', 'OTHER');

-- CreateEnum
CREATE TYPE "ProofAnalysisStatus" AS ENUM ('NOT_ANALYZED', 'APPROVED', 'NEEDS_REVIEW', 'REJECTED');

-- CreateEnum
CREATE TYPE "ChargeStage" AS ENUM ('D5', 'D7', 'D10', 'D15', 'D20', 'D30', 'MANUAL_DECISION');

-- CreateEnum
CREATE TYPE "ChargeRecordStatus" AS ENUM ('OPEN', 'RESOLVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransferRecordStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('REPAIR', 'BILL', 'OTHER');

-- CreateEnum
CREATE TYPE "DiscountStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DiscountInstallmentStatus" AS ENUM ('PENDING', 'APPLIED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "IptuType" AS ENUM ('SINGLE', 'INSTALLMENT');

-- CreateEnum
CREATE TYPE "IptuStatus" AS ENUM ('PENDING', 'PARTIALLY_PAID', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "IptuInstallmentStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "UtilityStatus" AS ENUM ('NOT_APPLICABLE', 'PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AnnualReportStatus" AS ENUM ('NOT_GENERATED', 'GENERATED', 'SENT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'OPERATOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Owner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "document" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Owner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "document" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "status" "PropertyStatus" NOT NULL DEFAULT 'VACANT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "rentAmount" DECIMAL(12,2) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "dueDay" INTEGER NOT NULL,
    "paymentType" "PaymentType" NOT NULL DEFAULT 'ADVANCE',
    "guaranteeType" "GuaranteeType" NOT NULL DEFAULT 'CAUTION',
    "iptuResponsibility" "IptuResponsibility" NOT NULL DEFAULT 'OWNER',
    "cemigHolder" "CemigHolder" NOT NULL DEFAULT 'TENANT',
    "administrationFeeType" "AdministrationFeeType" NOT NULL DEFAULT 'COMMON_RENTAL_10',
    "administrationFeePercent" DECIMAL(5,2) NOT NULL DEFAULT 10,
    "intermediationFeeType" "IntermediationFeeType" NOT NULL DEFAULT 'EXEMPT',
    "intermediationFeePercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "status" "ContractStatus" NOT NULL DEFAULT 'ACTIVE',
    "lifecycleStatus" "ContractLifecycleStatus" NOT NULL DEFAULT 'NORMAL',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyObligation" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "competence" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "rentStatus" "ObligationStatus" NOT NULL DEFAULT 'PENDING',
    "waterStatus" "ObligationStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "energyStatus" "ObligationStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "iptuStatus" "ObligationStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "transferStatus" "TransferStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "chargeStatus" "ChargeStatus" NOT NULL DEFAULT 'NONE',
    "rentProofReceivedAt" TIMESTAMP(3),
    "waterProofReceivedAt" TIMESTAMP(3),
    "energyProofReceivedAt" TIMESTAMP(3),
    "rentProofSentToOwnerAt" TIMESTAMP(3),
    "discountProofSentToOwnerAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyObligation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentProof" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "monthlyObligationId" TEXT,
    "type" "ProofType" NOT NULL,
    "fileUrl" TEXT,
    "originalFileName" TEXT,
    "amount" DECIMAL(12,2),
    "paidAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "analysisStatus" "ProofAnalysisStatus" NOT NULL DEFAULT 'NOT_ANALYZED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentProof_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Charge" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "monthlyObligationId" TEXT NOT NULL,
    "stage" "ChargeStage" NOT NULL,
    "status" "ChargeRecordStatus" NOT NULL DEFAULT 'OPEN',
    "lastMessageAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Charge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transfer" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "monthlyObligationId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "grossRentAmount" DECIMAL(12,2) NOT NULL,
    "administrationFeeAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "intermediationFeeAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "netTransferAmount" DECIMAL(12,2) NOT NULL,
    "isReleasedByGuarantee" BOOLEAN NOT NULL DEFAULT false,
    "guaranteeType" "GuaranteeType",
    "status" "TransferRecordStatus" NOT NULL DEFAULT 'PENDING',
    "transferredAt" TIMESTAMP(3),
    "rentProofSentToOwnerAt" TIMESTAMP(3),
    "discountProofSentToOwnerAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Discount" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "type" "DiscountType" NOT NULL,
    "description" TEXT NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "installmentCount" INTEGER NOT NULL DEFAULT 1,
    "installmentAmount" DECIMAL(12,2) NOT NULL,
    "status" "DiscountStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountInstallment" (
    "id" TEXT NOT NULL,
    "discountId" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "monthlyObligationId" TEXT,
    "installmentNumber" INTEGER NOT NULL,
    "totalInstallments" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "DiscountInstallmentStatus" NOT NULL DEFAULT 'PENDING',
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscountInstallment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IptuRecord" (
    "id" TEXT NOT NULL,
    "contractId" TEXT,
    "propertyId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "type" "IptuType" NOT NULL,
    "responsibility" "IptuResponsibility" NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "installmentCount" INTEGER NOT NULL DEFAULT 1,
    "status" "IptuStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IptuRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IptuInstallment" (
    "id" TEXT NOT NULL,
    "iptuRecordId" TEXT NOT NULL,
    "monthlyObligationId" TEXT,
    "installmentNumber" INTEGER NOT NULL,
    "totalInstallments" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "IptuInstallmentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IptuInstallment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaterRecord" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "monthlyObligationId" TEXT NOT NULL,
    "status" "UtilityStatus" NOT NULL DEFAULT 'PENDING',
    "proofReceivedAt" TIMESTAMP(3),
    "amount" DECIMAL(12,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaterRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnergyRecord" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "monthlyObligationId" TEXT NOT NULL,
    "status" "UtilityStatus" NOT NULL DEFAULT 'PENDING',
    "proofReceivedAt" TIMESTAMP(3),
    "amount" DECIMAL(12,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnergyRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnualReport" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "propertyId" TEXT,
    "contractId" TEXT,
    "year" INTEGER NOT NULL,
    "status" "AnnualReportStatus" NOT NULL DEFAULT 'NOT_GENERATED',
    "generatedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "fileUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnnualReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "contractId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "action" TEXT NOT NULL,
    "message" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Property_ownerId_idx" ON "Property"("ownerId");

-- CreateIndex
CREATE INDEX "Property_status_idx" ON "Property"("status");

-- CreateIndex
CREATE INDEX "Contract_ownerId_idx" ON "Contract"("ownerId");

-- CreateIndex
CREATE INDEX "Contract_tenantId_idx" ON "Contract"("tenantId");

-- CreateIndex
CREATE INDEX "Contract_propertyId_idx" ON "Contract"("propertyId");

-- CreateIndex
CREATE INDEX "Contract_status_idx" ON "Contract"("status");

-- CreateIndex
CREATE INDEX "Contract_endDate_idx" ON "Contract"("endDate");

-- CreateIndex
CREATE INDEX "Contract_dueDay_idx" ON "Contract"("dueDay");

-- CreateIndex
CREATE INDEX "MonthlyObligation_contractId_idx" ON "MonthlyObligation"("contractId");

-- CreateIndex
CREATE INDEX "MonthlyObligation_competence_idx" ON "MonthlyObligation"("competence");

-- CreateIndex
CREATE INDEX "MonthlyObligation_dueDate_idx" ON "MonthlyObligation"("dueDate");

-- CreateIndex
CREATE INDEX "MonthlyObligation_rentStatus_idx" ON "MonthlyObligation"("rentStatus");

-- CreateIndex
CREATE INDEX "MonthlyObligation_transferStatus_idx" ON "MonthlyObligation"("transferStatus");

-- CreateIndex
CREATE INDEX "MonthlyObligation_chargeStatus_idx" ON "MonthlyObligation"("chargeStatus");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyObligation_contractId_competence_key" ON "MonthlyObligation"("contractId", "competence");

-- CreateIndex
CREATE INDEX "PaymentProof_contractId_idx" ON "PaymentProof"("contractId");

-- CreateIndex
CREATE INDEX "PaymentProof_monthlyObligationId_idx" ON "PaymentProof"("monthlyObligationId");

-- CreateIndex
CREATE INDEX "PaymentProof_type_idx" ON "PaymentProof"("type");

-- CreateIndex
CREATE INDEX "PaymentProof_analysisStatus_idx" ON "PaymentProof"("analysisStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Charge_monthlyObligationId_key" ON "Charge"("monthlyObligationId");

-- CreateIndex
CREATE INDEX "Charge_contractId_idx" ON "Charge"("contractId");

-- CreateIndex
CREATE INDEX "Charge_stage_idx" ON "Charge"("stage");

-- CreateIndex
CREATE INDEX "Charge_status_idx" ON "Charge"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Transfer_monthlyObligationId_key" ON "Transfer"("monthlyObligationId");

-- CreateIndex
CREATE INDEX "Transfer_contractId_idx" ON "Transfer"("contractId");

-- CreateIndex
CREATE INDEX "Transfer_ownerId_idx" ON "Transfer"("ownerId");

-- CreateIndex
CREATE INDEX "Transfer_status_idx" ON "Transfer"("status");

-- CreateIndex
CREATE INDEX "Discount_contractId_idx" ON "Discount"("contractId");

-- CreateIndex
CREATE INDEX "Discount_status_idx" ON "Discount"("status");

-- CreateIndex
CREATE INDEX "DiscountInstallment_contractId_idx" ON "DiscountInstallment"("contractId");

-- CreateIndex
CREATE INDEX "DiscountInstallment_monthlyObligationId_idx" ON "DiscountInstallment"("monthlyObligationId");

-- CreateIndex
CREATE INDEX "DiscountInstallment_status_idx" ON "DiscountInstallment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountInstallment_discountId_installmentNumber_key" ON "DiscountInstallment"("discountId", "installmentNumber");

-- CreateIndex
CREATE INDEX "IptuRecord_contractId_idx" ON "IptuRecord"("contractId");

-- CreateIndex
CREATE INDEX "IptuRecord_propertyId_idx" ON "IptuRecord"("propertyId");

-- CreateIndex
CREATE INDEX "IptuRecord_year_idx" ON "IptuRecord"("year");

-- CreateIndex
CREATE INDEX "IptuRecord_status_idx" ON "IptuRecord"("status");

-- CreateIndex
CREATE INDEX "IptuInstallment_monthlyObligationId_idx" ON "IptuInstallment"("monthlyObligationId");

-- CreateIndex
CREATE INDEX "IptuInstallment_dueDate_idx" ON "IptuInstallment"("dueDate");

-- CreateIndex
CREATE INDEX "IptuInstallment_status_idx" ON "IptuInstallment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "IptuInstallment_iptuRecordId_installmentNumber_key" ON "IptuInstallment"("iptuRecordId", "installmentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "WaterRecord_monthlyObligationId_key" ON "WaterRecord"("monthlyObligationId");

-- CreateIndex
CREATE INDEX "WaterRecord_contractId_idx" ON "WaterRecord"("contractId");

-- CreateIndex
CREATE INDEX "WaterRecord_status_idx" ON "WaterRecord"("status");

-- CreateIndex
CREATE UNIQUE INDEX "EnergyRecord_monthlyObligationId_key" ON "EnergyRecord"("monthlyObligationId");

-- CreateIndex
CREATE INDEX "EnergyRecord_contractId_idx" ON "EnergyRecord"("contractId");

-- CreateIndex
CREATE INDEX "EnergyRecord_status_idx" ON "EnergyRecord"("status");

-- CreateIndex
CREATE INDEX "AnnualReport_ownerId_idx" ON "AnnualReport"("ownerId");

-- CreateIndex
CREATE INDEX "AnnualReport_propertyId_idx" ON "AnnualReport"("propertyId");

-- CreateIndex
CREATE INDEX "AnnualReport_contractId_idx" ON "AnnualReport"("contractId");

-- CreateIndex
CREATE INDEX "AnnualReport_year_idx" ON "AnnualReport"("year");

-- CreateIndex
CREATE INDEX "AnnualReport_status_idx" ON "AnnualReport"("status");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_contractId_idx" ON "AuditLog"("contractId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyObligation" ADD CONSTRAINT "MonthlyObligation_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentProof" ADD CONSTRAINT "PaymentProof_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentProof" ADD CONSTRAINT "PaymentProof_monthlyObligationId_fkey" FOREIGN KEY ("monthlyObligationId") REFERENCES "MonthlyObligation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_monthlyObligationId_fkey" FOREIGN KEY ("monthlyObligationId") REFERENCES "MonthlyObligation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_monthlyObligationId_fkey" FOREIGN KEY ("monthlyObligationId") REFERENCES "MonthlyObligation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discount" ADD CONSTRAINT "Discount_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountInstallment" ADD CONSTRAINT "DiscountInstallment_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountInstallment" ADD CONSTRAINT "DiscountInstallment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountInstallment" ADD CONSTRAINT "DiscountInstallment_monthlyObligationId_fkey" FOREIGN KEY ("monthlyObligationId") REFERENCES "MonthlyObligation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IptuRecord" ADD CONSTRAINT "IptuRecord_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IptuRecord" ADD CONSTRAINT "IptuRecord_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IptuInstallment" ADD CONSTRAINT "IptuInstallment_iptuRecordId_fkey" FOREIGN KEY ("iptuRecordId") REFERENCES "IptuRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IptuInstallment" ADD CONSTRAINT "IptuInstallment_monthlyObligationId_fkey" FOREIGN KEY ("monthlyObligationId") REFERENCES "MonthlyObligation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterRecord" ADD CONSTRAINT "WaterRecord_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterRecord" ADD CONSTRAINT "WaterRecord_monthlyObligationId_fkey" FOREIGN KEY ("monthlyObligationId") REFERENCES "MonthlyObligation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnergyRecord" ADD CONSTRAINT "EnergyRecord_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnergyRecord" ADD CONSTRAINT "EnergyRecord_monthlyObligationId_fkey" FOREIGN KEY ("monthlyObligationId") REFERENCES "MonthlyObligation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnualReport" ADD CONSTRAINT "AnnualReport_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnualReport" ADD CONSTRAINT "AnnualReport_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnualReport" ADD CONSTRAINT "AnnualReport_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;
