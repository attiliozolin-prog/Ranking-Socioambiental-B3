# Auditoria da v1 e mudanças da v2.0

Data da auditoria: outubro de 2026 · Base auditada: `ranking_db.json` v4.0 (referência 06/03/2026), hoje arquivada em `scripts/legacy_ranking_db_v1.json`.

Este documento registra **o que estava errado, o que foi corrigido e o que ainda precisa de verificação humana**. Toda correção de dado está codificada em `scripts/migrate_v1_to_v2.py`, que pode ser executado de novo para reproduzir a base v2 a partir da v1.

---

## 1. Problemas críticos encontrados

### 1.1 As notas publicadas não seguiam a fórmula publicada
A v1 dizia que a nota era `50 + Σ bônus − Σ penalidades`. Recalculando a partir do próprio evidence log, **93 de 100 notas não batiam**. Exemplos:

| Empresa | Nota publicada | Nota pela fórmula publicada |
|---|---|---|
| VALE3 | 52 | 15 |
| BRKM5 | 28 | 0 |
| JBSS3 | 35 | 0 |
| ITUB4 | 93 | 100 |

As notas tinham sido digitadas à mão. Para um projeto cuja proposta é transparência, esse é o problema mais grave.
**Na v2**, o arquivo de dados não tem mais campo de nota; toda nota é calculada pelo motor (`src/lib/scoring.ts`) e um teste garante isso.

### 1.2 Segmento de listagem impossível
O **Novo Mercado só admite ações ordinárias (ON)**. Mesmo assim, 15 papéis PN, units ou BDRs estavam marcados como Novo Mercado (ITUB4, BBDC4, SANB11, KLBN11, BPAC11, AZUL4, CGAS5, XPBR31, INBR32 e outros).
Na direção oposta, empresas ON do Novo Mercado **perderam o selo apenas por terem penalidades** (VALE3, AMER3, JBSS3, MRFG3, CRFB3, IRBR3, PCAR3, CIEL3), o que enviesava o ranking.
**Na v2**: campo `segment` explícito, com uma regra de validação que bloqueia o build se um papel não-ON for marcado como NM.

### 1.3 CNPJs errados
Dos 25 CNPJs raiz conferidos, **8 estavam errados**. O de VALE3, por exemplo, apontava para outra empresa. Isso inviabiliza qualquer cruzamento com bases do IBAMA, MTE ou CVM.
**Na v2**: os 8 foram corrigidos. Os 75 não conferidos estão marcados com `cnpj_verified: false`, isso aparece na página da empresa e reduz o indicador de confiança.

### 1.4 Afirmações factuais incorretas ou juridicamente arriscadas
| Registro v1 | Problema | Ação |
|---|---|---|
| PETR4 — "Condenação por derramamento de óleo no Nordeste (2019)" | Não há condenação conhecida da Petrobras; a origem foi atribuída a navio estrangeiro | Quarentena |
| PETR4 — "Licença da Foz do Amazonas indeferida" | Indeferimento de licença não é infração | Quarentena |
| ABEV3 — "Multa do IBAMA por consumo excessivo de água" | O IBAMA não é o órgão outorgante; caso não localizado | Quarentena |
| IRBR3 — "Intervenção pela SUSEP" | Não houve intervenção | Quarentena |
| GOLL4 — "Investigação da SEC" | Não localizada em fonte primária | Quarentena |
| CRFB3 — "Condenação por homicídio" | A empresa não foi condenada por homicídio; firmou TAC de R$ 115 mi | Reescrito como acordo |
| BRKM5 — "Condenação pelo afundamento em Maceió" | Houve acordos de reparação, não condenação | Reescrito como acordo |
| VALE3 — Brumadinho datado de 2024 | O acordo é de fevereiro de 2021 | Data corrigida |
| BEEF3, MRFG3, JBSS3 — desmatamento atribuído ao "MPT" | O órgão é o MPF | Fonte corrigida |

Registros em **quarentena** não entram na nota e não são exibidos (a página informa quantos estão em revisão).

### 1.5 Dupla contagem e critérios inadequados
- ISE B3 (+20) e S&P/B3 ESG (+12) somavam juntos, embora avaliem a mesma coisa.
- O IGCT pontuava, mas seu critério de entrada é liquidez, não governança.
- ITAG pontuava mesmo para empresas do Novo Mercado, onde o tag along de 100% já é obrigatório.
- **Recuperação judicial** (GOLL4 −40, OIBR3 −45, AMER3 −20) era tratada como penalidade socioambiental. É risco financeiro.
- Investigações tinham o mesmo peso que condenações, e um evento de 2016 pesava o mesmo que um de 2024.

### 1.6 Tags factualmente erradas
- "Estatal" aparecia em empresas privatizadas ou privadas: Sabesp (2024), Copel (2023), Eletrobras (2022), Neoenergia (Iberdrola) e Cielo.
- "Corporation" (sem controlador) aparecia em 59 empresas, incluindo várias com controlador definido (Klabin, BTG, Energisa, Taesa, Alupar). Por isso foi removida.
- Na CRFB3, um programa interno de carreira estava rotulado como "Relatório GRI".

### 1.7 Bugs de software
| Bug | Efeito | Correção |
|---|---|---|
| `new Date('2023-03-15')` | Interpreta a data como UTC; no Brasil exibia **o dia anterior** | `parseISODate` / `formatDate` com datas de calendário |
| Busca sensível a acento | "itau" não encontrava "Itaú" | Normalização Unicode (NFD) |
| `?ticker=` só destacava o card | Sem página própria por empresa | Rota `/empresa/:ticker` (links antigos redirecionam) |
| Filtros fora da URL | Não era possível compartilhar uma busca | Filtros sincronizados com a URL |
| Modal sem Esc, sem foco e sem trava de rolagem | Problema de acessibilidade | Modal substituído pela página `/metodologia` |
| Card clicável por `div onClick` | Inacessível por teclado | Links e botões semânticos |
| Textos dizendo "96" e "100" empresas | Inconsistência | Contagem derivada dos dados |
| `og:url` = `seusite.com` | Prévia de link quebrada | URL real, imagem OG própria e meta tags por página |

### 1.8 Vulnerabilidades e riscos técnicos
| Item | Risco | Correção |
|---|---|---|
| `vite.config.ts` injetava `GEMINI_API_KEY` no bundle | **Qualquer chave configurada no deploy ficaria pública** no JavaScript do site | `define` removido. Se alguma chave chegou a ser configurada na Vercel, **revogue-a** |
| Tailwind via `cdn.tailwindcss.com` em produção | Script de terceiro com acesso total à página; não recomendado para produção; lento | Tailwind v4 compilado no build |
| Google Fonts | Envia o IP de cada visitante ao Google (LGPD) | Fontes auto-hospedadas (`@fontsource`) |
| Sem cabeçalhos de segurança | Clickjacking, MIME sniffing, sem CSP | CSP estrita, HSTS, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` no `vercel.json` |
| Links externos | — | `rel="noopener noreferrer"` e `referrerPolicy="no-referrer"`; validador exige HTTPS |
| JSON-LD com `dangerouslySetInnerHTML` | Possível quebra de `</script>` | Conteúdo estático com `<` escapado |
| `scripts/data_generator.py` | Gerava dados **aleatórios** (`random.random()`), e não os dados publicados | Removido |
| Dependências desatualizadas | — | Vite 8, React 19.3, React Router 7, Vitest 5; `npm audit`: 0 vulnerabilidades |

### 1.9 Ausência de aviso legal
Um ranking que atribui notas a companhias abertas e menciona processos precisa deixar claro que **não é recomendação de investimento** (Resolução CVM nº 20/2021) e que registros sob apuração não implicam culpa. A v2 traz o aviso no rodapé, na página Sobre e em cada empresa, e exibe o status jurídico de cada registro.

---

## 2. Novo algoritmo (Metodologia v4.0)

```
Pilar (E, S, G)  = 50 + ½ × Práticas(0–100) − Σ Deduções          (0–100)
Dedução          = Gravidade × Peso do status × Decaimento(idade)
Nota final       = min( Σ Pilar × Peso de materialidade do setor , Teto )
                   0 se no Cadastro de Empregadores do MTE (Lista Suja)
```

- **Práticas reconhecidas** por pilar, sem dupla contagem (ISE e S&P/B3 ESG: conta o maior).
- **Gravidade** de 1 a 5 (−4 a −50 pontos).
- **Status jurídico**: investigação ×0,2 · processo ×0,5 · acordo/TAC ×0,75 · reconhecido pela empresa ×0,9 · condenação ×1.
- **Decaimento** por meia-vida (3 a 12 anos conforme a gravidade); catástrofes nunca caem abaixo de 50%.
- **Teto** de 40 ou 55 pontos enquanto houver controvérsia catastrófica ou muito grave ativa.
- **Materialidade setorial**: 4 perfis de peso (ex.: mineração E 45%, banco G 50%).
- **Data de referência fixa** (`meta.as_of`): a mesma base sempre gera a mesma nota.
- **Indicador de confiança** por empresa: CNPJ conferido, segmento confirmado, fontes primárias, eventos societários pendentes.

Tudo isso está em `src/lib/methodology.ts`, que também gera a página `/metodologia`.

### Efeito no ranking
- Maiores quedas: VALE3 52→30, ITUB4 93→80 (é Nível 1, não Novo Mercado), BBDC4 92→82, WEGE3 91→82.
- Maiores altas: IRBR3 35→59, GOLL4 33→54, JBSS3 35→55, OIBR3 33→51, PETR4 42→55. Os motivos são recuperação judicial deixar de ser penalidade, investigações pesarem menos, registros incorretos irem para quarentena e o Novo Mercado ser restituído.
- Tetos aplicados: AMER3 (40), PETR4 (55), JBSS3 (55).

> As altas de JBSS3, MRFG3 e BEEF3 refletem principalmente que os registros de desmatamento da v1 estão como **investigação** e sem fonte primária. Se houver autos de infração ou condenações documentadas (por exemplo, autuações do IBAMA por compra de gado de áreas embargadas), registrá-los com o status correto deve reduzir essas notas. É a prioridade nº 1 de pesquisa.

---

## 3. Pendências que exigem verificação humana

O validador (`npm run validate -- --verbose`) lista cada item.

1. **43 controvérsias sem fonte primária**: todas apontam para buscas no Google. Substituir pelo link do auto de infração, da decisão ou do fato relevante.
2. **75 CNPJs não conferidos** no cadastro da CVM.
3. **5 segmentos em verificação**: IGTI11, CPLE6, CGAS5, CSNA3, CMIN3.
4. **12 eventos societários** que podem ter mudado ticker ou listagem desde a coleta: Azzas 2154 (SOMA3/ARZZ3), EDP (ENBR3), Cielo (CIEL3), Brava (RRRP3), ISA Energia (TRPL4), Natura (NTCO3), JBS (JBSS3), BRF+Marfrig (BRFS3/MRFG3), Carrefour (CRFB3) e Eletrobras (ELET3). A página de cada empresa mostra o aviso.
5. **5 registros em quarentena**: confirmar com fonte primária ou excluir definitivamente.
6. **Composição dos índices** (ISE, ICO2, IDiversa etc.) muda todo ano: atualizar com as carteiras vigentes.
7. **Cobertura de controvérsias**: há 43 registros para 100 empresas. Recomenda-se uma varredura sistemática por CNPJ nas bases públicas (IBAMA: autos de infração e áreas embargadas; MTE: Cadastro de Empregadores; CVM: processos sancionadores; CADE: processos administrativos).

---

## 4. Próximos passos recomendados
- **Pipeline de coleta automatizada** por CNPJ (dados abertos do IBAMA, da CVM e do MTE) gerando eventos com `link_type: "primaria"`.
- **Histórico por edição** (`src/data/editions/AAAA-MM.json`) para mostrar a evolução da nota.
- **Revisão por pares** dos registros de gravidade ≥ 4 antes de cada publicação.
- **Direito de resposta**: canal para as empresas contestarem registros com documentação.
