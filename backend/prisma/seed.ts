import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  await prisma.especialidade.createMany({
    data: [
      { nome: 'Faro de entorpecentes' },
      { nome: 'Faro de explosivos' },
      { nome: 'Busca/patrulha' },
      { nome: 'Mordida' },
      { nome: 'Busca e captura' },
      { nome: 'Busca e salvamento' },
    ],
    skipDuplicates: true,
  });

  await prisma.tipoSubstancia.createMany({
    data: [
      { nome: 'Maconha' },
      { nome: 'Cocaína' },
      { nome: 'Crack' },
      { nome: 'Pasta base' },
      { nome: 'Skank' },
      { nome: 'Outros' },
    ],
    skipDuplicates: true,
  });

  await prisma.tipoArma.createMany({
    data: [
      { nome: 'Pistola' },
      { nome: 'Revólver' },
      { nome: 'Fuzil' },
      { nome: 'Espingarda' },
      { nome: 'Arma branca' },
      { nome: 'Arma artesanal' },
    ],
    skipDuplicates: true,
  });

  await prisma.tipoOcorrencia.createMany({
    data: [
      { nome: 'Operação programada' },
      { nome: 'Ocorrência de patrulhamento' },
      { nome: 'Apoio a outra unidade' },
    ],
    skipDuplicates: true,
  });

  const adminUsername = process.env.SEED_ADMIN_USERNAME ?? 'admin';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';

  await prisma.user.upsert({
    where: { username: adminUsername },
    update: {},
    create: {
      username: adminUsername,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      perfil: 'ADMIN',
    },
  });

  console.log(`Seed concluído. Usuário admin: ${adminUsername} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
