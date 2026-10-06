# -*- coding: utf-8 -*-
"""
Curadoria — edição de outubro/2026: checagem de fontes primárias.

Cada controvérsia herdada da v1 foi procurada em fonte oficial (B3, CVM, CADE,
MPF, STF, SEC, governo estadual). Resultado:
  - confirmada  -> link primário, data e descrição corrigidas
  - não localizada -> quarentena com o motivo (fora da nota e da exibição)
Também foram incluídos casos graves documentados que faltavam na base.

Idempotente: pode ser rodado de novo sem duplicar eventos.
Uso: python3 scripts/curation/2026-10_checagem_fontes.py
"""
import json
from pathlib import Path

DATA = Path(__file__).resolve().parents[2] / "src" / "data" / "companies.json"

NOT_FOUND = "Não localizado em fonte oficial na checagem de out/2026 (descrição vaga, sem número de processo ou data precisa)."

UPDATES = {
    "VALE3-1": dict(
        link="https://www.transparencia.mg.gov.br/eventos-extraordinarios/acordo-judicial/acordo-judicial-reparacao-vale",
        link_type="primaria",
        source="Governo de MG / MPMG / MPF / DPMG",
        description="Rompimento das barragens da Mina Córrego do Feijão em Brumadinho (2019), 270 mortos — acordo judicial de reparação de R$ 37,7 bi",
    ),
    "VALE3-n1": dict(
        link="https://noticias.stf.jus.br/postsnoticias/presidente-do-stf-homologa-acordo-para-reparacao-de-danos-causados-pela-tragedia-em-mariana-mg/",
        link_type="primaria",
        source="STF / União / MG / ES",
        description="Rompimento da barragem de Fundão em Mariana (2015, via Samarco) — acordo de repactuação de R$ 170 bi homologado pelo STF",
    ),
    "PETR4-n1": dict(
        link="https://www.sec.gov/newsroom/press-releases/2018-215",
        link_type="primaria",
        description="Acordos com SEC e DOJ (EUA): US$ 1,78 bi, incluindo multa de US$ 853 mi, por demonstrações financeiras que ocultaram o esquema de corrupção investigado na Lava Jato",
    ),
    "IRBR3-1": dict(
        link="https://www.gov.br/cvm/pt-br/assuntos/noticias/2025/cvm-inicia-julgamento-de-processo-envolvendo-ex-diretores-da-irb-2013-brasil-resseguros-s-a",
        link_type="primaria",
        severity=3,
        date="2020-01-01",
        date_precision="year",
        description="PAS CVM 19957.003612/2020-35 contra 11 ex-administradores: divulgação de informação falsa e seletiva e irregularidades nas demonstrações de 2019 (julgamento em curso)",
    ),
    "ITUB4-1": dict(
        link="https://www.gov.br/cade/pt-br/assuntos/noticias/cade-mantem-medida-preventiva-aplicada-ao-itau",
        link_type="primaria",
        date="2026-03-19",
        date_precision="day",
        status="investigacao",
        description="Inquérito do CADE sobre barreiras a carteiras digitais concorrentes; medida preventiva mantida pelo Tribunal, com multa diária de R$ 250 mil em caso de descumprimento",
    ),
}

QUARANTINE = {
    "AXIA3": ["ELET3-1", "ELET3-2"],
    "BEEF3": ["BEEF3-1", "BEEF3-2"],
    "CMIG4": ["CMIG4-1"],
    "CMIN3": ["CMIN3-1", "CMIN3-2"],
    "COGN3": ["COGN3-1"],
    "CSNA3": ["CSNA3-1", "CSNA3-2"],
    "GGBR4": ["GGBR4-1"],
    "HAPV3": ["HAPV3-1"],
    "MBRF3": ["MRFG3-1", "MRFG3-2", "BRFS3-1", "BRFS3-2"],
    "MGLU3": ["MGLU3-1"],
    "NATU3": ["NTCO3-1"],
    "PETR4": ["PETR4-3"],
    "SANB11": ["SANB11-1"],
    "SUZB3": ["SUZB3-1"],
    "USIM5": ["USIM5-1"],
    "VALE3": ["VALE3-2", "VALE3-3"],
}
QUARANTINE_NOTES = {
    "ELET3-2": "Apontamentos do TCU sobre o processo de privatização não são conduta da empresa.",
    "BEEF3-1": "Contraditado por auditoria supervisionada pelo MPF (TAC da Carne) com 100% de conformidade na Amazônia.",
    "MRFG3-1": "Afirmação sobre o Cerrado sem fonte; auditoria supervisionada pelo MPF (TAC da Carne) aponta 100% de conformidade na Amazônia.",
    "CSNA3-2": "Não há processo do CADE sobre cartel de cimento envolvendo a CSN localizado; o cartel julgado em 2014 envolveu outras cimenteiras.",
    "SANB11-1": "Não localizada condenação do CADE ao Santander por tarifas bancárias.",
}

NEW_EVENTS = {
    "EMBJ3": [dict(
        id="EMBJ3-n1", source="SEC / DOJ / MPF", pillars=["G"], severity=4, status="acordo",
        date="2016-10-24", date_precision="day",
        description="Acordo global de US$ 205 mi com SEC, DOJ e autoridades brasileiras por pagamento de propina a agentes públicos estrangeiros (FCPA)",
        link="https://www.sec.gov/newsroom/press-releases/2016-224", link_type="primaria",
    )],
    "MOTV3": [dict(
        id="MOTV3-n1", source="MPF-PR (Operação Integração)", pillars=["G"], severity=4, status="reconhecido",
        date="2019-03-06", date_precision="day",
        description="Acordo de leniência de R$ 750 mi da controlada Rodonorte, que reconheceu pagamento de propina para obter aditivos favoráveis em concessões de rodovias no Paraná",
        link="https://apps.mpf.mp.br/apps/f?p=131%3A8", link_type="primaria",
    )],
    "ECOR3": [dict(
        id="ECOR3-n1", source="MPF-PR (Operação Integração)", pillars=["G"], severity=4, status="reconhecido",
        date="2019-08-12", date_precision="day",
        description="Acordo de leniência de R$ 400 mi (Ecovia e Ecocataratas): a empresa reconheceu pagamento de propina para obter aditivos em concessões de rodovias no Paraná",
        link="https://apps.mpf.mp.br/apps/f?p=131%3A8", link_type="primaria",
    )],
}

COVERAGE_NOTE = "Empresa nova no universo (IBrX 100): controvérsias ainda não pesquisadas sistematicamente."
NEW_IN_UNIVERSE = {
    "ALOS3", "ALPA4", "ANIM3", "SAUD3", "CBAV3", "CEAB3", "CSMG3", "CURY3", "CVCB3", "DIRR3", "ECOR3", "EZTC3",
    "GOAU4", "GGPS3", "ITSA4", "JHSF3", "MOTV3", "MDNE3", "ORVR3", "PGMN3", "PLPL3", "SAPR11", "SIMH3", "TEND3",
}


def main():
    data = json.loads(DATA.read_text(encoding="utf-8"))
    by_ticker = {c["ticker"]: c for c in data["companies"]}
    n_upd = n_q = n_new = 0
    for c in data["companies"]:
        for e in c["events"]:
            if e["id"] in UPDATES:
                e.update(UPDATES[e["id"]])
                e.pop("review", None)
                e.pop("review_note", None)
                n_upd += 1
        for eid in QUARANTINE.get(c["ticker"], []):
            ev = next(e for e in c["events"] if e["id"] == eid)
            if ev.get("review") != "quarentena":
                ev["review"] = "quarentena"
                ev["review_note"] = QUARANTINE_NOTES.get(eid, NOT_FOUND)
                n_q += 1
        if c["ticker"] in NEW_IN_UNIVERSE:
            c["coverage_note"] = COVERAGE_NOTE
    for t, evs in NEW_EVENTS.items():
        c = by_ticker[t]
        ids = {e["id"] for e in c["events"]}
        for ev in evs:
            if ev["id"] not in ids:
                c["events"].append(ev)
                n_new += 1
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"atualizados {n_upd} · quarentena {n_q} · novos {n_new}")


if __name__ == "__main__":
    main()
