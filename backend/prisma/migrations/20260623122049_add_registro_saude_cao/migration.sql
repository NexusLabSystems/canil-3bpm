-- CreateEnum
CREATE TYPE "TipoRegistroSaude" AS ENUM ('VACINA', 'CONSULTA', 'EXAME', 'OUTRO');

-- CreateTable
CREATE TABLE "RegistroSaudeCao" (
    "id" TEXT NOT NULL,
    "caoId" TEXT NOT NULL,
    "tipo" "TipoRegistroSaude" NOT NULL,
    "descricao" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "proximaData" TIMESTAMP(3),
    "veterinario" TEXT,
    "observacoes" TEXT,
    "criadoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistroSaudeCao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RegistroSaudeCao_caoId_idx" ON "RegistroSaudeCao"("caoId");

-- CreateIndex
CREATE INDEX "RegistroSaudeCao_tipo_idx" ON "RegistroSaudeCao"("tipo");

-- AddForeignKey
ALTER TABLE "RegistroSaudeCao" ADD CONSTRAINT "RegistroSaudeCao_caoId_fkey" FOREIGN KEY ("caoId") REFERENCES "Cao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroSaudeCao" ADD CONSTRAINT "RegistroSaudeCao_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
