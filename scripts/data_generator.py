# -*- coding: utf-8 -*-
"""
MÓDULO 1: ENGENHARIA DE DADOS - Ranking Socioambiental
Este script deve ser rodado no Google Colab ou ambiente Python local.
Gera o arquivo 'ranking_db.json' usado pelo Frontend.
"""

import json
import random
from datetime import datetime, timedelta

# --- 1. CONFIG & DATA STRUCTURES ---

OUTPUT_FILE = "ranking_db.json"

# Mock Map: Ticker -> CNPJ Root & Name (Top 20 Samples)
TICKER_MAP = {
    "VALE3": {"name": "Vale S.A.", "cnpj": "33592510"},
    "PETR4": {"name": "Petroleo Brasileiro S.A. Petrobras", "cnpj": "33000167"},
    "ITUB4": {"name": "Itau Unibanco Holding S.A.", "cnpj": "60872504"},
    "ABEV3": {"name": "Ambev S.A.", "cnpj": "07526557"},
    "BBDC4": {"name": "Banco Bradesco S.A.", "cnpj": "60746948"},
    "BBAS3": {"name": "Banco do Brasil S.A.", "cnpj": "00000000"},
    "WEGE3": {"name": "WEG S.A.", "cnpj": "84429695"},
    "SUZB3": {"name": "Suzano S.A.", "cnpj": "16404287"},
    "JBSS3": {"name": "JBS S.A.", "cnpj": "02916265"},
    "BPAC11": {"name": "Banco BTG Pactual S.A.", "cnpj": "30306294"},
    "RAIL3": {"name": "Rumo S.A.", "cnpj": "02387241"},
    "RENT3": {"name": "Localiza Rent a Car S.A.", "cnpj": "16670085"},
    "LREN3": {"name": "Lojas Renner S.A.", "cnpj": "92754738"},
    "GGBR4": {"name": "Gerdau S.A.", "cnpj": "33042730"},
    "CSNA3": {"name": "Companhia Siderurgica Nacional", "cnpj": "33042730"},
    "RADL3": {"name": "Raia Drogasil S.A.", "cnpj": "61585865"},
    "PRIO3": {"name": "Petro Rio S.A.", "cnpj": "10394422"},
    "ELET3": {"name": "Centrais Eletricas Brasileiras S.A. - Eletrobras", "cnpj": "00001180"},
    "VIVT3": {"name": "Telefonica Brasil S.A.", "cnpj": "02558157"},
    "HYPE3": {"name": "Hypera S.A.", "cnpj": "02932074"}
}

# --- 2. MOCK FUNCTIONS (INGESTÃO SIMULADA) ---

def mock_get_ibama_fines(cnpj_root):
    """Simula consulta à API do IBAMA."""
    # 20% de chance de ter multa
    if random.random() < 0.2:
        return [
            {
                "date": (datetime.now() - timedelta(days=random.randint(10, 600))).strftime("%Y-%m-%d"),
                "description": "Multa por infração ambiental (Desmatamento/Poluição)",
                "link": "http://dados.gov.br/ibama/autos"
            }
        ]
    return []

def mock_get_cade_process(ticker):
    """Simula consulta ao CADE."""
    # 5% de chance de ter processo
    if random.random() < 0.05:
        return True
    return False

def mock_check_mte_dirty_list(cnpj_root):
    """Simula verificação na Lista Suja do Trabalho Escravo."""
    # 2% de chance de estar na lista (Kill Switch)
    if random.random() < 0.02:
        return True
    return False

def mock_get_b3_indices(ticker):
    """Simula presença no ISE e Novo Mercado."""
    badges = []
    # 40% de chance de ser ISE
    if random.random() < 0.4 or ticker in ["WEGE3", "SUZB3", "ITUB4"]:
        badges.append("ISE")
    
    # 60% de chance de Novo Mercado
    if random.random() < 0.6 or ticker in ["WEGE3", "LREN3", "RAIL3"]:
        badges.append("Novo Mercado")
        
    return badges

# --- 3. ALGORITMO DE SCORING ---

def calculate_score(company_data):
    """
    Nota Base: 50
    ISE: +20
    Novo Mercado: +10
    Multa IBAMA: -10 cada
    CADE: -15
    MTE (Dirty List): Score = 0
    """
    base_score = 50
    evidence_log = []
    badges = []
    
    # --- Ingestão Mock ---
    ticker = company_data['ticker']
    cnpj = company_data['cnpj']
    
    b3_data = mock_get_b3_indices(ticker)
    ibama_fines = mock_get_ibama_fines(cnpj)
    has_cade = mock_get_cade_process(ticker)
    is_dirty_list = mock_check_mte_dirty_list(cnpj)
    
    current_score = base_score
    
    # --- Bonificadores ---
    if "ISE" in b3_data:
        current_score += 20
        badges.append("ISE")
        evidence_log.append({
            "type": "BONUS",
            "source": "B3 - Índice ISE",
            "description": "Membro da carteira teórica de Sustentabilidade Empresarial",
            "impact": 20
        })
        
    if "Novo Mercado" in b3_data:
        current_score += 10
        badges.append("Novo Mercado")
        evidence_log.append({
            "type": "BONUS",
            "source": "B3 - Novo Mercado",
            "description": "Segmento máximo de governança corporativa",
            "impact": 10
        })
        
    # --- Penalizadores ---
    for fine in ibama_fines:
        current_score -= 10
        badges.append("Alerta Ambiental")
        evidence_log.append({
            "type": "PENALTY",
            "source": "IBAMA",
            "description": fine['description'],
            "date": fine['date'],
            "impact": -10,
            "link_ref": fine['link']
        })
        
    if has_cade:
        current_score -= 15
        badges.append("Risco Cartel")
        evidence_log.append({
            "type": "PENALTY",
            "source": "CADE",
            "description": "Processo administrativo em andamento",
            "impact": -15
        })

    # --- Kill Switch ---
    if is_dirty_list:
        current_score = 0
        badges = ["LISTA SUJA TRABALHO ESCRAVO"] # Override badges mostly
        evidence_log.append({
            "type": "PENALTY",
            "source": "MTE - Lista Suja",
            "description": "Inclusão no cadastro de empregadores flagrados com mão de obra análoga à escravidão",
            "impact": -999,
            "link_ref": "https://www.gov.br/trabalho-e-emprego/pt-br"
        })
    
    # Cap score 0-100
    if current_score < 0: current_score = 0
    if current_score > 100: current_score = 100
    
    # --- Dimensions Mock (Derived from final score for viz) ---
    # Just simplistic distribution for the mock visuals
    env = max(0, min(100, current_score + random.randint(-10, 10)))
    soc = max(0, min(100, current_score + random.randint(-10, 10)))
    gov = max(0, min(100, current_score + random.randint(-10, 10)))
    if is_dirty_list: soc = 0
    
    return {
        "score_final": current_score,
        "badges": badges,
        "evidence_log": evidence_log,
        "dimensions": {
            "environmental": env,
            "social": soc,
            "governance": gov
        }
    }

# --- 4. EXECUÇÃO MAIN ---

def main():
    print("Iniciando geração do Ranking Socioambiental...")
    
    companies_output = []
    
    for ticker, info in TICKER_MAP.items():
        company_base = {
            "ticker": ticker,
            "name": info["name"],
            "cnpj": info["cnpj"]
        }
        
        result = calculate_score(company_base)
        
        companies_output.append({
            "ticker": ticker,
            "name": info["name"],
            "cnpj_root": info["cnpj"],
            "score_final": result["score_final"],
            "dimensions": result["dimensions"],
            "badges": result["badges"],
            "evidence_log": result["evidence_log"]
        })
        
    final_json = {
        "meta": {
            "version": "1.0",
            "last_update": datetime.now().strftime("%Y-%m-%d"),
            "total_companies": len(companies_output)
        },
        "companies": companies_output
    }
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(final_json, f, indent=2, ensure_ascii=False)
        
    print(f"Sucesso! Arquivo '{OUTPUT_FILE}' gerado com {len(companies_output)} empresas.")
    print("Copie este arquivo para a pasta /src/data/ do projeto Frontend.")

if __name__ == "__main__":
    main()