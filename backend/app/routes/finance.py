from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db, Expense
from app.auth.dependencies import get_current_user, User, RoleChecker
from app.models import ExpenseResponse, ExpenseCreate, InvoiceCreate, InvoiceResponse
from app.ml.engine import classify_expense_text, run_anomaly_detection
import datetime

router = APIRouter(prefix="/finance", tags=["Finance & Billing"])

@router.get("/expenses", response_model=List[ExpenseResponse])
def get_expenses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Expense).order_by(Expense.date.desc()).all()

@router.post("/expenses", response_model=ExpenseResponse)
def create_expense(
    expense_data: ExpenseCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(RoleChecker(["Admin", "Manager"]))
):
    # Classify category using Naive Bayes text model
    predicted_category = classify_expense_text(expense_data.description)
    # Check if category is customized or use predicted
    category = expense_data.category if expense_data.category != "Auto" else predicted_category
    
    new_expense = Expense(
        amount=expense_data.amount,
        category=category,
        description=expense_data.description
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    
    # Recalculate anomalies & duplicates across all expenses
    all_expenses = db.query(Expense).all()
    formatted = [{"id": e.id, "amount": e.amount} for e in all_expenses]
    anomaly_results = run_anomaly_detection(formatted)
    
    # Update DB
    for result in anomaly_results:
        exp = db.query(Expense).filter(Expense.id == result["id"]).first()
        if exp:
            exp.is_anomaly = result["is_anomaly"]
            exp.anomaly_score = result["score"]
            
    # Check for duplicates (same amount and description within expenses)
    descriptions = {}
    for exp in all_expenses:
        key = (exp.amount, exp.description.lower().strip())
        if key in descriptions:
            exp.is_duplicate = True
            descriptions[key].is_duplicate = True
        else:
            descriptions[key] = exp
            exp.is_duplicate = False
            
    db.commit()
    db.refresh(new_expense)
    return new_expense

@router.post("/scan-anomalies")
def scan_financial_anomalies(
    db: Session = Depends(get_db), 
    current_user: User = Depends(RoleChecker(["Admin", "Manager"]))
):
    all_expenses = db.query(Expense).all()
    if len(all_expenses) < 5:
        return {"status": "skipped", "message": "Need at least 5 expenses to scan anomalies."}
        
    formatted = [{"id": e.id, "amount": e.amount} for e in all_expenses]
    anomaly_results = run_anomaly_detection(formatted)
    
    anomalies_found = 0
    for result in anomaly_results:
        exp = db.query(Expense).filter(Expense.id == result["id"]).first()
        if exp:
            exp.is_anomaly = result["is_anomaly"]
            exp.anomaly_score = result["score"]
            if result["is_anomaly"]:
                anomalies_found += 1
                
    db.commit()
    return {"status": "success", "anomalies_detected": anomalies_found, "scanned_count": len(all_expenses)}

@router.post("/invoice", response_model=InvoiceResponse)
def generate_gst_invoice(
    invoice_data: InvoiceCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    subtotal = sum(item["quantity"] * item["price"] for item in invoice_data.items)
    gst_amount = subtotal * (invoice_data.gst_rate / 100.0)
    total = subtotal + gst_amount
    
    invoice_num = f"INV-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    
    return {
        "invoice_number": invoice_num,
        "client_name": invoice_data.client_name,
        "client_email": invoice_data.client_email,
        "subtotal": round(subtotal, 2),
        "gst_amount": round(gst_amount, 2),
        "total": round(total, 2),
        "date": datetime.datetime.utcnow()
    }
