from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.nvidia import call_nvidia
from app.services.supabase import get_client, build_deal_query

router = APIRouter()

class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    answer: str
    deals: list
    filters_used: dict

FILTER_SYSTEM_PROMPT = """You convert natural language questions about a B2B sales pipeline
into a JSON filter object. Available filter fields:
- days_stale_gte (int): minimum days since last contact
- amount_gte (float): minimum deal value in dollars
- amount_lte (float): maximum deal value
- risk_level (str): one of low, medium, high, critical
- owner_name (str): sales rep name (partial match)
- stage (str): deal stage name (partial match)
- close_date_before (str): ISO date YYYY-MM-DD
- sort_by (str): days_stale | amount | close_date
- sort_order (str): asc | desc
- limit (int): max results, default 20
Return ONLY a valid JSON object with relevant fields. No explanation."""

@router.post("/query", response_model=QueryResponse)
async def natural_language_query(body: QueryRequest):
    try:
        filters = await call_nvidia(
            system_prompt=FILTER_SYSTEM_PROMPT,
            user_prompt=body.question,
            json_mode=True,
            max_tokens=256,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"NVIDIA filter error: {str(e)}")

    client = get_client()
    result = build_deal_query(client, filters).execute()
    deals = result.data or []

    try:
        answer = await call_nvidia(
            system_prompt="You are a sales intelligence assistant. Answer pipeline questions clearly and concisely. Use bullet points when listing deals.",
            user_prompt=f'Question: "{body.question}"\n\nData:\n{deals}\n\nWrite a short direct answer.',
            max_tokens=512,
        )
    except Exception as e:
        answer = f"Found {len(deals)} deals but could not generate summary: {str(e)}"

    return QueryResponse(answer=answer, deals=deals, filters_used=filters)