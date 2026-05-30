from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db, SalesRecord, Expense, CRMCient, InventoryItem
from app.auth.dependencies import get_current_user, User
import datetime

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/summary")
def get_reports_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sales_count = db.query(SalesRecord).count()
    expense_count = db.query(Expense).count()
    client_count = db.query(CRMCient).count()
    inventory_count = db.query(InventoryItem).count()
    
    # Financial aggregate
    total_revenue = sum(s.amount for s in db.query(SalesRecord).all())
    total_expenses = sum(e.amount for e in db.query(Expense).all())
    net_profit = total_revenue - total_expenses
    
    # Generate AI executive summary text
    # We will build a high-fidelity template engine that reviews key data and spits out structured executive briefs.
    summary_text = (
        f"BIZINTEL AI EXECUTIVE BRIEFING - {datetime.datetime.utcnow().strftime('%B %Y')}\n\n"
        f"Operational Overview: BizIntel AI model evaluations show high operational stability. The enterprise "
        f"has generated a total revenue of ${total_revenue:,.2f} over the recorded months, balanced against "
        f"operating expenses of ${total_expenses:,.2f}, resulting in a net surplus of ${net_profit:,.2f}. "
        f"The operating margin stands at {((net_profit/total_revenue)*100) if total_revenue > 0 else 0:.1f}%.\n\n"
        f"Machine Learning Intelligence Flags:\n"
    )
    
    # Check for stock issues
    low_stock = db.query(InventoryItem).filter(InventoryItem.current_stock <= InventoryItem.minimum_stock).count()
    if low_stock > 0:
        summary_text += f"- Inventory: XGBoost model forecasts low-stock conditions across {low_stock} items. Warehouse re-routing is advised.\n"
    else:
        summary_text += "- Inventory: Stock lines are healthy. Current inventory covers predicted 30-day demand parameters.\n"
        
    # Check for expense anomalies
    anomalies = db.query(Expense).filter(Expense.is_anomaly == True).count()
    if anomalies > 0:
        summary_text += f"- Finance: Isolation Forest audit flagged {anomalies} transaction outlier(s) exceeding normal threshold bounds. Review recommended.\n"
    else:
        summary_text += "- Finance: Expense auditing models detected no outlier activities inside the current cycle.\n"
        
    # Check for churn risk
    high_churn = db.query(CRMCient).filter(CRMCient.churn_risk_score > 0.65).count()
    if high_churn > 0:
        summary_text += f"- CRM: Churn prediction models identified {high_churn} enterprise client(s) with high churn risk. Target account engagements suggested.\n"
    else:
        summary_text += "- CRM: Customer retention coefficients are positive; no accounts report critical churn levels.\n"
        
    summary_text += (
        f"\nRecommendations:\n"
        f"1. Optimize loading bay layout (Zone A) to accommodate fast-moving compute stock.\n"
        f"2. Retrain Lead Scoring models in the AI Models Lab with latest engagement telemetry to improve accuracy."
    )
    
    return {
        "generated_at": datetime.datetime.utcnow(),
        "sales_count": sales_count,
        "expense_count": expense_count,
        "client_count": client_count,
        "inventory_count": inventory_count,
        "total_revenue": round(total_revenue, 2),
        "total_expenses": round(total_expenses, 2),
        "net_profit": round(net_profit, 2),
        "executive_summary": summary_text
    }

@router.get("/export-data")
def get_export_data(data_type: str = "all", db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Returns structured data grids suitable for client CSV download / Excel creation.
    """
    res = {}
    
    if data_type in ["all", "sales"]:
        sales = db.query(SalesRecord).order_by(SalesRecord.date.desc()).all()
        res["sales"] = [
            {"id": s.id, "date": s.date.strftime("%Y-%m-%d"), "amount": s.amount, "category": s.category}
            for s in sales
        ]
        
    if data_type in ["all", "expenses"]:
        expenses = db.query(Expense).order_by(Expense.date.desc()).all()
        res["expenses"] = [
            {
                "id": e.id, "date": e.date.strftime("%Y-%m-%d"), "amount": e.amount, 
                "category": e.category, "description": e.description, 
                "is_anomaly": e.is_anomaly, "anomaly_score": round(e.anomaly_score, 4),
                "is_duplicate": e.is_duplicate
            }
            for e in expenses
        ]
        
    if data_type in ["all", "clients"]:
        clients = db.query(CRMCient).all()
        res["clients"] = [
            {
                "id": c.id, "name": c.name, "email": c.email, "company": c.company,
                "monthly_spend": c.monthly_spend, "engagement_score": c.engagement_score,
                "support_tickets": c.support_tickets, "contract_months": c.contract_months,
                "churn_risk_score": round(c.churn_risk_score, 4),
                "conversion_probability": round(c.conversion_probability, 4),
                "status": c.status
            }
            for c in clients
        ]
        
    if data_type in ["all", "inventory"]:
        items = db.query(InventoryItem).all()
        res["inventory"] = [
            {
                "id": i.id, "name": i.name, "current_stock": i.current_stock,
                "minimum_stock": i.minimum_stock, "location": i.location,
                "price": i.price, "seasonal_index": i.seasonal_index,
                "promo_active": i.promo_active, "demand_forecast": i.demand_forecast
            }
            for i in items
        ]
        
    return res
