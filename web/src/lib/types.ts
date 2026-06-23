export type PerfilUsuario = 'CONDUTOR' | 'COMANDANTE' | 'ADMIN';

export type TipoApreensao = 'ENTORPECENTE' | 'ARMA' | 'MUNICAO' | 'DINHEIRO' | 'VEICULO' | 'OUTROS';

export type StatusApreensao = 'RASCUNHO' | 'PENDENTE_REVISAO' | 'VALIDADA' | 'DEVOLVIDA';

export type TipoEventoOcorrencia =
  | 'OPERACAO_PROGRAMADA'
  | 'OCORRENCIA_PATRULHAMENTO'
  | 'APOIO_OUTRA_UNIDADE';

export interface SessaoUsuario {
  id: string;
  username: string;
  perfil: PerfilUsuario;
  condutor?: { id: string; nomeGuerra: string } | null;
}

export interface Lookup {
  id: string;
  nome: string;
  ativo: boolean;
}

export type TipoRegistroSaude = 'VACINA' | 'CONSULTA' | 'EXAME' | 'OUTRO';

export interface RegistroSaude {
  id: string;
  caoId: string;
  tipo: TipoRegistroSaude;
  descricao: string;
  data: string;
  proximaData: string | null;
  veterinario: string | null;
  observacoes: string | null;
  createdAt: string;
}

export interface Cao {
  id: string;
  nome: string;
  raca: string;
  sexo: 'MACHO' | 'FEMEA';
  dataNascimento?: string;
  registro?: string;
  status: string;
  especialidade: Lookup;
  // Lista resumida (geralmente só a última vacina) vinda do endpoint de
  // listagem, pra sinalizar vacina vencida sem carregar o histórico todo.
  registrosSaude?: RegistroSaude[];
}

export interface Binomio {
  id: string;
  condutorId: string;
  caoId: string;
  dataInicio: string;
  dataFim: string | null;
  condutor?: { id: string; nomeGuerra: string };
  cao?: Cao;
}

export interface Ocorrencia {
  id: string;
  tipoEvento: TipoEventoOcorrencia;
  tipoOcorrencia: Lookup;
  dataHora: string;
  latitude: number;
  longitude: number;
  numeroBO?: string | null;
}

export interface ApreensaoPayload {
  ocorrenciaId: string;
  caoId: string;
  binomioId: string;
  tipo: TipoApreensao;
  valorEstimado?: number;
  latitude: number;
  longitude: number;
  // true quando o local foi ajustado manualmente (registro tardio, fora
  // do local/momento da ocorrência) em vez de capturado por GPS.
  localAproximado?: boolean;
  horario: string;
  fotos?: string[];
  entorpecente?: { tipoSubstanciaId: string; pesoQuantidade: number; formaAcondicionamento: string };
  arma?: { tipoArmaId: string; calibre?: string; marca?: string; numeracao?: string };
  municao?: { calibre: string; quantidade: number };
  outro?: { descricao: string };
}

// Registro de campo: a tela de "nova apreensão" cria a ocorrência e a(s)
// apreensão(ões) juntas, num único gesto do condutor (ver blueprint seção
// 5.1). Uma mesma ocorrência pode render mais de um item (ex.: arma,
// veículo e entorpecente apreendidos juntos), por isso é uma lista.
export interface RegistroCampoPayload {
  caoId: string;
  binomioId: string;
  tipoEvento: TipoEventoOcorrencia;
  tipoOcorrenciaId: string;
  numeroBO?: string;
  apreensoes: Omit<ApreensaoPayload, 'ocorrenciaId' | 'caoId' | 'binomioId'>[];
}

export interface Apreensao extends Omit<ApreensaoPayload, 'fotos'> {
  id: string;
  status: StatusApreensao;
  createdAt: string;
  cao: Cao;
  binomio: Binomio;
  ocorrencia: Ocorrencia;
  fotos: { id: string; url: string }[];
}

export interface LogAuditoria {
  id: string;
  userId: string;
  acao: string;
  entidade: string;
  entidadeId: string;
  detalhes: Record<string, unknown> | null;
  createdAt: string;
  user: { username: string; perfil: PerfilUsuario };
}
