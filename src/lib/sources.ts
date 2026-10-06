import type { IndexMembership } from './types';

const B3_SUSTAINABILITY = 'https://www.b3.com.br/pt_br/market-data-e-indices/indices/indices-de-sustentabilidade/';
const B3_GOVERNANCE = 'https://www.b3.com.br/pt_br/market-data-e-indices/indices/indices-de-governanca/';
export const B3_SEGMENTS = 'https://www.b3.com.br/pt_br/produtos-e-servicos/solucoes-para-emissores/segmentos-de-listagem/';

export const INDEX_INFO: Record<IndexMembership, { name: string; desc: string; url: string }> = {
  'ISE B3': { name: 'Índice de Sustentabilidade Empresarial', desc: 'Carteira anual com avaliação ESG ampla, desde 2005', url: B3_SUSTAINABILITY },
  'S&P/B3 ESG': { name: 'S&P/B3 Brasil ESG', desc: 'Metodologia S&P DJI com exclusões setoriais', url: B3_SUSTAINABILITY },
  'ICO2 B3': { name: 'Índice Carbono Eficiente', desc: 'Inventário de emissões publicado; peso por eficiência de carbono', url: B3_SUSTAINABILITY },
  'IDiversa B3': { name: 'Índice de Diversidade', desc: 'Diversidade de gênero e raça na liderança e no quadro', url: B3_SUSTAINABILITY },
  'IGPTW B3': { name: 'Índice GPTW', desc: 'Empresas certificadas pelo Great Place to Work', url: B3_SUSTAINABILITY },
  ITAG: { name: 'Índice de Tag Along Diferenciado', desc: 'Proteção ao minoritário em venda de controle', url: B3_GOVERNANCE },
};
