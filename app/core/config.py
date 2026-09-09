from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # SQLite for tonight — zero setup. Swap to a Postgres URL later,
    # e.g. "postgresql://user:pass@localhost:5432/ncc_db"
    database_url: str = "sqlite:///./ncc.db"

    secret_key: str = "change-this-secret-key-before-any-real-deployment"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 1 day, generous for demoing
    supabase_jwt_secret: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
