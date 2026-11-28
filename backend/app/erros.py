class Erro(Exception):
    """Erro de API: vira {"detail": "mensagem"} com o status HTTP indicado."""

    def __init__(self, status: int, detail: str, headers: dict[str, str] | None = None):
        super().__init__(detail)
        self.status, self.detail, self.headers = status, detail, headers or {}


def nao_encontrado(msg: str) -> Erro:
    return Erro(404, msg)
