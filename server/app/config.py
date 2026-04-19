from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    nvidia_api_key: str
    supabase_url: str
    supabase_service_key: str
    nvidia_base_url: str = "https://integrate.api.nvidia.com/v1"
    default_model: str = "meta/llama-3.3-70b-instruct"
    batch_model: str = "meta/llama-3.1-8b-instruct"

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()