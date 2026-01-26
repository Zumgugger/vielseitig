from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    app_name: str = "Vielseitig API"
    environment: str = "development"
    debug: bool = True
    database_url: str = "sqlite+aiosqlite:///./data/vielseitig.db"
    secret_key: str = "change-me"
    session_expiry_days: int = 2
    
    # Twilio SMS configuration (optional)
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_from_number: str = ""
    admin_phone_number: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""

    return Settings()
