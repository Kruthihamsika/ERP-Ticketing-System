import os
from functools import lru_cache

from dotenv import load_dotenv
from pydantic import BaseModel, Field, ValidationError, field_validator


load_dotenv()


class Settings(BaseModel):
    app_name: str = Field(default="ERP Ticket Management System")
    app_version: str = Field(default="0.1.0")
    environment: str = Field(default="local")
    debug: bool = Field(default=False)
    enable_docs: bool = Field(default=True)

    database_url: str
    database_echo: bool = Field(default=False)

    secret_key: str
    algorithm: str
    access_token_expire_minutes: int

    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])
    cors_allow_credentials: bool = Field(default=True)
    cors_allow_methods: list[str] = Field(default_factory=lambda: ["*"])
    cors_allow_headers: list[str] = Field(default_factory=lambda: ["*"])

    @field_validator("cors_origins", "cors_allow_methods", "cors_allow_headers", mode="before")
    @classmethod
    def parse_csv_list(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, list):
            return value
        return [item.strip() for item in value.split(",") if item.strip()]


def _get_bool(name: str, default: bool) -> bool:
    raw_value = os.getenv(name)
    if raw_value is None:
        return default
    return raw_value.strip().lower() in {"1", "true", "yes", "on"}


def _get_int(name: str, default: int | None = None) -> int:
    raw_value = os.getenv(name)
    if raw_value is None:
        if default is None:
            raise KeyError(name)
        return default
    return int(raw_value)


def _normalize_database_url(database_url: str) -> str:
    if database_url.startswith("postgresql://"):
        return database_url.replace("postgresql://", "postgresql+psycopg://", 1)
    return database_url


@lru_cache
def get_settings() -> Settings:
    try:
        return Settings(
            app_name=os.getenv("APP_NAME", "ERP Ticket Management System"),
            app_version=os.getenv("APP_VERSION", "0.1.0"),
            environment=os.getenv("ENVIRONMENT", "local"),
            debug=_get_bool("DEBUG", False),
            enable_docs=_get_bool("ENABLE_DOCS", True),
            database_url=_normalize_database_url(os.environ["DATABASE_URL"]),
            database_echo=_get_bool("DATABASE_ECHO", False),
            secret_key=os.environ["SECRET_KEY"],
            algorithm=os.environ["ALGORITHM"],
            access_token_expire_minutes=_get_int("ACCESS_TOKEN_EXPIRE_MINUTES"),
            cors_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000"),
            cors_allow_credentials=_get_bool("CORS_ALLOW_CREDENTIALS", True),
            cors_allow_methods=os.getenv("CORS_ALLOW_METHODS", "*"),
            cors_allow_headers=os.getenv("CORS_ALLOW_HEADERS", "*"),
        )
    except KeyError as exc:
        missing_name = exc.args[0]
        raise RuntimeError(f"Missing required environment variable: {missing_name}") from exc
    except ValueError as exc:
        raise RuntimeError("ACCESS_TOKEN_EXPIRE_MINUTES must be a valid integer") from exc
    except ValidationError as exc:
        raise RuntimeError(f"Invalid application configuration: {exc}") from exc


settings: Settings = get_settings()
