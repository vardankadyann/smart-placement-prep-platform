from pathlib import Path
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parents[2] / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    google_api_key: str = ""
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    cors_origins: str = "http://localhost:3000"

    chroma_persist_dir: str = "./data/chroma"
    upload_dir: str = "./uploads"
    max_upload_size_mb: int = 25
    max_files_per_hour: int = 20

    rate_limit_requests: int = 60
    rate_limit_window_seconds: int = 60

    gemini_model: str = "gemini-2.5-flash"
    embedding_model: str = "models/text-embedding-004"

    chunk_size: int = 800
    chunk_overlap: int = 150
    top_k_retrieval: int = 12
    top_k_after_rerank: int = 6

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024

    @property
    def chroma_path(self) -> Path:
        return Path(self.chroma_persist_dir)

    @property
    def uploads_path(self) -> Path:
        return Path(self.upload_dir)


@lru_cache
def get_settings() -> Settings:
    return Settings()
