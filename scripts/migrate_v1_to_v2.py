# -*- coding: utf-8 -*-
"""
Migração única: ranking_db.json (v1, notas digitadas à mão) -> src/data/companies.json (v2).

Na v2 o arquivo de dados guarda apenas FATOS (segmento de listagem, índices,
eventos com gravidade e status jurídico). As notas são sempre calculadas pelo
motor em src/lib/scoring.ts. Este script fica no repositório como registro
auditável de cada correção feita na migração (ver docs/AUDITORIA-v2.md).

Uso: python3 scripts/migrate_v1_to_v2.py [scripts/legacy_ranking_db_v1.json]
"""
import json
import sys

SRC = sys.argv[1] if len(sys.argv) > 1 else "scripts/legacy_ranking_db_v1.json"
OUT = "src/data/companies.json"

# --- Segmento de listagem -------------------------------------------------
# Regra dura: Novo Mercado só admite ações ON (final 3). PN (4/5/6), units (11)
# e BDRs (31-35) marcados como "Novo Mercado" na v1 foram corrigidos.
# "VERIFICAR" = segmento não confirmado; não recebe pontos de governança.
SEGMENT_OVERRIDES = {
    "ITUB4": "N1", "BBDC4": "N1", "GGBR4": "N1", "TRPL4": "N1", "BRAP4": "N1",
    "RAPT4": "N1", "CMIG4": "N1", "USIM5": "N1", "BRKM5": "N1",
    "KLBN11": "N2", "BPAC11": "N2", "ALUP11": "N2", "ENGI11": "N2",
    "TAEE11": "N2", "SANB11": "N2", "POMO4": "N2", "AZUL4": "N2",
    "PETR4": "N2", "GOLL4": "N2",
    "XPBR31": "BDR", "INBR32": "BDR",
    "IGTI11": "VERIFICAR", "CPLE6": "VERIFICAR", "CGAS5": "VERIFICAR",
    # ON retirados do Novo Mercado na v1 apenas por terem penalidades:
    "VALE3": "NM", "PCAR3": "NM", "CIEL3": "NM", "MRFG3": "NM", "CRFB3": "NM",
    "JBSS3": "NM", "IRBR3": "NM", "AMER3": "NM",
    "ELET3": "N1", "OIBR3": "N1",
    "CSNA3": "VERIFICAR", "CMIN3": "VERIFICAR",
}

# Índices mantidos como sinal positivo. IGCT (critério de liquidez) e o próprio
# "IGC — Novo Mercado" saem: o segmento já é tratado pelo campo `segment`.
KEEP_INDICES = ["ISE B3", "S&P/B3 ESG", "ICO2 B3", "IDiversa B3", "IGPTW B3", "ITAG"]

# --- Tags factuais ----------------------------------------------------------
# "Corporation" (59 empresas) foi removida: aplicada a empresas com controlador
# definido (Klabin, BTG, Energisa, Taesa, Alupar...). "Estatal" corrigida.
STATE_CONTROLLED = {"BBAS3", "BBSE3", "CXSE3", "CMIG4", "PETR4"}
EXTRA_TAGS = {
    "ITUB4": ["Holding"], "CSAN3": ["Holding"], "UGPA3": ["Holding"], "BRAP4": ["Holding"],
    "NTCO3": ["Empresa B certificada"],
    "GOLL4": ["Recuperação judicial / Chapter 11"],
    "OIBR3": ["Recuperação judicial"],
    "AMER3": ["Recuperação judicial"],
}

# Eventos societários conhecidos que podem ter alterado ticker/listagem após a
# coleta da v1. Exibidos como aviso; precisam de verificação manual.
NOTICES = {
    "SOMA3": "Grupo Soma e Arezzo&Co anunciaram fusão em 2024 (Azzas 2154). Verificar ticker atual.",
    "ARZZ3": "Arezzo&Co e Grupo Soma anunciaram fusão em 2024 (Azzas 2154). Verificar ticker atual.",
    "ENBR3": "EDP Brasil passou por OPA de cancelamento de registro em 2023. Verificar listagem.",
    "CIEL3": "Cielo passou por OPA de cancelamento de registro em 2024. Verificar listagem.",
    "RRRP3": "3R Petroleum e Enauta se combinaram em 2024 (Brava Energia). Verificar ticker atual.",
    "TRPL4": "CTEEP passou a se chamar ISA Energia Brasil. Verificar ticker atual.",
    "NTCO3": "Reorganização societária da Natura &Co em 2025. Verificar ticker atual.",
    "JBSS3": "JBS migrou a listagem principal para a NYSE em 2025. Verificar instrumento negociado na B3.",
    "BRFS3": "BRF e Marfrig anunciaram combinação de negócios em 2025. Verificar ticker atual.",
    "MRFG3": "Marfrig e BRF anunciaram combinação de negócios em 2025. Verificar ticker atual.",
    "CRFB3": "Carrefour Brasil teve operação de saída da B3 aprovada em 2025. Verificar listagem.",
    "ELET3": "Eletrobras anunciou mudança de marca em 2025. Verificar ticker atual.",
}

# --- Eventos (penalidades) -------------------------------------------------
# Cada evento v1 recebe: gravidade (1–5), status jurídico e pilares afetados.
# Status: investigacao | processo | acordo | condenacao
# review="quarentena" => não entra na nota nem é exibido até checagem com fonte
# primária (motivo registrado em `review_note`).
Q = "quarentena"
EVENT_MAP = {
    ("ITUB4", 0): dict(sev=2, status="processo", pillars=["G"]),
    ("SUZB3", 0): dict(sev=2, status="acordo", pillars=["S"]),
    ("ABEV3", 0): dict(sev=2, status="processo", pillars=["E"], review=Q,
                       note="IBAMA não é o órgão outorgante de uso de água; caso não localizado em fonte primária."),
    ("NTCO3", 0): dict(sev=2, status="investigacao", pillars=["G"]),
    ("GGBR4", 0): dict(sev=2, status="processo", pillars=["E"]),
    ("BRFS3", 0): dict(sev=3, status="processo", pillars=["S"]),
    ("BRFS3", 1): dict(sev=2, status="processo", pillars=["E"]),
    ("SANB11", 0): dict(sev=2, status="condenacao", pillars=["G"]),
    ("MGLU3", 0): dict(sev=2, status="investigacao", pillars=["G"]),
    ("VALE3", 0): dict(sev=5, status="acordo", pillars=["E", "S"], source="Governo de MG / MPMG / TJMG",
                       date="2021-02-04",
                       desc="Rompimento da barragem B1 em Brumadinho (2019), 270 mortos — acordo judicial de reparação de R$ 37,7 bi"),
    ("VALE3", 1): dict(sev=3, status="processo", pillars=["E"]),
    ("VALE3", 2): dict(sev=2, status="processo", pillars=["S"]),
    ("HAPV3", 0): dict(sev=2, status="processo", pillars=["S"]),
    ("CMIG4", 0): dict(sev=2, status="processo", pillars=["E"]),
    ("PCAR3", 0): dict(sev=2, status="processo", pillars=["S"]),
    ("COGN3", 0): dict(sev=2, status="condenacao", pillars=["S"]),
    ("USIM5", 0): dict(sev=2, status="processo", pillars=["E"]),
    ("ELET3", 0): dict(sev=2, status="processo", pillars=["E"]),
    ("ELET3", 1): dict(sev=1, status="investigacao", pillars=["G"]),
    ("CSNA3", 0): dict(sev=2, status="processo", pillars=["E"]),
    ("CSNA3", 1): dict(sev=2, status="processo", pillars=["G"]),
    ("AZUL4", 0): dict(sev=2, status="investigacao", pillars=["G"]),
    ("AZUL4", 1): dict(sev=2, status="processo", pillars=["S"]),
    ("BEEF3", 0): dict(sev=3, status="investigacao", pillars=["E"], source="MPF"),
    ("BEEF3", 1): dict(sev=2, status="processo", pillars=["S"]),
    ("PETR4", 0): dict(sev=1, status="processo", pillars=["E"], review=Q,
                       note="Indeferimento de licença não é infração ambiental; não deve penalizar."),
    ("PETR4", 1): dict(sev=3, status="condenacao", pillars=["E"], review=Q,
                       note="Não há condenação conhecida da Petrobras pelo óleo no Nordeste (2019); a origem foi atribuída a navio estrangeiro."),
    ("PETR4", 2): dict(sev=2, status="investigacao", pillars=["G"]),
    ("CMIN3", 0): dict(sev=2, status="processo", pillars=["E"]),
    ("CMIN3", 1): dict(sev=2, status="investigacao", pillars=["S"]),
    ("MRFG3", 0): dict(sev=3, status="investigacao", pillars=["E"], source="MPF"),
    ("MRFG3", 1): dict(sev=2, status="processo", pillars=["S"]),
    ("CRFB3", 0): dict(sev=4, status="acordo", pillars=["S"], source="MPRS / DPE-RS / MPT",
                       date="2021-06-11",
                       desc="Morte de João Alberto Freitas por seguranças em loja de Porto Alegre (2020) — TAC de R$ 115 mi"),
    ("CRFB3", 1): dict(sev=2, status="processo", pillars=["S"]),
    ("JBSS3", 0): dict(sev=3, status="investigacao", pillars=["E"], source="MPF"),
    ("JBSS3", 1): dict(sev=4, status="acordo", pillars=["G"], source="SEC / DOJ",
                       desc="Acordos com SEC e DOJ (EUA) por violações da FCPA ligadas a pagamentos indevidos (J&F/JBS)"),
    ("JBSS3", 2): dict(sev=2, status="processo", pillars=["S"]),
    ("IRBR3", 0): dict(sev=4, status="processo", pillars=["G"]),
    ("IRBR3", 1): dict(sev=3, status="processo", pillars=["G"], review=Q,
                       note="SUSEP não decretou intervenção no IRB; descrição incorreta, requer reformulação com fonte primária."),
    ("GOLL4", 0): dict(sev=0, status="processo", pillars=["G"], review="sinal_de_risco",
                       note="Recuperação judicial é risco financeiro, não infração socioambiental; vira tag sem pontuação."),
    ("GOLL4", 1): dict(sev=2, status="investigacao", pillars=["G"], review=Q,
                       note="Investigação da SEC não localizada em fonte primária."),
    ("OIBR3", 0): dict(sev=0, status="processo", pillars=["G"], review="sinal_de_risco",
                       note="Recuperação judicial é risco financeiro, não infração socioambiental; vira tag sem pontuação."),
    ("OIBR3", 1): dict(sev=2, status="condenacao", pillars=["S"]),
    ("AMER3", 0): dict(sev=5, status="reconhecido", pillars=["G"], date="2023-06-13",
                       desc="Fraude contábil de cerca de R$ 25 bi reconhecida pela própria empresa em fato relevante — apurada pela CVM e pela PF"),
    ("AMER3", 1): dict(sev=0, status="processo", pillars=["G"], review="sinal_de_risco",
                       note="Recuperação judicial é consequência do evento contábil já computado; vira tag sem pontuação."),
    ("AMER3", 2): dict(sev=2, status="processo", pillars=["S"]),
    ("BRKM5", 0): dict(sev=5, status="acordo", pillars=["E", "S"], source="MPF / MPAL / DPU / Município de Maceió",
                       date="2023-07-21",
                       desc="Afundamento do solo em bairros de Maceió pela extração de sal-gema — ~60 mil pessoas realocadas; acordos de reparação"),
    ("BRKM5", 1): dict(sev=3, status="processo", pillars=["E"]),
    ("BRKM5", 2): dict(sev=2, status="investigacao", pillars=["G"]),
}

# Omissões relevantes da v1 (eventos amplamente documentados).
NEW_EVENTS = {
    "VALE3": [dict(source="Justiça Federal / União / MG / ES", pillars=["E", "S"], sev=5, status="acordo",
                   date="2024-10-25", date_precision="day",
                   description="Rompimento da barragem de Fundão em Mariana (2015, via Samarco) — repactuação de R$ 170 bi",
                   link="https://www.google.com/search?q=repactua%C3%A7%C3%A3o+Mariana+acordo+170+bilh%C3%B5es")],
    "PETR4": [dict(source="SEC / DOJ", pillars=["G"], sev=4, status="acordo",
                   date="2018-09-27", date_precision="day",
                   description="Acordo com SEC e DOJ (EUA) de US$ 853 mi relacionado ao esquema investigado na Operação Lava Jato",
                   link="https://www.google.com/search?q=Petrobras+acordo+SEC+DOJ+853+milh%C3%B5es+2018")],
}

# CNPJ raiz: 8 de 25 conferidos estavam errados na v1 (ex.: VALE3 apontava
# para outra empresa). Corrigidos abaixo; os demais ficam marcados como não
# verificados até conferência no cadastro da CVM.
CNPJ_FIX = {
    "VALE3": "33592510", "ITUB4": "60872504", "WEGE3": "84429695", "JBSS3": "02916265",
    "LREN3": "92754738", "ELET3": "00001180", "BRKM5": "42150391", "AMER3": "00776574",
}
CNPJ_CONFIRMED = set(CNPJ_FIX) | {
    "PETR4", "ABEV3", "BBDC4", "BBAS3", "SUZB3", "B3SA3", "MGLU3", "GGBR4", "CSNA3",
    "EMBR3", "RENT3", "RADL3", "SBSP3", "CMIG4", "NTCO3", "KLBN11", "TOTS3",
}

SECTOR_FIX = {"Telecom": "Telecomunicações", "Construção": "Construção Civil"}


def precision(date):
    if not date:
        return None
    if date.endswith("-01-01"):
        return "year"
    if date.endswith("-01"):
        return "month"
    return "day"


def link_type(url):
    if not url:
        return "ausente"
    return "busca" if "google.com/search" in url else "primaria"


def main():
    v1 = json.load(open(SRC, encoding="utf-8"))
    out = []
    used = set()
    for c in v1["companies"]:
        t = c["ticker"]
        segment = SEGMENT_OVERRIDES.get(t)
        if segment is None:
            segment = "NM" if "IGC — Novo Mercado" in c["indices_b3"] else "VERIFICAR"

        tags = []
        if t in STATE_CONTROLLED:
            tags.append("Controle estatal")
        tags += EXTRA_TAGS.get(t, [])

        disclosures = []
        events = []
        pen_i = 0
        for e in c["evidence_log"]:
            if e["type"] == "BONUS":
                if e["source"] == "GRI" and t != "CRFB3":  # CRFB3: "GRI" era programa interno, não relatório
                    disclosures.append({"type": "GRI", "link": e.get("link")})
                elif e["source"] == "CDP":
                    disclosures.append({"type": "CDP", "grade": "B", "link": e.get("link")})
                continue
            m = EVENT_MAP[(t, pen_i)]
            used.add((t, pen_i))
            date = m.get("date", e.get("date"))
            ev = {
                "id": f"{t}-{pen_i + 1}",
                "source": m.get("source", e["source"]),
                "pillars": m["pillars"],
                "severity": m["sev"],
                "status": m["status"],
                "date": date,
                "date_precision": "day" if "date" in m else precision(date),
                "description": m.get("desc", e["description"]),
                "link": e.get("link"),
                "link_type": link_type(e.get("link")),
            }
            if "review" in m:
                ev["review"] = m["review"]
                ev["review_note"] = m["note"]
            events.append(ev)
            pen_i += 1
        for j, ne in enumerate(NEW_EVENTS.get(t, [])):
            ev = {"id": f"{t}-n{j + 1}", **ne, "severity": ne["sev"]}
            del ev["sev"]
            ev["link_type"] = link_type(ev["link"])
            events.append(ev)

        company = {
            "ticker": t,
            "name": c["name"],
            "cnpj_root": CNPJ_FIX.get(t, c["cnpj_root"]),
            "cnpj_verified": t in CNPJ_CONFIRMED,
            "sector": SECTOR_FIX.get(c["sector"], c["sector"]),
            "segment": segment,
            "indices": [i for i in KEEP_INDICES if i in c["indices_b3"] and not (i == "ITAG" and segment == "NM")],
            "disclosures": disclosures,
            "events": events,
            "tags": tags,
            "last_verified": c["last_verified"],
        }
        if t in NOTICES:
            company["notice"] = NOTICES[t]
        out.append(company)

    missing = set(EVENT_MAP) - used
    assert not missing, f"Mapeamentos sem evento correspondente: {missing}"

    data = {
        "meta": {
            "dataset_version": "2.0.0",
            "as_of": "2026-03-06",
            "methodology_version": "4.0",
            "notes": "Migrado da v1 (ranking_db.json). Ver docs/AUDITORIA-v2.md.",
        },
        "companies": sorted(out, key=lambda x: x["ticker"]),
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"{len(out)} empresas -> {OUT}")


if __name__ == "__main__":
    main()
