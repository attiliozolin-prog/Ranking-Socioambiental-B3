# -*- coding: utf-8 -*-
"""
Cruza os autos de infração do IBAMA (dados abertos) com o CNPJ raiz das empresas
do ranking e gera um evento por empresa e por ano.

Fonte: https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao
(arquivo de ~120 MB, atualizado diariamente pelo IBAMA)

Regras (espelhadas em src/lib/methodology.ts → IBAMA_RULES):
  - janela: 10 anos até a data de referência; autos cancelados são ignorados
  - um evento por empresa/ano, gravidade pelo valor total no ano:
      >= R$ 100 mi -> 4 · >= R$ 20 mi -> 3 · >= R$ 2 mi -> 2 · >= R$ 1 mi -> 1
  - status "processo" (auto lavrado, sem considerar o julgamento administrativo)
  - grupo "ibama-autos": deduções somadas do grupo têm teto por pilar (motor)
  - autos já cobertos por evento curado são excluídos (EXCLUDE)

Eventos gerados levam origin="ibama-sync" e são substituídos a cada execução;
eventos curados não são tocados.

Uso: python3 scripts/sync_ibama.py [caminho_local_do_zip]
"""
import csv
import datetime as dt
import io
import json
import re
import sys
import urllib.request
import zipfile
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "src" / "data" / "companies.json"
URL = "https://stibamadadosabertosprd.blob.core.windows.net/dados-abertos/dados/SIFISC/auto_infracao/auto_infracao/auto_infracao_csv.zip"
DATASET_PAGE = "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao"

THRESHOLDS = [(100e6, 4), (20e6, 3), (2e6, 2), (1e6, 1)]
WINDOW_YEARS = 10

# (ticker, data do auto) já computados em evento curado — evita dupla contagem
EXCLUDE = {
    ("VALE3", "2019-01-26"): "rompimento em Brumadinho (evento VALE3-1)",
}


def brl(v):
    return f"R$ {v / 1e6:,.1f} mi".replace(",", "X").replace(".", ",").replace("X", ".")


def load_zip(arg):
    if arg:
        return zipfile.ZipFile(arg)
    print("baixando autos de infração do IBAMA (~120 MB)…")
    with urllib.request.urlopen(URL, timeout=900) as r:
        return zipfile.ZipFile(io.BytesIO(r.read()))


def main():
    csv.field_size_limit(sys.maxsize)
    data = json.loads(DATA.read_text(encoding="utf-8"))
    as_of = dt.date.fromisoformat(data["meta"]["as_of"])
    start_year = as_of.year - WINDOW_YEARS
    roots = {c["cnpj_root"]: c["ticker"] for c in data["companies"]}

    z = load_zip(sys.argv[1] if len(sys.argv) > 1 else None)
    per = defaultdict(list)  # (ticker, ano) -> autos
    excluded = 0
    for name in z.namelist():
        m = re.search(r"(\d{4})\.csv$", name)
        if not m or int(m.group(1)) < start_year:
            continue
        with z.open(name) as fh:
            for r in csv.DictReader(io.TextIOWrapper(fh, encoding="utf-8", errors="replace"), delimiter=";"):
                doc = re.sub(r"\D", "", r.get("CPF_CNPJ_INFRATOR") or "")
                if len(doc) != 14 or doc[:8] not in roots or r.get("SIT_CANCELADO") == "S":
                    continue
                date = (r.get("DAT_HORA_AUTO_INFRACAO") or "")[:10]
                if not re.match(r"\d{4}-\d{2}-\d{2}$", date) or date > as_of.isoformat():
                    continue
                t = roots[doc[:8]]
                if (t, date) in EXCLUDE:
                    excluded += 1
                    continue
                value = float((r.get("VAL_AUTO_INFRACAO") or "0").replace(",", ".") or 0)
                per[(t, date[:4])].append({
                    "date": date,
                    "value": value,
                    "num": f"{r.get('NUM_AUTO_INFRACAO', '').strip()}{('-' + r['SER_AUTO_INFRACAO'].strip()) if r.get('SER_AUTO_INFRACAO', '').strip() else ''}",
                    "uf": r.get("UF", ""),
                    "desc": " ".join((r.get("DES_AUTO_INFRACAO") or "").split()),
                })

    new_events = defaultdict(list)
    for (t, year), autos in sorted(per.items()):
        total = sum(a["value"] for a in autos)
        sev = next((s for lim, s in THRESHOLDS if total >= lim), 0)
        if not sev:
            continue
        top = max(autos, key=lambda a: a["value"])
        desc = top["desc"][:150].rstrip(" ,.;") + ("…" if len(top["desc"]) > 150 else "")
        n = len(autos)
        new_events[t].append({
            "id": f"{t}-ibama-{year}",
            "source": "IBAMA (autos de infração)",
            "pillars": ["E"],
            "severity": sev,
            "status": "processo",
            "date": top["date"],
            "date_precision": "day",
            "description": f"{n} auto{'s' if n > 1 else ''} de infração em {year}, somando {brl(total)}. Maior ({brl(top['value'])}, auto nº {top['num']}, {top['uf']}): {desc}",
            "link": DATASET_PAGE,
            "link_type": "primaria",
            "group": "ibama-autos",
            "origin": "ibama-sync",
        })

    changed = 0
    for c in data["companies"]:
        kept = [e for e in c["events"] if e.get("origin") != "ibama-sync"]
        evs = kept + new_events.get(c["ticker"], [])
        if evs != c["events"]:
            changed += 1
        c["events"] = evs
    data["meta"].setdefault("sources", {})["ibama_autos"] = as_of.isoformat()
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total_ev = sum(len(v) for v in new_events.values())
    print(f"{total_ev} eventos IBAMA em {len(new_events)} empresas · {excluded} autos excluídos por já estarem em evento curado")
    for t, evs in sorted(new_events.items()):
        print(f"  {t}: " + ", ".join(f"{e['date'][:4]} (grav. {e['severity']})" for e in evs))


if __name__ == "__main__":
    main()
