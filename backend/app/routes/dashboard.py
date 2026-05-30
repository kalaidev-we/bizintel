from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import datetime
import random
from app.database import get_db, SalesRecord, Expense, CRMCient, InventoryItem
from app.auth.dependencies import get_current_user, User
from app.ml.engine import get_arima_forecast, run_anomaly_detection

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/kpis")
def get_dashboard_kpis(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Total Revenue (Sales)
    sales = db.query(SalesRecord).all()
    total_revenue = sum(s.amount for s in sales)
    
    # 2. Expenses & Anomalies
    expenses = db.query(Expense).all()
    total_expenses = sum(e.amount for e in expenses)
    anomalous_expenses = db.query(Expense).filter(Expense.is_anomaly == True).count()
    
    # 3. CRM & Churn Metrics
    total_clients = db.query(CRMCient).count()
    high_churn_clients = db.query(CRMCient).filter(CRMCient.churn_risk_score > 0.6).count()
    
    # 4. Inventory Health
    total_items = db.query(InventoryItem).count()
    low_stock_items = db.query(InventoryItem).filter(InventoryItem.current_stock <= InventoryItem.minimum_stock).count()
    
    # Calculate Business Health Score
    # Formula: 100 - (churn_ratio * 30) - (low_stock_ratio * 20) - (anomaly_ratio * 30) - (expense_ratio * 20)
    churn_ratio = (high_churn_clients / max(1, total_clients))
    low_stock_ratio = (low_stock_items / max(1, total_items))
    anomaly_ratio = (anomalous_expenses / max(1, len(expenses)))
    expense_ratio = min(1.0, (total_expenses / max(1.0, total_revenue)))
    
    health_score = 100 - (churn_ratio * 30) - (low_stock_ratio * 15) - (anomaly_ratio * 25) - (expense_ratio * 30)
    health_score = max(10, min(100, round(health_score)))
    
    return {
        "health_score": health_score,
        "revenue": {
            "value": round(total_revenue, 2),
            "growth": 14.2 # Mock growth
        },
        "expenses": {
            "value": round(total_expenses, 2),
            "anomalies": anomalous_expenses
        },
        "clients": {
            "total": total_clients,
            "high_risk_churn": high_churn_clients
        },
        "inventory": {
            "total_items": total_items,
            "low_stock_warnings": low_stock_items
        }
    }

@router.get("/revenue-chart")
def get_revenue_chart(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sales = db.query(SalesRecord).order_by(SalesRecord.date.asc()).all()
    
    # Aggregate monthly
    monthly_data = {}
    for sale in sales:
        month_str = sale.date.strftime("%Y-%m")
        monthly_data[month_str] = monthly_data.get(month_str, 0.0) + sale.amount
        
    sorted_months = sorted(list(monthly_data.keys()))
    chart_data = [{"month": m, "revenue": round(monthly_data[m], 2)} for m in sorted_months]
    
    # Calculate sales forecast (next 3 months) using ARIMA / fallback
    if len(chart_data) >= 6:
        rev_history = [item['revenue'] for item in chart_data]
        forecast_vals = get_arima_forecast(rev_history, steps=3)
        
        # Format predictions
        last_month = datetime.datetime.strptime(sorted_months[-1], "%Y-%m")
        for i, val in enumerate(forecast_vals):
            # Calculate next month date
            next_month = last_month + datetime.timedelta(days=(i+1)*30)
            next_month_str = next_month.strftime("%Y-%m")
            chart_data.append({
                "month": f"{next_month_str} (Forecast)",
                "revenue": round(val, 2),
                "is_forecast": True
            })
            
    return chart_data

@router.get("/expenses-chart")
def get_expenses_chart(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    expenses = db.query(Expense).all()
    categories = {}
    for exp in expenses:
        categories[exp.category] = categories.get(exp.category, 0.0) + exp.amount
        
    return [{"category": c, "amount": round(val, 2)} for c, val in categories.items()]

@router.get("/ai-recommendations")
def get_ai_recommendations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    recs = []
    
    # Check inventory
    low_stock = db.query(InventoryItem).filter(InventoryItem.current_stock <= InventoryItem.minimum_stock).all()
    for item in low_stock:
        recs.append({
            "type": "Inventory Warning",
            "message": f"Inventory item '{item.name}' is below minimum stock level ({item.current_stock}/{item.minimum_stock}). Restock recommended.",
            "impact": "High",
            "action": f"/inventory"
        })
        
    # Check expenses
    anomalies = db.query(Expense).filter(Expense.is_anomaly == True).limit(2).all()
    for exp in anomalies:
        recs.append({
            "type": "Financial Alert",
            "message": f"Suspicious expense detected: '{exp.description}' worth ${exp.amount} classified under '{exp.category}'. Anomaly score: {round(exp.anomaly_score, 2)}",
            "impact": "Medium",
            "action": f"/finance"
        })
        
    # Check churn
    churn_risk = db.query(CRMCient).filter(CRMCient.churn_risk_score > 0.65).limit(2).all()
    for client in churn_risk:
        recs.append({
            "type": "CRM Risk",
            "message": f"Client '{client.name}' ({client.company}) has a churn risk score of {round(client.churn_risk_score * 100, 1)}%. Engage immediately.",
            "impact": "High",
            "action": f"/crm"
        })
        
    # Standard tips
    recs.append({
        "type": "Business Insight",
        "message": "Sales forecasting ARIMA models detect seasonal revenue increases in Q4. Plan marketing budgets accordingly.",
        "impact": "Low",
        "action": "/predictions"
    })
    
    return recs[:4]

def seed_dashboard_data(db: Session):
    """Seed comprehensive mockup business data into database tables"""
    # 1. Seed Sales Records (for 12 months history)
    if db.query(SalesRecord).count() == 0:
        base_revenue = 45000.0
        start_date = datetime.datetime.utcnow() - datetime.timedelta(days=360)
        for i in range(12):
            month_date = start_date + datetime.timedelta(days=i*30)
            # Add seasonal variation + random growth
            amount = base_revenue + (i * 2500) + random.uniform(-5000, 5000)
            if i in [10, 11]:  # High Q4 seasonality
                amount += 15000
            db.add(SalesRecord(date=month_date, amount=round(amount, 2), category="Enterprise Sales"))
            
    # 2. Seed Expenses
    if db.query(Expense).count() == 0:
        standard_expenses = [
            (2400.0, "Software", "AWS Cloud Hosting Billing"),
            (120.0, "Software", "GitHub Copilot Licenses"),
            (500.0, "Travel", "Corporate flight tickets to regional client"),
            (180.0, "Office", "Office stationary and printing supplies"),
            (2000.0, "Marketing", "Google Ads PPC Marketing Campaign"),
            (850.0, "Utilities", "Office HQ Electricity Bill"),
            (150.0, "Software", "Zoom Meetings Subscription"),
            (3500.0, "Travel", "CEO flights and hotel accommodation in London"), # Anomaly
            (4200.0, "Software", "Oracle ERP Cloud Subscription Fee"),
            (120.0, "Software", "Slack Pro Monthly Workspace Bill"),
            (120.0, "Software", "Slack Pro Monthly Workspace Bill") # Duplicate invoice
        ]
        
        for amount, category, desc in standard_expenses:
            db.add(Expense(amount=amount, category=category, description=desc))
        db.commit()
        
        # Run initial Isolation Forest Anomaly Detection
        all_exp = db.query(Expense).all()
        # Format data for prediction
        formatted = [{"id": e.id, "amount": e.amount} for e in all_exp]
        anomaly_results = run_anomaly_detection(formatted)
        
        for result in anomaly_results:
            exp = db.query(Expense).filter(Expense.id == result["id"]).first()
            if exp:
                exp.is_anomaly = result["is_anomaly"]
                exp.anomaly_score = result["score"]
                
        # Check for duplicates
        descriptions = {}
        for exp in all_exp:
            key = (exp.amount, exp.description)
            if key in descriptions:
                exp.is_duplicate = True
                descriptions[key].is_duplicate = True
            else:
                descriptions[key] = exp
                
        db.commit()

    # 3. Seed CRM Clients
    if db.query(CRMCient).count() == 0:
        clients = [
            ("Acme Corp", "contact@acme.com", "Acme Corporation", 12000.0, 85.0, 1, 12, "Active", 0.02, 0.95),
            ("Globex Inc", "billing@globex.com", "Globex Global", 8500.0, 92.0, 0, 24, "Active", 0.01, 0.98),
            ("Initech LLC", "peter@initech.com", "Initech", 3200.0, 45.0, 5, 6, "Active", 0.45, 0.65), # High churn risk
            ("Umbrella Corp", "albert@umbrella.com", "Umbrella Inc", 0.0, 60.0, 2, 1, "Lead", 0.72, 0.20),
            ("Hooli", "gavin@hooli.xyz", "Hooli Tech", 0.0, 25.0, 8, 1, "Lead", 0.15, 0.85), # Bad Lead
            ("Veer Industries", "vijay@veer.in", "Veer Ltd", 15000.0, 95.0, 0, 36, "Active", 0.01, 0.99),
            ("Nova Retail", "info@nova.com", "Nova Retail Group", 4800.0, 70.0, 4, 12, "Active", 0.12, 0.78)
        ]
        for name, email, company, spend, engage, tickets, contract, status, churn, conv in clients:
            db.add(CRMCient(
                name=name, email=email, company=company, monthly_spend=spend,
                engagement_score=engage, support_tickets=tickets, contract_months=contract,
                status=status, churn_risk_score=churn, conversion_probability=conv
            ))
        db.commit()

    # 4. Seed Inventory Items
    if db.query(InventoryItem).count() == 0:
        items = [
            ("Enterprise Router Pro v4", 8, 15, "Warehouse A", 299.99, 1.2, True), # Low Stock
            ("AI Compute Unit PCIe 128G", 45, 10, "Warehouse B", 1499.00, 1.5, False),
            ("Optical Fiber Spool 5km", 120, 50, "Warehouse A", 85.50, 0.9, False),
            ("VoIP Desktop Phone IP7", 3, 20, "Warehouse C", 120.00, 1.1, True), # Low Stock
            ("Smart Environmental Sensor", 350, 100, "Warehouse B", 45.00, 1.0, False)
        ]
        for name, stock, min_stock, loc, price, idx, promo in items:
            # Predict demand (simple calculation here, full model later)
            demand_pred = int(100 - (0.1 * price) + 40 * idx + 25 * int(promo))
            db.add(InventoryItem(
                name=name, current_stock=stock, minimum_stock=min_stock,
                location=loc, price=price, seasonal_index=idx,
                promo_active=promo, demand_forecast=demand_pred
            ))
        db.commit()
