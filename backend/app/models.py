from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

# Auth Schemas
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    full_name: str

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    full_name: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# Expense Schemas
class ExpenseCreate(BaseModel):
    amount: float
    category: str
    description: str

class ExpenseResponse(BaseModel):
    id: int
    amount: float
    category: str
    description: str
    date: datetime
    is_anomaly: bool
    anomaly_score: float
    is_duplicate: bool

    class Config:
        from_attributes = True

# CRM Client Schemas
class CRMClientCreate(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = None
    monthly_spend: float
    engagement_score: float
    support_tickets: int
    contract_months: int
    status: Optional[str] = "Lead"

class CRMClientResponse(BaseModel):
    id: int
    name: str
    email: str
    company: Optional[str]
    monthly_spend: float
    engagement_score: float
    support_tickets: int
    contract_months: int
    conversion_probability: float
    churn_risk_score: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Inventory Schemas
class InventoryItemCreate(BaseModel):
    name: str
    current_stock: int
    minimum_stock: int
    location: Optional[str] = "Warehouse A"
    price: float
    seasonal_index: Optional[float] = 1.0
    promo_active: Optional[bool] = False

class InventoryItemResponse(BaseModel):
    id: int
    name: str
    current_stock: int
    minimum_stock: int
    location: str
    price: float
    seasonal_index: float
    promo_active: bool
    demand_forecast: int

    class Config:
        from_attributes = True

# Prediction Page Schemas
class ForecastRequest(BaseModel):
    steps: int = 6

class ForecastResponse(BaseModel):
    history: List[float]
    forecast: List[float]
    confidence_lower: List[float]
    confidence_upper: List[float]

# ML Models Lab Schemas
class ModelRetrainResponse(BaseModel):
    model_name: str
    accuracy: float
    confusion_matrix: List[List[int]]
    feature_importance: Dict[str, float]
    trained_at: datetime

# Invoice Schema
class InvoiceCreate(BaseModel):
    client_name: str
    client_email: str
    items: List[Dict[str, Any]] # {"name": str, "quantity": int, "price": float}
    gst_rate: float = 18.0

class InvoiceResponse(BaseModel):
    invoice_number: str
    client_name: str
    client_email: str
    subtotal: float
    gst_amount: float
    total: float
    date: datetime
