import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const DOURADO: [number, number, number] = [201, 162, 39];
const PRETO: [number, number, number] = [20, 20, 18];

interface DadosRelatorio {
  periodoRotulo: string;
  totalApreensoes: number;
  valorTotalFormatado: string;
  caoDestaque: string;
  binomioDestaque: string;
  porTipo: [string, number][];
  porEvento: [string, number][];
  rankingCaes: [string, number][];
  rankingBinomios: [string, number][];
  evolucaoMensal: { rotulo: string; total: number }[];
}

export function gerarRelatorioPdf(dados: DadosRelatorio) {
  const doc = new jsPDF();
  const dataGeracao = new Date().toLocaleString('pt-BR');

  doc.setFontSize(16);
  doc.setTextColor(...PRETO);
  doc.text('Canil 3º BPM — Relatório de Indicadores', 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Período: ${dados.periodoRotulo} · Gerado em ${dataGeracao}`, 14, 25);

  autoTable(doc, {
    startY: 32,
    head: [['Indicador', 'Valor']],
    body: [
      ['Total de apreensões', String(dados.totalApreensoes)],
      ['Valor estimado apreendido', dados.valorTotalFormatado],
      ['Cão destaque', dados.caoDestaque],
      ['Binômio destaque', dados.binomioDestaque],
    ],
    headStyles: { fillColor: DOURADO, textColor: PRETO },
    styles: { fontSize: 10 },
  });

  const proximaSecao = (titulo: string, linhas: [string, string][], y: number) => {
    doc.setFontSize(12);
    doc.setTextColor(...PRETO);
    doc.text(titulo, 14, y);
    autoTable(doc, {
      startY: y + 3,
      head: [['Item', 'Total']],
      body: linhas,
      headStyles: { fillColor: DOURADO, textColor: PRETO },
      styles: { fontSize: 9 },
      margin: { top: y + 3 },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (doc as any).lastAutoTable.finalY + 10;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let y = (doc as any).lastAutoTable.finalY + 10;

  y = proximaSecao(
    'Apreensões por tipo',
    dados.porTipo.map(([k, v]) => [k, String(v)]),
    y,
  );
  y = proximaSecao(
    'Operações x ocorrências',
    dados.porEvento.map(([k, v]) => [k, String(v)]),
    y,
  );
  y = proximaSecao(
    'Ranking por cão',
    dados.rankingCaes.map(([k, v]) => [k, String(v)]),
    y,
  );
  y = proximaSecao(
    'Ranking por binômio',
    dados.rankingBinomios.map(([k, v]) => [k, String(v)]),
    y,
  );
  proximaSecao(
    'Evolução mensal (últimos 12 meses)',
    dados.evolucaoMensal.map((m) => [m.rotulo, String(m.total)]),
    y,
  );

  doc.save(`relatorio-canil-3bpm-${new Date().toISOString().slice(0, 10)}.pdf`);
}
