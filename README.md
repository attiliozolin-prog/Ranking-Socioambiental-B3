# Ranking Socioambiental B3

Ranking independente e auditável de responsabilidade socioambiental das empresas do IBrX 100. Cada nota é **calculada** a partir de fatos públicos (índices da B3, segmento de listagem e registros de órgãos como IBAMA, MPT, MTE, CVM e CADE), e a conta completa aparece na página de cada empresa.

🌐 https://ranking-socioambiental-b3.vercel.app

> Conteúdo informativo. Não é recomendação de investimento nem relatório de análise (Resolução CVM nº 20/2021).

## O que há na v2.0
- **Motor de score determinístico** (`src/lib/scoring.ts`) com pilares E/S/G, materialidade setorial, controvérsias ponderadas por status jurídico e tempo, e tetos para casos graves.
- **Metodologia como código** (`src/lib/methodology.ts`): a mesma configuração calcula as notas e gera a página `/metodologia`.
- **Páginas por empresa** com a conta aberta, linha do tempo de controvérsias, comparação setorial e indicador de confiança.
- **Comparador** de até 4 empresas, com link compartilhável.
- **Validação de dados** que bloqueia o build (regras como "Novo Mercado só admite ON", datas, links HTTPS, CNPJ).
- Acessibilidade, tema claro/escuro, layout responsivo, CSP e cabeçalhos de segurança, fontes auto-hospedadas.

Veja o que mudou e por quê em [`docs/AUDITORIA-v2.md`](docs/AUDITORIA-v2.md).

## Rodando localmente
Requer Node.js 20.19+.

```bash
npm install
npm run dev        # http://localhost:3000
```

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run validate` | Valida `src/data/companies.json` (use `-- --verbose` para listar cada aviso) |
| `npm test` | Testes do motor, da busca, da formatação e do dataset |
| `npm run typecheck` | Checagem de tipos (TypeScript estrito) |
| `npm run build` | Valida, checa tipos, compila e gera páginas estáticas por empresa e `sitemap.xml` |
| `npm run check` | Valida, checa tipos e roda os testes (o mesmo que a CI) |
| `npm run sync` | Atualiza universo, índices, CNPJ e segmento (B3 + CVM) e autos do IBAMA |
| `npm run snapshot` | Congela as notas da edição em `src/data/editions/` |

## Estrutura
```
src/
  data/companies.json   # FATOS — nenhuma nota é digitada aqui
  lib/methodology.ts    # pesos, faixas, tetos, perfis setoriais (fonte única)
  lib/scoring.ts        # motor de cálculo (puro e testado)
  lib/validate.ts       # regras de integridade do dataset
  pages/                # Ranking, Empresa, Comparar, Metodologia, Sobre
scripts/
  validate-data.ts      # CLI de validação
  postbuild.ts          # HTML com meta tags por empresa + sitemap
  migrate_v1_to_v2.py   # registro auditável da migração da v1
  sync_official_data.py # B3 (IBrX 100, índices) + CVM (CNPJ, segmento)
  sync_ibama.py         # autos de infração do IBAMA por CNPJ
  curation/             # decisões de curadoria por edição
docs/AUDITORIA-v2.md    # achados da auditoria e pendências
```

## Como atualizar os dados
Dados oficiais (universo, índices, CNPJ, segmento, autos do IBAMA) são coletados por `npm run sync` — uma GitHub Action faz isso toda segunda-feira e abre um PR. Controvérsias de outras fontes são curadas à mão:

1. Edite `src/data/companies.json`. Para um novo registro, use o formato:
   ```json
   {
     "id": "VALE3-5",
     "source": "IBAMA",
     "pillars": ["E"],
     "severity": 3,
     "status": "processo",
     "date": "2025-08-14",
     "date_precision": "day",
     "description": "Auto de infração por …",
     "link": "https://…/documento-oficial",
     "link_type": "primaria"
   }
   ```
   - `severity`: 1 leve · 2 moderada · 3 grave · 4 muito grave · 5 catastrófica
   - `status`: `investigacao` · `processo` · `acordo` · `reconhecido` · `condenacao`
   - `link_type`: `primaria` (documento oficial) ou `busca` (provisório)
2. Atualize `last_verified` da empresa e, para uma nova edição, `meta.as_of`.
3. Rode `npm run check`. O build falha se alguma regra for violada.

Correções de terceiros: abra uma issue com a **fonte primária**.

## Deploy
A Vercel publica automaticamente a cada push na branch `main` (o build roda `npm run build`). Cabeçalhos de segurança e rewrites ficam em `vercel.json`.

## Licença e uso
Código aberto. Os dados são compilados de fontes públicas e podem conter imprecisões; registros sob apuração são apresentados com seu status jurídico, sem presunção de culpa.
