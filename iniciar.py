#!/usr/bin/env python3
"""Inicia o FOCO inteiro (site + API + banco) com UM comando:   python iniciar.py

Não instala nada: o backend usa só a biblioteca padrão do Python (3.10 ou mais novo).
O site já vem compilado em backend/static, então NÃO precisa de Node.js para só usar o projeto.

Opções:
  --porta 9000     usa outra porta (padrão: 8000)
  --rebuild        recompila o frontend Angular antes de iniciar (precisa do Node.js)
  --sem-navegador  não abre o navegador automaticamente
"""
import argparse
import shutil
import socket
import subprocess
import sys
import threading
import time
import webbrowser
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
BACK, FRONT = RAIZ / "backend", RAIZ / "frontend"


def recompilar_frontend() -> None:
    npm = shutil.which("npm")
    if not npm:
        sys.exit("✖ Para usar --rebuild é preciso instalar o Node.js (https://nodejs.org).")
    if not (FRONT / "node_modules").exists():
        print("→ Instalando dependências do frontend (npm install)...")
        subprocess.run([npm, "install"], cwd=FRONT, check=True)
    print("→ Compilando o frontend...")
    subprocess.run([npm, "run", "build"], cwd=FRONT, check=True)


def porta_livre(porta: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("127.0.0.1", porta)) != 0


def main() -> None:
    ap = argparse.ArgumentParser(description="Inicia o FOCO (site + API + banco).")
    ap.add_argument("--porta", type=int, default=8000)
    ap.add_argument("--rebuild", action="store_true")
    ap.add_argument("--sem-navegador", action="store_true")
    a = ap.parse_args()

    if sys.version_info < (3, 10):
        sys.exit(f"✖ Python 3.10 ou mais novo é necessário (você tem {sys.version.split()[0]}). Baixe em https://python.org")
    if not porta_livre(a.porta):
        sys.exit(f"✖ A porta {a.porta} já está em uso. Feche o outro programa ou use: python iniciar.py --porta {a.porta + 1}")

    if a.rebuild:
        recompilar_frontend()
    if not (BACK / "static" / "index.html").exists():
        print("⚠ Frontend compilado não encontrado em backend/static. Rode: python iniciar.py --rebuild")

    sys.path.insert(0, str(BACK))
    from app import servidor  # noqa: E402  (importa depois de ajustar o caminho)

    url = f"http://localhost:{a.porta}"
    print(f"\n✔ FOCO rodando em {url}   (Ctrl+C para parar)")
    print("  Contas de teste:  aluno@foco.com / Aluno@123   |   admin@foco.com / Admin@123\n")
    if not a.sem_navegador:
        threading.Thread(target=lambda: (time.sleep(1.5), webbrowser.open(url)), daemon=True).start()
    try:
        servidor.main(a.porta)
    except KeyboardInterrupt:
        pass
    print("\nFOCO encerrado.")


if __name__ == "__main__":
    main()
