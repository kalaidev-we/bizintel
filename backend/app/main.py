from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db, SessionLocal
from app.routes import auth, dashboard, inventory, finance, crm, predictions, models_lab, reports

# Initialize FastAPI App
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Futuristic AI-powered enterprise business intelligence and predictive operations backend.",
    version="1.0.0"
)

# Set CORS origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, lock this down to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup Database Bootstrapping and Seeding
@app.on_event("startup")
def startup_event():
    # 1. Create tables
    init_db()
    
    # 2. Seed data
    db = SessionLocal()
    try:
        # Seed users
        auth.seed_users(db)
        # Seed business items, expenses, crm clients, and sales records
        dashboard.seed_dashboard_data(db)
    finally:
        db.close()

# Root test endpoint
@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "database": "Supabase PostgreSQL (Fallback SQLite Active if credentials empty)",
        "features": ["ARIMA", "Isolation Forest", "Random Forest", "Logistic Regression", "Naive Bayes"]
    }

# Include Sub-Routers
app.include_router(auth.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(inventory.router, prefix="/api")
app.include_router(finance.router, prefix="/api")
app.include_router(crm.router, prefix="/api")
app.include_router(predictions.router, prefix="/api")
app.include_router(models_lab.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
