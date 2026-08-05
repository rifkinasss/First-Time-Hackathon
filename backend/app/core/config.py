from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Fuel Ratio Monitoring System"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True
    DATABASE_URL: str = "sqlite:///./frms.db"

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug(cls, value: object) -> object:
        # Some hosting environments expose DEBUG=release. Treat common
        # release/production values as false instead of preventing startup.
        if isinstance(value, str) and value.strip().lower() in {"release", "production", "prod", "false", "0", "no", "off"}:
            return False
        return value

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
