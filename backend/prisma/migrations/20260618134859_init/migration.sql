-- CreateEnum
CREATE TYPE "PerfilUsuario" AS ENUM ('CONDUTOR', 'COMANDANTE', 'ADMIN');

-- CreateEnum
CREATE TYPE "SexoCao" AS ENUM ('MACHO', 'FEMEA');

-- CreateEnum
CREATE TYPE "StatusCao" AS ENUM ('ATIVO', 'EM_TREINAMENTO', 'AFASTADO', 'REFORMADO');

-- CreateEnum
CREATE TYPE "TipoApreensao" AS ENUM ('ENTORPECENTE', 'ARMA', 'MUNICAO', 'DINHEIRO', 'VEICULO', 'OUTROS');

-- CreateEnum
CREATE TYPE "StatusApreensao" AS ENUM ('RASCUNHO', 'PENDENTE_REVISAO', 'VALIDADA', 'DEVOLVIDA');

-- CreateEnum
CREATE TYPE "TipoEventoOcorrencia" AS ENUM ('OPERACAO_PROGRAMADA', 'OCORRENCIA_PATRULHAMENTO', 'APOIO_OUTRA_UNIDADE');

-- CreateTable
CREATE TABLE "Especialidade" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Especialidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoSubstancia" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TipoSubstancia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoArma" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TipoArma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoOcorrencia" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TipoOcorrencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "raca" TEXT NOT NULL,
    "sexo" "SexoCao" NOT NULL,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "registro" TEXT NOT NULL,
    "especialidadeId" TEXT NOT NULL,
    "status" "StatusCao" NOT NULL DEFAULT 'ATIVO',
    "fotoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Condutor" (
    "id" TEXT NOT NULL,
    "postoGraduacao" TEXT NOT NULL,
    "nomeGuerra" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Condutor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "perfil" "PerfilUsuario" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "condutorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Binomio" (
    "id" TEXT NOT NULL,
    "condutorId" TEXT NOT NULL,
    "caoId" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Binomio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ocorrencia" (
    "id" TEXT NOT NULL,
    "tipoEvento" "TipoEventoOcorrencia" NOT NULL,
    "tipoOcorrenciaId" TEXT NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "numeroBO" TEXT,
    "criadoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ocorrencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OcorrenciaBinomio" (
    "id" TEXT NOT NULL,
    "ocorrenciaId" TEXT NOT NULL,
    "binomioId" TEXT NOT NULL,

    CONSTRAINT "OcorrenciaBinomio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Apreensao" (
    "id" TEXT NOT NULL,
    "ocorrenciaId" TEXT NOT NULL,
    "caoId" TEXT NOT NULL,
    "binomioId" TEXT NOT NULL,
    "tipo" "TipoApreensao" NOT NULL,
    "valorEstimado" DECIMAL(14,2),
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "horario" TIMESTAMP(3) NOT NULL,
    "status" "StatusApreensao" NOT NULL DEFAULT 'RASCUNHO',
    "criadoPorId" TEXT NOT NULL,
    "revisadoPorId" TEXT,
    "revisadoEm" TIMESTAMP(3),
    "observacaoRevisao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Apreensao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApreensaoFoto" (
    "id" TEXT NOT NULL,
    "apreensaoId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApreensaoFoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApreensaoEntorpecente" (
    "apreensaoId" TEXT NOT NULL,
    "tipoSubstanciaId" TEXT NOT NULL,
    "pesoQuantidade" DECIMAL(12,3) NOT NULL,
    "formaAcondicionamento" TEXT NOT NULL,

    CONSTRAINT "ApreensaoEntorpecente_pkey" PRIMARY KEY ("apreensaoId")
);

-- CreateTable
CREATE TABLE "ApreensaoArma" (
    "apreensaoId" TEXT NOT NULL,
    "tipoArmaId" TEXT NOT NULL,
    "calibre" TEXT,
    "marca" TEXT,
    "numeracao" TEXT,

    CONSTRAINT "ApreensaoArma_pkey" PRIMARY KEY ("apreensaoId")
);

-- CreateTable
CREATE TABLE "ApreensaoMunicao" (
    "apreensaoId" TEXT NOT NULL,
    "calibre" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,

    CONSTRAINT "ApreensaoMunicao_pkey" PRIMARY KEY ("apreensaoId")
);

-- CreateTable
CREATE TABLE "ApreensaoOutro" (
    "apreensaoId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,

    CONSTRAINT "ApreensaoOutro_pkey" PRIMARY KEY ("apreensaoId")
);

-- CreateTable
CREATE TABLE "LogAuditoria" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT NOT NULL,
    "detalhes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogAuditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Especialidade_nome_key" ON "Especialidade"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "TipoSubstancia_nome_key" ON "TipoSubstancia"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "TipoArma_nome_key" ON "TipoArma"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "TipoOcorrencia_nome_key" ON "TipoOcorrencia"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Cao_registro_key" ON "Cao"("registro");

-- CreateIndex
CREATE UNIQUE INDEX "Condutor_matricula_key" ON "Condutor"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_condutorId_key" ON "User"("condutorId");

-- CreateIndex
CREATE INDEX "Binomio_caoId_idx" ON "Binomio"("caoId");

-- CreateIndex
CREATE INDEX "Binomio_condutorId_idx" ON "Binomio"("condutorId");

-- CreateIndex
CREATE INDEX "Ocorrencia_dataHora_idx" ON "Ocorrencia"("dataHora");

-- CreateIndex
CREATE UNIQUE INDEX "OcorrenciaBinomio_ocorrenciaId_binomioId_key" ON "OcorrenciaBinomio"("ocorrenciaId", "binomioId");

-- CreateIndex
CREATE INDEX "Apreensao_caoId_idx" ON "Apreensao"("caoId");

-- CreateIndex
CREATE INDEX "Apreensao_binomioId_idx" ON "Apreensao"("binomioId");

-- CreateIndex
CREATE INDEX "Apreensao_horario_idx" ON "Apreensao"("horario");

-- CreateIndex
CREATE INDEX "Apreensao_status_idx" ON "Apreensao"("status");

-- CreateIndex
CREATE INDEX "LogAuditoria_entidade_entidadeId_idx" ON "LogAuditoria"("entidade", "entidadeId");

-- AddForeignKey
ALTER TABLE "Cao" ADD CONSTRAINT "Cao_especialidadeId_fkey" FOREIGN KEY ("especialidadeId") REFERENCES "Especialidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_condutorId_fkey" FOREIGN KEY ("condutorId") REFERENCES "Condutor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Binomio" ADD CONSTRAINT "Binomio_condutorId_fkey" FOREIGN KEY ("condutorId") REFERENCES "Condutor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Binomio" ADD CONSTRAINT "Binomio_caoId_fkey" FOREIGN KEY ("caoId") REFERENCES "Cao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ocorrencia" ADD CONSTRAINT "Ocorrencia_tipoOcorrenciaId_fkey" FOREIGN KEY ("tipoOcorrenciaId") REFERENCES "TipoOcorrencia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ocorrencia" ADD CONSTRAINT "Ocorrencia_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OcorrenciaBinomio" ADD CONSTRAINT "OcorrenciaBinomio_ocorrenciaId_fkey" FOREIGN KEY ("ocorrenciaId") REFERENCES "Ocorrencia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OcorrenciaBinomio" ADD CONSTRAINT "OcorrenciaBinomio_binomioId_fkey" FOREIGN KEY ("binomioId") REFERENCES "Binomio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Apreensao" ADD CONSTRAINT "Apreensao_ocorrenciaId_fkey" FOREIGN KEY ("ocorrenciaId") REFERENCES "Ocorrencia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Apreensao" ADD CONSTRAINT "Apreensao_caoId_fkey" FOREIGN KEY ("caoId") REFERENCES "Cao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Apreensao" ADD CONSTRAINT "Apreensao_binomioId_fkey" FOREIGN KEY ("binomioId") REFERENCES "Binomio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Apreensao" ADD CONSTRAINT "Apreensao_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Apreensao" ADD CONSTRAINT "Apreensao_revisadoPorId_fkey" FOREIGN KEY ("revisadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApreensaoFoto" ADD CONSTRAINT "ApreensaoFoto_apreensaoId_fkey" FOREIGN KEY ("apreensaoId") REFERENCES "Apreensao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApreensaoEntorpecente" ADD CONSTRAINT "ApreensaoEntorpecente_apreensaoId_fkey" FOREIGN KEY ("apreensaoId") REFERENCES "Apreensao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApreensaoEntorpecente" ADD CONSTRAINT "ApreensaoEntorpecente_tipoSubstanciaId_fkey" FOREIGN KEY ("tipoSubstanciaId") REFERENCES "TipoSubstancia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApreensaoArma" ADD CONSTRAINT "ApreensaoArma_apreensaoId_fkey" FOREIGN KEY ("apreensaoId") REFERENCES "Apreensao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApreensaoArma" ADD CONSTRAINT "ApreensaoArma_tipoArmaId_fkey" FOREIGN KEY ("tipoArmaId") REFERENCES "TipoArma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApreensaoMunicao" ADD CONSTRAINT "ApreensaoMunicao_apreensaoId_fkey" FOREIGN KEY ("apreensaoId") REFERENCES "Apreensao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApreensaoOutro" ADD CONSTRAINT "ApreensaoOutro_apreensaoId_fkey" FOREIGN KEY ("apreensaoId") REFERENCES "Apreensao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogAuditoria" ADD CONSTRAINT "LogAuditoria_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
