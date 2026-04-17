from supabase import create_client, Client
from app.config import settings

def get_client() -> Client:
    return create_client(settings.supabase_url, settings.supabase_service_key)

def build_deal_query(client: Client, filters: dict):
    q = (
        client.table("deals_with_staleness")
        .select("name, amount, stage, owner_name, days_stale, close_date, risk_level")
        .not_.in_("stage", ["Closed Won", "Closed Lost"])
    )

    if filters.get("days_stale_gte"):
        q = q.gte("days_stale", filters["days_stale_gte"])
    if filters.get("amount_gte"):
        q = q.gte("amount", filters["amount_gte"])
    if filters.get("amount_lte"):
        q = q.lte("amount", filters["amount_lte"])
    if filters.get("risk_level"):
        q = q.eq("risk_level", filters["risk_level"])
    if filters.get("owner_name"):
        q = q.ilike("owner_name", f"%{filters['owner_name']}%")
    if filters.get("stage"):
        q = q.ilike("stage", f"%{filters['stage']}%")
    if filters.get("close_date_before"):
        q = q.lte("close_date", filters["close_date_before"])

    sort = filters.get("sort_by", "days_stale")
    ascending = filters.get("sort_order", "desc") == "asc"

    return q.order(sort, desc=not ascending).limit(filters.get("limit", 20))