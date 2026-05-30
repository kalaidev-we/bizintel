# BizIntel AI — Enterprise Automation Platform

BizIntel AI is a production-grade, full-stack AI business intelligence and operational planning dashboard designed with a dark, space-age SaaS visual design language.

## Architecture & Technology Stack

* **Frontend**: React (Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Framer Motion)
* **Backend**: FastAPI (Python, Uvicorn)
* **Database**: **Supabase** (PostgreSQL) with a transparent local SQLite fallback (`supabase_fallback.db`) if no Supabase environment variables are provided.
* **Machine Learning**: Scikit-Learn, Statsmodels, Pandas, and NumPy.

---

## Quick Start Guide

### 1. Start the Backend API Server

First, navigate to the `backend` directory, activate the virtual environment, and boot the server:

```cmd
cd backend
# Activate virtual environment
.venv\Scripts\activate
# Start the FastAPI uvicorn engine
python run.py
```

The API server will run at `http://127.0.0.1:8000`. You can inspect the interactive OpenAPI specifications at `http://127.0.0.1:8000/docs`.

### 2. Start the Frontend React Client

In a separate terminal, navigate to the `frontend` directory and start the Vite server:

```cmd
cd frontend
# Launch Vite client
npm run dev
```

The React dashboard will run at `http://localhost:5173` (or the port specified by Vite in the console).

---

## Authentication & Role-Based Access Control

The platform implements secure JWT token authentication. You can log in using one of three preset roles to test different permissions:

| Account Type | Email | Password | PRIVILEGES |
| :--- | :--- | :--- | :--- |
| **Enterprise Admin** | `admin@bizintel.ai` | `adminpassword` | Full administration privileges (Retraining models, adding assets, viewing analytics) |
| **Operations Manager** | `manager@bizintel.ai` | `managerpassword` | Full operational access (Retrain models, add stock items, log expenses, generate invoices) |
| **Staff Analyst** | `employee@bizintel.ai` | `employeepassword` | Read-only telemetry access (Dashboard widgets, reports, model metrics) |

---

## Machine Learning Integration Highlights

The platform integrates real scikit-learn and statsmodels implementations:
1. **ARIMA (Sales Forecasting)**: Fits historical revenue to predict future month ranges with shaded confidence error boundaries.
2. **Logistic Regression (Lead Scoring)**: Evaluates CRM telemetry (engagement, tickets, contract) to calculate client conversion probabilities.
3. **Random Forest (Client Churn)**: Analyzes client metrics to flag accounts with higher churn risk.
4. **Isolation Forest (Anomaly Scanning)**: Analyzes financial records to detect transaction outliers and flag duplicates.
5. **Naive Bayes (Expense Classifier)**: Feeds textual billing descriptions into a text-vectorization classifier to automatically catalog expense categories.
6. **Collaborative Filtering (Cross-selling)**: Similarity matrix mapping to recommend appropriate operational solutions to client portfolios.
7. **AI Models Lab**: A interactive tuning board where users can trigger scikit-learn model retrain iterations, observe confusion matrices, and review feature importance curves.
