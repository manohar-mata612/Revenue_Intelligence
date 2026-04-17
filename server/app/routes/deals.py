from fastapi import APIRouter, Query
from app.services.supabase import get_client

router = APIRouter()

@router.get("/deals")
async def get_deals(
    risk_level: str = Query(None),
    owner: str = Query(None),
    limit: int = Query(50),
):
    client = get_client()
    q = (
        client.table("deals_with_staleness")
        .select("*, deal_insights(risk_level, risk_reasons, next_actions)")
        .not_.in_("stage", ["Closed Won", "Closed Lost"])
        .order("days_stale", desc=True)
        .limit(limit)
    )
    if owner:
        q = q.ilike("owner_name", f"%{owner}%")

    result = q.execute()
    return {"deals": result.data}


@router.get("/pipeline-summary")
async def get_pipeline_summary():
    client = get_client()
    result = (
        client.table("deals_with_staleness")
        .select("stage, amount, risk_level")
        .not_.in_("stage", ["Closed Won", "Closed Lost"])
        .execute()
    )
    deals = result.data or []

    total_value = sum(d["amount"] or 0 for d in deals)
    by_stage: dict = {}

    for d in deals:
        s = d["stage"] or "Unknown"
        by_stage.setdefault(s, {"count": 0, "value": 0})
        by_stage[s]["count"] += 1
        by_stage[s]["value"] += d["amount"] or 0

    return {
        "total_value": total_value,
        "deal_count": len(deals),
        "by_stage": by_stage,
    }