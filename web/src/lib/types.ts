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

export interface Cao {
  id: string;
  nome: string;
  raca: string;
  sexo: 'MACHO' | 'FEMEA';
  status: string;
  especialidade: Lookup;
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
  horario: string;
  fotos?: string[];
  entorpecente?: { tipoSubstanciaId: string; pesoQuantidade: number; formaAcondicionamento: string };
  arma?: { tipoArmaId: string; calibre?: string; marca?: string; numeracao?: string };
  municao?: { calibre: string; quantidade: number };
  outro?: { descricao: string };
}

// Registro de campo: a tela de "nova apreensão" cria a ocorrência e a
// apreensão juntas, num único gesto do condutor (ver blueprint seção 5.1).
export interface RegistroCampoPayload {
  caoId: string;
  binomioId: string;
  tipoEvento: TipoEventoOcorrencia;
  tipoOcorrenciaId: string;
  numeroBO?: string;
  apreensao: Omit<ApreensaoPayload, 'ocorrenciaId' | 'caoId' | 'binomioId'>;
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
