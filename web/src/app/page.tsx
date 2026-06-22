import AcessarLink from './acessar-link';
import {
  IconArrowRight,
  IconClock,
  IconFootprint,
  IconMap,
  IconNose,
  IconPaw,
  IconShield,
  IconTarget,
} from './icons';

const NAV = [
  { href: '#sobre', rotulo: 'Sobre o canil' },
  { href: '#operacoes', rotulo: 'Operações' },
  { href: '#treinamento', rotulo: 'Treinamento' },
  { href: '#equipe', rotulo: 'Equipe' },
  { href: '#contato', rotulo: 'Contato' },
];

const ESPECIALIDADES = [
  { icone: IconNose, titulo: 'Faro de entorpecentes', texto: 'Detecção de substâncias ilícitas em veículos, cargas e ambientes.' },
  { icone: IconShield, titulo: 'Faro de explosivos', texto: 'Varredura e identificação de artefatos em apoio a operações de risco.' },
  { icone: IconFootprint, titulo: 'Busca e captura', texto: 'Rastreamento e localização de suspeitos em fuga.' },
  { icone: IconTarget, titulo: 'Busca e salvamento', texto: 'Localização de pessoas desaparecidas em apoio à comunidade.' },
];

const OPERACOES = [
  { titulo: 'Patrulhamento tático', texto: 'Presença estratégica e preventiva em áreas urbanas e rurais, com o binômio condutor + cão atuando lado a lado.' },
  { titulo: 'Operações programadas', texto: 'Ações planejadas com equipe e cão de especialidade definida conforme o objetivo da missão.' },
  { titulo: 'Apoio a outras unidades', texto: 'Reforço especializado do canil a outras frações da corporação quando demandado.' },
  { titulo: 'Ocorrências de campo', texto: 'Atuação imediata em ocorrências de patrulhamento, com registro estruturado de cada apreensão.' },
];

const TREINAMENTOS = [
  { numero: '01', titulo: 'Adestramento', texto: 'Desenvolvimento das habilidades básicas e comportamentais do binômio.' },
  { numero: '02', titulo: 'Condicionamento', texto: 'Preparação física e resistência para missões exigentes.' },
  { numero: '03', titulo: 'Obediência', texto: 'Respostas rápidas e precisas a comandos e sinais do condutor.' },
  { numero: '04', titulo: 'Faro', texto: 'Aprimoramento do olfato e discriminação de odores por especialidade.' },
  { numero: '05', titulo: 'Ambientação', texto: 'Exposição a cenários reais para desempenho consistente em campo.' },
];

const EQUIPE = [
  { funcao: 'Comandante do Pelotão', especialidade: 'Gestão e coordenação operacional' },
  { funcao: 'Condutor', especialidade: 'Faro de entorpecentes' },
  { funcao: 'Condutor', especialidade: 'Patrulhamento e busca/captura' },
  { funcao: 'Condutor', especialidade: 'Busca e salvamento' },
];

export default function Home() {
  return (
    <div className="flex-1 bg-canil-bg text-canil-text">
      <header className="sticky top-0 z-20 border-b border-canil-border/60 bg-canil-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <IconShield className="h-7 w-7 text-canil-gold" />
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-widest text-canil-text">CANIL</p>
              <p className="text-xs tracking-widest text-canil-gold">3º BPM</p>
            </div>
          </div>

          <nav className="hidden gap-6 md:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-xs font-medium tracking-wide text-canil-text-muted hover:text-canil-gold"
              >
                {item.rotulo.toUpperCase()}
              </a>
            ))}
          </nav>

          <AcessarLink className="rounded border border-canil-gold px-4 py-2 text-xs font-semibold tracking-wide text-canil-gold hover:bg-canil-gold hover:text-canil-bg">
            ACESSAR SISTEMA
          </AcessarLink>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="border-b border-canil-border/60 px-4 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 flex items-center justify-center gap-2 text-xs font-semibold tracking-widest text-canil-gold">
              <span className="h-px w-6 bg-canil-gold" /> POLÍCIA MILITAR · 3º BPM
            </p>
            <h1 className="text-5xl font-extrabold tracking-tight text-canil-text sm:text-6xl">
              CANIL <span className="text-canil-gold">TÁTICO</span>
            </h1>
            <p className="mt-4 text-sm uppercase tracking-widest text-canil-text-muted">
              Disciplina, lealdade e precisão em cada missão
            </p>
            <p className="mx-auto mt-6 max-w-xl text-sm text-canil-text-muted">
              Pelotão especializado em faro, busca, patrulhamento e apoio operacional. Cada
              apreensão registrada em campo fica vinculada ao cão e ao binômio responsável,
              gerando dados confiáveis para o comando.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <a
                href="#contato"
                className="rounded bg-canil-gold px-6 py-3 text-xs font-bold tracking-wide text-canil-bg"
              >
                SOLICITAR APOIO OPERACIONAL
              </a>
              <a
                href="#sobre"
                className="flex items-center gap-2 text-xs font-semibold tracking-wide text-canil-text-muted hover:text-canil-gold"
              >
                CONHECER O CANIL <IconArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Sobre */}
        <section id="sobre" className="border-b border-canil-border/60 px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-canil-gold">
              <span className="h-px w-6 bg-canil-gold" /> SOBRE O CANIL
            </p>
            <h2 className="mt-2 max-w-md text-3xl font-bold leading-tight text-canil-text">
              COMPROMISSO COM A VIDA E COM A MISSÃO
            </h2>
            <p className="mt-4 max-w-md text-sm text-canil-text-muted">
              O canil atua lado a lado com o efetivo nas missões mais críticas. Cada binômio
              (condutor + cão) é preparado para oferecer respostas rápidas, eficientes e seguras
              à sociedade, dentro de uma das especialidades abaixo.
            </p>

            <div className="mt-10 grid gap-px overflow-hidden rounded border border-canil-border bg-canil-border sm:grid-cols-2 lg:grid-cols-4">
              {ESPECIALIDADES.map(({ icone: Icone, titulo, texto }) => (
                <div key={titulo} className="bg-canil-bg-elevated p-6">
                  <Icone className="h-8 w-8 text-canil-gold" />
                  <p className="mt-4 text-sm font-bold tracking-wide text-canil-text">
                    {titulo.toUpperCase()}
                  </p>
                  <p className="mt-2 text-xs text-canil-text-muted">{texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Operações */}
        <section id="operacoes" className="border-b border-canil-border/60 px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-canil-gold">
              <span className="h-px w-6 bg-canil-gold" /> OPERAÇÕES
            </p>
            <h2 className="mt-2 text-3xl font-bold text-canil-text">FRENTES DE ATUAÇÃO</h2>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {OPERACOES.map((op) => (
                <div
                  key={op.titulo}
                  className="flex flex-col justify-between rounded border border-canil-border bg-canil-bg-elevated p-5"
                >
                  <div>
                    <IconPaw className="h-6 w-6 text-canil-gold" />
                    <p className="mt-3 text-sm font-bold tracking-wide text-canil-text">
                      {op.titulo.toUpperCase()}
                    </p>
                    <p className="mt-2 text-xs text-canil-text-muted">{op.texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Treinamento */}
        <section id="treinamento" className="border-b border-canil-border/60 px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-canil-gold">
              <span className="h-px w-6 bg-canil-gold" /> TREINAMENTO
            </p>
            <h2 className="mt-2 text-3xl font-bold text-canil-text">PREPARO CONTÍNUO DO BINÔMIO</h2>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {TREINAMENTOS.map((t) => (
                <div key={t.numero} className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-canil-gold text-sm font-bold text-canil-gold">
                    {t.numero}
                  </div>
                  <p className="mt-3 text-sm font-bold tracking-wide text-canil-text">
                    {t.titulo.toUpperCase()}
                  </p>
                  <p className="mt-1 text-xs text-canil-text-muted">{t.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Equipe */}
        <section id="equipe" className="border-b border-canil-border/60 px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-canil-gold">
              <span className="h-px w-6 bg-canil-gold" /> EQUIPE
            </p>
            <h2 className="mt-2 text-3xl font-bold text-canil-text">BINÔMIOS E COMANDO</h2>
            <p className="mt-2 max-w-md text-xs text-canil-text-muted">
              Estrutura de funções do pelotão — nomes e fotos do efetivo entram aqui conforme o
              cadastro do comando.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {EQUIPE.map((membro, i) => (
                <div key={i} className="rounded border border-canil-border bg-canil-bg-elevated p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-canil-border text-canil-gold">
                    <IconShield className="h-6 w-6" />
                  </div>
                  <p className="mt-3 text-sm font-bold tracking-wide text-canil-text">{membro.funcao}</p>
                  <p className="text-xs text-canil-text-muted">{membro.especialidade}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contato */}
        <section id="contato" className="px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-canil-gold">
              <span className="h-px w-6 bg-canil-gold" /> CONTATO
            </p>
            <h2 className="mt-2 text-3xl font-bold text-canil-text">SOLICITAR APOIO OPERACIONAL</h2>
            <p className="mt-4 max-w-md text-sm text-canil-text-muted">
              Para solicitar apoio do canil ou tratar de assuntos administrativos, utilize os
              canais oficiais do 3º BPM. Os dados de contato definitivos do pelotão entram aqui
              quando aprovados pelo comando.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded border border-canil-border bg-canil-bg-elevated p-4">
                <IconMap className="h-5 w-5 shrink-0 text-canil-gold" />
                <div>
                  <p className="text-xs font-bold tracking-wide text-canil-text">SEDE DO PELOTÃO</p>
                  <p className="text-xs text-canil-text-muted">Endereço a definir pelo comando.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded border border-canil-border bg-canil-bg-elevated p-4">
                <IconClock className="h-5 w-5 shrink-0 text-canil-gold" />
                <div>
                  <p className="text-xs font-bold tracking-wide text-canil-text">ATENDIMENTO</p>
                  <p className="text-xs text-canil-text-muted">Canal oficial a divulgar pelo 3º BPM.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-canil-border/60 px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-canil-text-muted sm:flex-row">
          <div className="flex items-center gap-2">
            <IconShield className="h-4 w-4 text-canil-gold" />
            <span>Canil 3º BPM · Polícia Militar</span>
          </div>
          <span className="tracking-widest">DISCIPLINA · LEALDADE · PRECISÃO</span>
        </div>
      </footer>
    </div>
  );
}
