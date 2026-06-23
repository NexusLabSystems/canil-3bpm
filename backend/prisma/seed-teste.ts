// Seed de dados de teste mais robusto, pra exercitar dashboard, mapa de
// calor, validação e cadastros com volume e variedade. Não toca em dados
// que já existam (condutores/cães criados manualmente continuam intactos);
// só soma novos registros, e é seguro rodar mais de uma vez.
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  TipoApreensao,
  TipoEventoOcorrencia,
  StatusApreensao,
  type Condutor,
  type Cao,
  type Binomio,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

// Região de referência pra espalhar os pontos no mapa de calor.
const CENTRO = { lat: -9.6, lng: -36.0 };

function pontoAleatorio() {
  return {
    latitude: CENTRO.lat + (Math.random() - 0.5) * 0.6,
    longitude: CENTRO.lng + (Math.random() - 0.5) * 0.6,
  };
}

function dataAleatoriaUltimosMeses(meses: number) {
  const agora = Date.now();
  const inicio = agora - meses * 30 * 24 * 60 * 60 * 1000;
  return new Date(inicio + Math.random() * (agora - inicio));
}

function escolha<T>(lista: T[]): T {
  return lista[Math.floor(Math.random() * lista.length)];
}

async function main() {
  const especialidades = await prisma.especialidade.findMany();
  const tiposSubstancia = await prisma.tipoSubstancia.findMany();
  const tiposArma = await prisma.tipoArma.findMany();
  const tiposOcorrencia = await prisma.tipoOcorrencia.findMany();

  // ---------- Usuário comandante ----------
  await prisma.user.upsert({
    where: { username: 'comandante' },
    update: {},
    create: {
      username: 'comandante',
      passwordHash: await bcrypt.hash('comandante123', 10),
      perfil: 'COMANDANTE',
    },
  });
  const comandante = await prisma.user.findUniqueOrThrow({ where: { username: 'comandante' } });

  // ---------- Condutores + usuários ----------
  const condutoresSeed = [
    { matricula: '1002', postoGraduacao: '3º Sgt', nomeGuerra: 'Marcos Silva', username: 'marcossilva' },
    { matricula: '1003', postoGraduacao: 'Cb', nomeGuerra: 'Juliana Costa', username: 'julianacosta' },
    { matricula: '1004', postoGraduacao: 'Sd', nomeGuerra: 'Rafael Lima', username: 'rafaellima' },
    { matricula: '1005', postoGraduacao: '2º Sgt', nomeGuerra: 'Bruno Alves', username: 'brunoalves' },
  ];

  const condutores: Condutor[] = [];
  for (const c of condutoresSeed) {
    const condutor = await prisma.condutor.upsert({
      where: { matricula: c.matricula },
      update: {},
      create: { matricula: c.matricula, postoGraduacao: c.postoGraduacao, nomeGuerra: c.nomeGuerra },
    });
    await prisma.user.upsert({
      where: { username: c.username },
      update: {},
      create: {
        username: c.username,
        passwordHash: await bcrypt.hash('teste123', 10),
        perfil: 'CONDUTOR',
        condutorId: condutor.id,
      },
    });
    condutores.push(condutor);
  }

  // ---------- Cães ----------
  const caesSeed = [
    { registro: '1002', nome: 'Rex', raca: 'Pastor Alemão', sexo: 'MACHO' as const, especialidade: 'Faro de entorpecentes', status: 'ATIVO' as const },
    { registro: '1003', nome: 'Luna', raca: 'Belga Malinois', sexo: 'FEMEA' as const, especialidade: 'Busca e captura', status: 'ATIVO' as const },
    { registro: '1004', nome: 'Zeus', raca: 'Labrador', sexo: 'MACHO' as const, especialidade: 'Faro de explosivos', status: 'EM_TREINAMENTO' as const },
    { registro: '1005', nome: 'Mel', raca: 'Pastor Belga', sexo: 'FEMEA' as const, especialidade: 'Busca e salvamento', status: 'AFASTADO' as const },
  ];

  const caes: Cao[] = [];
  for (const c of caesSeed) {
    const especialidade = especialidades.find((e) => e.nome === c.especialidade) ?? especialidades[0];
    const cao = await prisma.cao.upsert({
      where: { registro: c.registro },
      update: {},
      create: {
        registro: c.registro,
        nome: c.nome,
        raca: c.raca,
        sexo: c.sexo,
        status: c.status,
        especialidadeId: especialidade.id,
        dataNascimento: new Date(2021, Math.floor(Math.random() * 12), 1),
      },
    });
    caes.push(cao);
  }

  // ---------- Binômios ----------
  const binomios: Binomio[] = [];
  for (let i = 0; i < condutores.length; i++) {
    const existente = await prisma.binomio.findFirst({
      where: { condutorId: condutores[i].id, caoId: caes[i].id },
    });
    const binomio =
      existente ??
      (await prisma.binomio.create({
        data: {
          condutorId: condutores[i].id,
          caoId: caes[i].id,
          dataInicio: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
        },
      }));
    binomios.push(binomio);
  }

  // ---------- Ocorrências + apreensões (só se ainda não existir volume) ----------
  const jaTemDados = await prisma.apreensao.count({ where: { caoId: { in: caes.map((c) => c.id) } } });

  if (jaTemDados === 0) {
    const tiposEvento: TipoEventoOcorrencia[] = [
      'OPERACAO_PROGRAMADA',
      'OCORRENCIA_PATRULHAMENTO',
      'APOIO_OUTRA_UNIDADE',
    ];
    const tipos: TipoApreensao[] = ['ENTORPECENTE', 'ARMA', 'MUNICAO', 'DINHEIRO', 'VEICULO', 'OUTROS'];
    const statusPossiveis: StatusApreensao[] = ['PENDENTE_REVISAO', 'VALIDADA', 'VALIDADA', 'DEVOLVIDA'];

    for (let i = 0; i < 30; i++) {
      const binomio = escolha(binomios);
      const ponto = pontoAleatorio();
      const dataHora = dataAleatoriaUltimosMeses(12);
      const tipoEvento = escolha(tiposEvento);
      const tipoOcorrencia = escolha(tiposOcorrencia);
      const temBO = Math.random() > 0.4;

      const ocorrencia = await prisma.ocorrencia.create({
        data: {
          tipoEvento,
          tipoOcorrenciaId: tipoOcorrencia.id,
          dataHora,
          latitude: ponto.latitude,
          longitude: ponto.longitude,
          numeroBO: temBO ? `BOU-${dataHora.getFullYear()}-${String(i).padStart(4, '0')}` : null,
          criadoPorId: comandante.id,
          binomios: { create: { binomioId: binomio.id } },
        },
      });

      const tipo = escolha(tipos);
      const status = escolha(statusPossiveis);
      const localAproximado = Math.random() < 0.15;
      const valorEstimado = Math.random() < 0.7 ? Math.round(Math.random() * 50000) : null;

      const dadosEspecificos =
        tipo === 'ENTORPECENTE'
          ? {
              entorpecente: {
                create: {
                  tipoSubstanciaId: escolha(tiposSubstancia).id,
                  pesoQuantidade: Math.round(Math.random() * 5000) / 10,
                  formaAcondicionamento: escolha(['Tabletes', 'Sacos plásticos', 'Embalagem a vácuo']),
                },
              },
            }
          : tipo === 'ARMA'
            ? { arma: { create: { tipoArmaId: escolha(tiposArma).id, calibre: escolha(['.38', '.40', '12', null]) } } }
            : tipo === 'MUNICAO'
              ? { municao: { create: { calibre: escolha(['.38', '.40', '12']), quantidade: 1 + Math.floor(Math.random() * 50) } } }
              : { outro: { create: { descricao: `Apreensão de ${tipo.toLowerCase()} em ${tipoEvento.toLowerCase()}` } } };

      await prisma.apreensao.create({
        data: {
          ocorrenciaId: ocorrencia.id,
          caoId: binomio.caoId,
          binomioId: binomio.id,
          tipo,
          valorEstimado,
          latitude: ponto.latitude,
          longitude: ponto.longitude,
          localAproximado,
          horario: dataHora,
          status,
          criadoPorId: comandante.id,
          revisadoPorId: status === 'VALIDADA' || status === 'DEVOLVIDA' ? comandante.id : null,
          revisadoEm: status === 'VALIDADA' || status === 'DEVOLVIDA' ? new Date() : null,
          ...dadosEspecificos,
        },
      });
    }
    console.log('30 ocorrências/apreensões de teste criadas.');
  } else {
    console.log('Já existem apreensões para os cães de teste, pulando essa parte.');
  }

  // ---------- Saúde dos cães ----------
  const jaTemSaude = await prisma.registroSaudeCao.count({ where: { caoId: { in: caes.map((c) => c.id) } } });
  if (jaTemSaude === 0) {
    for (const cao of caes) {
      await prisma.registroSaudeCao.create({
        data: {
          caoId: cao.id,
          tipo: 'VACINA',
          descricao: 'V8 (múltipla)',
          data: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000),
          proximaData: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // vencida
          veterinario: 'Dra. Camila Souza',
          criadoPorId: comandante.id,
        },
      });
      await prisma.registroSaudeCao.create({
        data: {
          caoId: cao.id,
          tipo: 'VACINA',
          descricao: 'Antirrábica',
          data: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          proximaData: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000), // em dia
          veterinario: 'Dra. Camila Souza',
          criadoPorId: comandante.id,
        },
      });
      await prisma.registroSaudeCao.create({
        data: {
          caoId: cao.id,
          tipo: 'CONSULTA',
          descricao: 'Checkup de rotina',
          data: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          veterinario: 'Dr. Paulo Mendes',
          observacoes: 'Sem alterações.',
          criadoPorId: comandante.id,
        },
      });
    }
    console.log('Registros de saúde de teste criados.');
  } else {
    console.log('Já existem registros de saúde para os cães de teste, pulando essa parte.');
  }

  console.log('Seed de teste concluído. Usuário comandante: comandante / comandante123');
  console.log('Condutores de teste: marcossilva, julianacosta, rafaellima, brunoalves — senha: teste123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
