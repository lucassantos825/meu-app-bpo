from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "BPO Financeiro AI"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://meu-app-bpo.vercel.app",
    ]

    # Banco de Dados (SQLite por padrão para desenvolvimento rápido ou PostgreSQL para prod)
    DATABASE_URL: str = "sqlite:///./bpo_financeiro.db"

    # Segurança e JWT
    SECRET_KEY: str = "bpo_financeiro_secret_key_change_me_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # Kiwify Webhook
    KIWIFY_WEBHOOK_SECRET: str = "kiwify_secret_token_default"

    # Provedor de IA (Gemini / OpenAI)
    AI_PROVIDER: str = "gemini"
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # Armazenamento de Comprovantes
    UPLOAD_DIR: str = "./storage/uploads"
    MAX_UPLOAD_SIZE_MB: int = 15

    # Regras de Negócio de Conciliação
    MIN_AUTO_MATCH_CONFIDENCE: float = 0.90
    DATE_WINDOW_DAYS_BEFORE: int = 1
    DATE_WINDOW_DAYS_AFTER: int = 2

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
