from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Fuel Ratio Monitoring System"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True
    DATABASE_URL: str = "sqlite:///./frms.db"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
