from fastapi import APIRouter, HTTPException
from app.services.nvidia import call_nvidia
from app.services.supabase import get_client

router = APIRouter()

@router.post("/digest")
async def generate_digest():
    client = get_client()

    open_deals = (
        client.table("deals_with_staleness")
        .select("name, amount, stage, days_stale, close_date")
        .not_.in_("stage", ["Closed Won", "Closed Lost"])
        .execute()
    ).data or []

    risk_flags = (
        client.table("deal_insights")
        .select("deal_id, risk_level, risk_reasons, next_actions")
        .in_("risk_level", ["high", "critical"])
        .execute()
    ).data or []

    total_value = sum(d["amount"] or 0 for d in open_deals)

    try:
        digest = await call_nvidia(
            system_prompt="""You are a sales operations analyst writing a weekly briefing
for a VP of Sales. Be direct and data-driven. No filler phrases.
Max 180 words. Use real deal names and numbers from the data provided.""",
            user_prompt=f"""Write a 3-paragraph weekly pipeline digest.

Pipeline snapshot:
- Total open deals: {len(open_deals)} worth ${total_value:,.0f}
- High/critical risk deals: {len(risk_flags)}

At-risk deals:
{risk_flags[:10]}

Para 1: Overall pipeline health with key numbers.
Para 2: Top at-risk deals — name them, say why, say what needs to happen.
Para 3: One strategic recommendation based on the data.""",
            max_tokens=512,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

    return {"digest": digest, "deal_count": len(open_deals), "risk_count": len(risk_flags)}