# -*- coding: utf-8 -*-
"""
Sincroniza src/data/companies.json com fontes oficiais (sem dependências externas).

  B3  — composição do dia dos índices IBrX 100 (universo do ranking), ISE B3,
        ICO2 B3, IDiversa B3, IGPTW B3 e ITAG, e o segmento de listagem.
  CVM — Formulário Cadastral (FCA, dados abertos): CNPJ de cada valor mobiliário.

O que é OFICIAL é sobrescrito a cada execução (universo, ticker, segmento,
índices, CNPJ). O que é CURADO é preservado (setor, eventos, tags, divulgações,
avisos), casado pelo CNPJ raiz — assim uma troca de ticker (ex.: EMBR3 -> EMBJ3)
não perde o histórico.

Uso:
  python3 scripts/sync_official_data.py            # baixa tudo e grava
  python3 scripts/sync_official_data.py --dry-run  # só mostra o que mudaria

Universo: empresas com ao menos uma ação no IBrX 100 na data da execução. Quando
uma empresa tem mais de uma classe na carteira (ex.: ITUB3 e ITUB4), vale a de
maior participação.
"""
import base64
import csv
import datetime as dt
import io
import json
import sys
import urllib.request
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "src" / "data" / "companies.json"
UA = {"User-Agent": "ranking-socioambiental-b3/2.0 (+https://ranking-socioambiental-b3.vercel.app)"}

B3_INDEX = {  # código B3 -> nome usado no dataset
    "ISEE": "ISE B3",
    "ICO2": "ICO2 B3",
    "IDVR": "IDiversa B3",
    "GPTW": "IGPTW B3",
    "ITAG": "ITAG",
}
SEGMENT_FROM_B3 = {"NM": "NM", "N2": "N2", "N1": "N1"}

# Setor de empresas que entram no universo pela primeira vez (curadoria).
# Se o script encontrar uma empresa nova sem setor aqui, ele para e avisa.
NEW_SECTORS = {
    "ALOS3": "Imobiliário", "ALPA4": "Bens de Consumo", "ANIM3": "Educação", "SAUD3": "Saúde",
    "CBAV3": "Materiais", "CEAB3": "Varejo", "CSMG3": "Saneamento", "CURY3": "Construção Civil",
    "CVCB3": "Serviços", "DIRR3": "Construção Civil", "ECOR3": "Transporte", "EZTC3": "Construção Civil",
    "GOAU4": "Siderurgia", "GGPS3": "Serviços", "ITSA4": "Holding", "JHSF3": "Imobiliário",
    "MOTV3": "Transporte", "MDNE3": "Construção Civil", "ORVR3": "Saneamento", "PGMN3": "Saúde",
    "PLPL3": "Construção Civil", "SAPR11": "Saneamento", "SIMH3": "Transporte", "TEND3": "Construção Civil",
}
# Ajustes de setor para empresas já existentes (reclassificação).
SECTOR_OVERRIDES = {"NATU3": "Bens de Consumo"}

# Empresas que se combinaram: o histórico curado das antigas passa para a nova.
MERGED_INTO = {
    "AZZA3": ["ARZZ3", "SOMA3"],
    "MBRF3": ["MRFG3", "BRFS3"],
}

# Trocas de ticker com CNPJ diferente (reorganizações): herda o histórico curado.
PREVIOUS_TICKER = {
    "CPLE3": "CPLE6", "ISAE4": "TRPL4", "BRAV3": "RRRP3", "NATU3": "NTCO3",
    "EMBJ3": "EMBR3", "AXIA3": "ELET3",
}

STATE_CONTROLLED = {"BBAS3", "BBSE3", "CXSE3", "CMIG4", "PETR4", "CSMG3", "SAPR11"}

NAMES = {  # nome de exibição para empresas novas
    "ALOS3": "Allos", "ALPA4": "Alpargatas", "ANIM3": "Ânima Educação", "SAUD3": "Bradesco Saúde",
    "CBAV3": "Companhia Brasileira de Alumínio (CBA)", "CEAB3": "C&A Modas", "CSMG3": "Copasa",
    "CURY3": "Cury Construtora", "CVCB3": "CVC Brasil", "DIRR3": "Direcional Engenharia",
    "ECOR3": "EcoRodovias", "EZTC3": "EZTEC", "GOAU4": "Metalúrgica Gerdau", "GGPS3": "GPS Participações",
    "ITSA4": "Itaúsa", "JHSF3": "JHSF Participações", "MOTV3": "Motiva (ex-CCR)", "MDNE3": "Moura Dubeux",
    "ORVR3": "Orizon Valorização de Resíduos", "PGMN3": "Pague Menos", "PLPL3": "Plano & Plano",
    "SAPR11": "Sanepar", "SIMH3": "Simpar", "TEND3": "Construtora Tenda",
    "AZZA3": "Azzas 2154", "MBRF3": "MBRF Global Foods (Marfrig + BRF)", "AXIA3": "Axia Energia (ex-Eletrobras)",
    "EMBJ3": "Embraer S.A.", "BRAV3": "Brava Energia", "ISAE4": "ISA Energia Brasil", "NATU3": "Natura",
    "CPLE3": "Copel",
}


def b3_portfolio(code):
    params = {"language": "pt-br", "pageNumber": 1, "pageSize": 300, "index": code, "segment": "1"}
    token = base64.b64encode(json.dumps(params).encode()).decode()
    url = f"https://sistemaswebb3-listados.b3.com.br/indexProxy/indexCall/GetPortfolioDay/{token}"
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        data = json.load(r)
    if not data.get("results"):
        raise RuntimeError(f"Carteira vazia para {code}")
    return data


def fca_securities(year):
    url = f"https://dados.cvm.gov.br/dados/CIA_ABERTA/DOC/FCA/DADOS/fca_cia_aberta_{year}.zip"
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r:
        z = zipfile.ZipFile(io.BytesIO(r.read()))
    name = f"fca_cia_aberta_valor_mobiliario_{year}.csv"
    return list(csv.DictReader(io.TextIOWrapper(z.open(name), encoding="latin1"), delimiter=";"))


def cnpj_by_ticker(years):
    """Ticker -> CNPJ completo, usando a versão mais recente do FCA de cada companhia."""
    rows = []
    for y in years:
        try:
            rows += fca_securities(y)
        except Exception as e:  # ano ainda não publicado
            print(f"  aviso: FCA {y} indisponível ({e})")
    latest = {}
    for r in rows:
        k = (r["Data_Referencia"], int(r["Versao"]))
        if r["CNPJ_Companhia"] not in latest or k > latest[r["CNPJ_Companhia"]]:
            latest[r["CNPJ_Companhia"]] = k
    out = {}
    for r in rows:
        if (r["Data_Referencia"], int(r["Versao"])) != latest[r["CNPJ_Companhia"]]:
            continue
        t = (r["Codigo_Negociacao"] or "").strip().upper()
        if t and not r["Data_Fim_Negociacao"]:
            out[t] = r["CNPJ_Companhia"]
    return out


def b3_issuer_cnpj(ticker):
    """Fallback: CNPJ pelo cadastro de emissores da B3 (código de 4 letras do ticker)."""
    code = ticker[:4]
    params = {"language": "pt-br", "pageNumber": 1, "pageSize": 20, "company": code}
    token = base64.b64encode(json.dumps(params).encode()).decode()
    url = f"https://sistemaswebb3-listados.b3.com.br/listedCompaniesProxy/CompanyCall/GetInitialCompanies/{token}"
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        data = json.load(r)
    hits = [x for x in data.get("results", []) if x.get("issuingCompany") == code and x.get("status") == "A"]
    return hits[0]["cnpj"] if len(hits) == 1 else None


def root(cnpj):
    return "".join(ch for ch in cnpj if ch.isdigit())[:8]


def main():
    dry = "--dry-run" in sys.argv
    today = dt.date.today().isoformat()
    current = json.loads(DATA.read_text(encoding="utf-8"))
    by_root = {c["cnpj_root"]: c for c in current["companies"]}
    by_ticker = {c["ticker"]: c for c in current["companies"]}

    print("B3: baixando carteiras…")
    ibx = b3_portfolio("IBXX")
    as_of_b3 = dt.datetime.strptime(ibx["header"]["date"], "%d/%m/%y").date().isoformat()
    members = {name: {r["cod"] for r in b3_portfolio(code)["results"]} for code, name in B3_INDEX.items()}

    print("CVM: baixando FCA…")
    year = dt.date.today().year
    cnpjs = cnpj_by_ticker([year - 1, year])

    # agrupa classes da mesma empresa (mesmo CNPJ)
    groups = {}
    for r in ibx["results"]:
        t = r["cod"]
        cnpj = cnpjs.get(t) or b3_issuer_cnpj(t)
        if not cnpj:
            raise SystemExit(f"ERRO: {t} está no IBrX 100 mas não tem CNPJ ativo no FCA da CVM")
        part = float(r["part"].replace(".", "").replace(",", "."))
        seg_token = r["type"].split()[-1]
        groups.setdefault(root(cnpj), []).append({"ticker": t, "part": part, "segment": SEGMENT_FROM_B3.get(seg_token, "BASICO")})

    companies = []
    used = set()
    report = {"novas": [], "saíram": [], "ticker_mudou": [], "segmento_mudou": [], "índices_mudaram": []}
    for rt, classes in groups.items():
        main_cls = max(classes, key=lambda x: x["part"])
        t = main_cls["ticker"]
        tickers = {c["ticker"] for c in classes}
        # Casamento: ticker atual/anterior primeiro; CNPJ raiz só se já foi conferido
        # (a base antiga tinha CNPJs trocados — ex.: Copel com o CNPJ da Sanepar).
        root_hit = by_root.get(rt)
        prev = (
            next((by_ticker[x] for x in tickers if x in by_ticker), None)
            or by_ticker.get(PREVIOUS_TICKER.get(t, ""))
            or (root_hit if root_hit and root_hit.get("cnpj_verified") else None)
        )
        merged = [by_ticker[x] for x in MERGED_INTO.get(t, []) if x in by_ticker]
        if prev is None and merged:
            prev = merged[0]
        if prev is not None:
            used.add(prev["ticker"])
        used.update(m["ticker"] for m in merged)
        indices = sorted({name for name, s in members.items() if s & tickers})
        if main_cls["segment"] == "NM" and "ITAG" in indices:
            indices.remove("ITAG")  # tag along 100% já é regra do Novo Mercado

        if prev is None:
            if t not in NEW_SECTORS:
                raise SystemExit(f"ERRO: empresa nova {t} sem setor em NEW_SECTORS")
            report["novas"].append(t)
            base = {"sector": NEW_SECTORS[t], "events": [], "tags": [], "disclosures": [], "name": NAMES.get(t, t)}
        else:
            base = dict(prev)
            if prev["ticker"] != t:
                report["ticker_mudou"].append(f"{prev['ticker']} -> {t}")
            if prev.get("segment") != main_cls["segment"]:
                report["segmento_mudou"].append(f"{t}: {prev.get('segment')} -> {main_cls['segment']}")
            if sorted(prev.get("indices", [])) != indices:
                report["índices_mudaram"].append(f"{t}: {prev.get('indices', [])} -> {indices}")

        events = list(base.get("events", []))
        disclosures = list(base.get("disclosures", []))
        for m in merged:
            if m is not prev:
                events += m.get("events", [])
                disclosures += [d for d in m.get("disclosures", []) if d not in disclosures]

        tags = [x for x in base.get("tags", []) if x != "Controle estatal"]
        if t in STATE_CONTROLLED:
            tags.insert(0, "Controle estatal")

        company = {
            "ticker": t,
            "name": NAMES.get(t, base["name"]),
            "cnpj_root": rt,
            "cnpj_verified": True,
            "sector": SECTOR_OVERRIDES.get(t, base["sector"]),
            "segment": main_cls["segment"],
            "indices": indices,
            "disclosures": disclosures,
            "events": events,
            "tags": tags,
            "last_verified": today,
        }
        if len(tickers) > 1:
            company["other_tickers"] = sorted(tickers - {t})
        if base.get("dirty_list"):
            company["dirty_list"] = base["dirty_list"]
        if base.get("coverage_note"):
            company["coverage_note"] = base["coverage_note"]
        companies.append(company)

    report["saíram"] = sorted(c["ticker"] for c in current["companies"] if c["ticker"] not in used)

    data = {
        "meta": {
            **current["meta"],
            "as_of": as_of_b3,
            "universe": "IBrX 100",
            "sources": {
                "b3_portfolios": as_of_b3,
                "cvm_fca": f"{year - 1}–{year}",
            },
        },
        "companies": sorted(companies, key=lambda c: c["ticker"]),
    }

    for k, v in report.items():
        print(f"\n{k} ({len(v)}):")
        for x in v:
            print("  ", x)
    print(f"\n{len(companies)} empresas · referência B3 {as_of_b3}")
    if not dry:
        DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"gravado em {DATA.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
