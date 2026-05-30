from sqlalchemy import create_engine, Column, Integer, Float, String, Boolean, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
from app.config import settings

# Determine database URL
db_url = settings.SUPABASE_DB_URL if settings.SUPABASE_DB_URL else settings.FALLBACK_DB_URL

# SQLite needs check_same_thread=False
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(db_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# SQLAlchemy Models

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="Employee")  # Admin, Manager, Employee
    full_name = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    is_anomaly = Column(Boolean, default=False)
    anomaly_score = Column(Float, default=0.0)
    is_duplicate = Column(Boolean, default=False)

class CRMCient(Base):
    __tablename__ = "crm_clients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    company = Column(String(100), nullable=True)
    monthly_spend = Column(Float, default=0.0)
    engagement_score = Column(Float, default=0.0) # 0 to 100
    support_tickets = Column(Integer, default=0)
    contract_months = Column(Integer, default=12)
    conversion_probability = Column(Float, default=0.0) # For Lead scoring (Logistic Regression)
    churn_risk_score = Column(Float, default=0.0) # For Churn prediction (Random Forest)
    status = Column(String(50), default="Lead") # Lead, Active, Churned, Lost
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class InventoryItem(Base):
    __tablename__ = "inventory_items"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    current_stock = Column(Integer, default=0)
    minimum_stock = Column(Integer, default=10)
    location = Column(String(100), default="Warehouse A")
    price = Column(Float, default=0.0)
    seasonal_index = Column(Float, default=1.0) # 0.5 to 2.0
    promo_active = Column(Boolean, default=False)
    demand_forecast = Column(Integer, default=0) # Predicted quantity (XGBoost/GBR)

class SalesRecord(Base):
    __tablename__ = "sales_records"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String(100), default="General")

class MLModelInfo(Base):
    __tablename__ = "ml_models"
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), unique=True, nullable=False)
    accuracy = Column(Float, default=0.85)
    features = Column(String(255), default="")
    trained_at = Column(DateTime, default=datetime.datetime.utcnow)
    metrics_json = Column(Text, default="{}") # Precision, Recall, Confusion Matrix data

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
