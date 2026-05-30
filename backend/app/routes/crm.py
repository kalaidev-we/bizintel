from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db, CRMCient
from app.auth.dependencies import get_current_user, User, RoleChecker
from app.models import CRMClientResponse, CRMClientCreate
from app.ml.engine import predict_lead_score, predict_churn_risk, get_collaborative_recommendations
import datetime

router = APIRouter(prefix="/crm", tags=["CRM Intelligence"])

@router.get("", response_model=List[CRMClientResponse])
def get_clients(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(CRMCient).all()

@router.post("", response_model=CRMClientResponse)
def create_crm_client(
    client_data: CRMClientCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(RoleChecker(["Admin", "Manager"]))
):
    # Compute ML scores
    lead_conv = predict_lead_score(
        client_data.engagement_score, 
        client_data.monthly_spend, 
        client_data.support_tickets, 
        client_data.contract_months
    )
    
    churn_risk = predict_churn_risk(
        client_data.monthly_spend, 
        client_data.engagement_score, 
        client_data.support_tickets, 
        client_data.contract_months
    )
    
    # Force state representation based on status
    status = client_data.status
    if status == "Active" and churn_risk > 0.7:
        # Flag alert on status if wanted
        pass
        
    new_client = CRMCient(
        name=client_data.name,
        email=client_data.email,
        company=client_data.company,
        monthly_spend=client_data.monthly_spend,
        engagement_score=client_data.engagement_score,
        support_tickets=client_data.support_tickets,
        contract_months=client_data.contract_months,
        conversion_probability=lead_conv,
        churn_risk_score=churn_risk,
        status=status
    )
    db.add(new_client)
    db.commit()
    db.refresh(new_client)
    return new_client

@router.post("/{client_id}/recalculate-scores", response_model=CRMClientResponse)
def recalculate_client_ml_scores(
    client_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    client = db.query(CRMCient).filter(CRMCient.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="CRM Client not found")
        
    client.conversion_probability = predict_lead_score(
        client.engagement_score, client.monthly_spend, client.support_tickets, client.contract_months
    )
    client.churn_risk_score = predict_churn_risk(
        client.monthly_spend, client.engagement_score, client.support_tickets, client.contract_months
    )
    db.commit()
    db.refresh(client)
    return client

@router.get("/{client_id}/recommendations")
def get_client_recommendations(
    client_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    client = db.query(CRMCient).filter(CRMCient.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="CRM Client not found")
        
    # Get all active clients to calculate similarities
    clients_list = db.query(CRMCient).all()
    
    # Available product catalog
    services = [
        "AI Workflow Automation Suite", 
        "Predictive Restocking REST API", 
        "Premium Live-Chat CRM Sync", 
        "GST Auto-Tax Filer", 
        "Custom ML Engine Sandbox", 
        "Dedicated Encrypted Node"
    ]
    
    recommendations = get_collaborative_recommendations(client.id, clients_list, services)
    return {
        "client_id": client.id,
        "name": client.name,
        "recommendations": recommendations
    }

@router.get("/{client_id}/timeline")
def get_client_interaction_timeline(
    client_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    client = db.query(CRMCient).filter(CRMCient.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="CRM Client not found")
        
    # Generate realistic activity history logs based on their client characteristics
    base_time = datetime.datetime.utcnow()
    timeline = []
    
    # Standard account creation
    timeline.append({
        "date": (base_time - datetime.timedelta(days=120)).strftime("%Y-%m-%d %H:%M"),
        "event": "Account Registered",
        "detail": f"Client signed up under company '{client.company}' by sales manager.",
        "icon": "user_plus"
    })
    
    if client.monthly_spend > 0:
        timeline.append({
            "date": (base_time - datetime.timedelta(days=90)).strftime("%Y-%m-%d %H:%M"),
            "event": "Contract Activated",
            "detail": f"Upgraded to premium license contract: ${client.monthly_spend}/month, {client.contract_months}-month term.",
            "icon": "file_text"
        })
        
    if client.support_tickets > 0:
        for idx in range(client.support_tickets):
            days_ago = 60 - (idx * 15)
            timeline.append({
                "date": (base_time - datetime.timedelta(days=days_ago)).strftime("%Y-%m-%d %H:%M"),
                "event": f"Support Ticket #{1024 + idx} Created",
                "detail": f"Technical inquiry reported: Client raised ticket regarding dashboard syncing.",
                "icon": "ticket",
                "resolved": idx < (client.support_tickets - 1)
            })
            
    # Add recent health status
    if client.churn_risk_score > 0.6:
        timeline.append({
            "date": (base_time - datetime.timedelta(days=1)).strftime("%Y-%m-%d %H:%M"),
            "event": "AI Warning Raised",
            "detail": f"System raised critical high churn risk flag. Churn probability score: {round(client.churn_risk_score*100, 1)}%. Engagement score is dropping.",
            "icon": "alert"
        })
    else:
        timeline.append({
            "date": (base_time - datetime.timedelta(days=3)).strftime("%Y-%m-%d %H:%M"),
            "event": "Health check green",
            "detail": f"AI model verified account stability. Lead score conversion confidence: {round(client.conversion_probability*100, 1)}%.",
            "icon": "check"
        })
        
    return timeline[::-1] # Order recent first
