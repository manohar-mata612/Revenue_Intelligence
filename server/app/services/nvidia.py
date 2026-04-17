import httpx
import json
from app.config import settings

async def call_nvidia(
    system_prompt: str,
    user_prompt: str,
    model: str = None,
    json_mode: bool = False,
    max_tokens: int = 1024,
) -> str | dict:
    
    model = model or settings.default_model

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_prompt},
        ],
        "temperature": 0 if json_mode else 0.3,
        "max_tokens": max_tokens,
    }

    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{settings.nvidia_base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.nvidia_api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        response.raise_for_status()

    content = response.json()["choices"][0]["message"]["content"]

    if json_mode:
        return json.loads(content)
    return content