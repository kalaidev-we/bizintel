from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db, InventoryItem
from app.auth.dependencies import get_current_user, User, RoleChecker
from app.models import InventoryItemResponse, InventoryItemCreate
from app.ml.engine import predict_demand

router = APIRouter(prefix="/inventory", tags=["Inventory Intelligence"])

@router.get("", response_model=List[InventoryItemResponse])
def get_inventory(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(InventoryItem).all()

@router.post("", response_model=InventoryItemResponse)
def create_inventory_item(
    item_data: InventoryItemCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(RoleChecker(["Admin", "Manager"]))
):
    # Predict initial demand forecast
    forecasted = predict_demand(
        item_data.price, 
        item_data.seasonal_index, 
        item_data.promo_active
    )
    
    new_item = InventoryItem(
        name=item_data.name,
        current_stock=item_data.current_stock,
        minimum_stock=item_data.minimum_stock,
        location=item_data.location,
        price=item_data.price,
        seasonal_index=item_data.seasonal_index,
        promo_active=item_data.promo_active,
        demand_forecast=forecasted
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.post("/{item_id}/predict-demand", response_model=InventoryItemResponse)
def recalculate_demand_forecast(
    item_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
        
    # Run prediction model
    item.demand_forecast = predict_demand(item.price, item.seasonal_index, item.promo_active)
    db.commit()
    db.refresh(item)
    return item

@router.get("/alerts")
def get_inventory_alerts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items = db.query(InventoryItem).all()
    low_stock = []
    dead_stock = []
    
    for item in items:
        # Low Stock Alert
        if item.current_stock <= item.minimum_stock:
            low_stock.append({
                "id": item.id,
                "name": item.name,
                "stock": item.current_stock,
                "minimum": item.minimum_stock,
                "location": item.location
            })
            
        # Dead Stock Detection
        # Logic: If item has high stock (e.g. > 100), low seasonal index (e.g. < 0.8), and low predicted demand
        if item.current_stock > 100 and item.seasonal_index < 0.8 and item.demand_forecast < 40:
            dead_stock.append({
                "id": item.id,
                "name": item.name,
                "stock": item.current_stock,
                "predicted_demand": item.demand_forecast,
                "capital_locked": round(item.current_stock * item.price, 2)
            })
            
    return {
        "low_stock": low_stock,
        "dead_stock": dead_stock
    }

@router.get("/warehouse-optimization")
def get_warehouse_optimization(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Warehouse Optimization Engine.
    Recommends physical layout placements based on predicted velocity (demand_forecast).
    Fast-moving goods (high demand) should be placed closer to 'Zone A (Loading Bays)'.
    Slow-moving goods (low demand) should be moved to 'Zone C (Deep Storage)'.
    """
    items = db.query(InventoryItem).all()
    recommendations = []
    
    for item in items:
        if item.demand_forecast > 120:
            recommended_zone = "Zone A (Near Loading Dock)"
            reason = "High velocity demand forecasted. Placing close to bays reduces transit labor by ~30%."
            action_needed = item.location != "Zone A"
        elif item.demand_forecast < 40:
            recommended_zone = "Zone C (Upper Deep Racks)"
            reason = "Slow-moving inventory. Relocate to deep storage to free up prime floor slots."
            action_needed = item.location != "Zone C"
        else:
            recommended_zone = "Zone B (Mid-shelf Aisles)"
            reason = "Moderate steady demand velocity."
            action_needed = item.location != "Zone B"
            
        recommendations.append({
            "item_id": item.id,
            "name": item.name,
            "current_location": item.location,
            "recommended_zone": recommended_zone,
            "reason": reason,
            "action_needed": action_needed
        })
        
    return recommendations
