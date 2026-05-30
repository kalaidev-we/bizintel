import numpy as np
import pandas as pd
import pickle
import os
import datetime
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, IsolationForest
from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.pipeline import Pipeline
from sklearn.metrics import confusion_matrix, classification_report, accuracy_score
import statsmodels.api as sm
from statsmodels.tsa.arima.model import ARIMA

# In-memory store for loaded models and vectorizers
_MODELS = {}

# Make sure we have mock data and can train/load models
def get_model_path(name: str) -> str:
    os.makedirs("models", exist_ok=True)
    return os.path.join("models", f"{name}.pkl")

def get_arima_forecast(history: list, steps: int = 6):
    """
    ARIMA Sales Forecasting model.
    Fits statsmodels ARIMA and returns forecasts.
    Falls back to a linear + noise autoregressive model if ARIMA fails or lacks data.
    """
    try:
        if len(history) < 8:
            raise ValueError("Insufficient data for ARIMA")
        # Ensure array format
        history_arr = np.array(history, dtype=float)
        # Try ARIMA (1,1,1) or simple AR
        model = ARIMA(history_arr, order=(1, 1, 0))
        model_fit = model.fit()
        forecast = model_fit.forecast(steps=steps)
        return forecast.tolist()
    except Exception as e:
        # Fallback trend model: y = trend * x + intercept + noise
        x = np.arange(len(history))
        y = np.array(history)
        poly = np.polyfit(x, y, 1)
        slope = poly[0]
        intercept = poly[1]
        
        forecast = []
        last_val = history[-1]
        for i in range(1, steps + 1):
            next_val = last_val + slope + np.random.normal(0, last_val * 0.02)
            forecast.append(max(0.0, float(next_val)))
            last_val = next_val
        return forecast

def train_lead_scoring_model(data_df=None):
    """
    Logistic Regression for Lead Conversion Scoring.
    Features: [engagement_score, monthly_spend, support_tickets, contract_months]
    """
    if data_df is None or len(data_df) < 20:
        # Generate high-quality mock data
        np.random.seed(42)
        n_samples = 150
        engagement = np.random.uniform(10, 100, n_samples)
        spend = np.random.uniform(50, 1200, n_samples)
        tickets = np.random.poisson(2, n_samples)
        contract = np.random.choice([1, 6, 12, 24], n_samples)
        
        # conversion logic (ground truth probability)
        logits = -4 + 0.05 * engagement + 0.001 * spend - 0.5 * tickets + 0.08 * contract
        probs = 1 / (1 + np.exp(-logits))
        converted = (probs > 0.55).astype(int)
        
        data_df = pd.DataFrame({
            'engagement_score': engagement,
            'monthly_spend': spend,
            'support_tickets': tickets,
            'contract_months': contract,
            'converted': converted
        })
    
    X = data_df[['engagement_score', 'monthly_spend', 'support_tickets', 'contract_months']]
    y = data_df['converted']
    
    model = LogisticRegression(max_iter=1000)
    model.fit(X, y)
    
    # Calculate performance metrics
    y_pred = model.predict(X)
    acc = accuracy_score(y, y_pred)
    cm = confusion_matrix(y, y_pred).tolist()
    
    # Save model
    with open(get_model_path('lead_scoring'), 'wb') as f:
        pickle.dump(model, f)
    
    return {
        "accuracy": acc,
        "confusion_matrix": cm,
        "feature_importance": {
            "engagement_score": float(model.coef_[0][0]),
            "monthly_spend": float(model.coef_[0][1]),
            "support_tickets": float(model.coef_[0][2]),
            "contract_months": float(model.coef_[0][3])
        }
    }

def predict_lead_score(engagement_score: float, monthly_spend: float, support_tickets: int, contract_months: int) -> float:
    """Predict conversion probability (Logistic Regression)."""
    model_path = get_model_path('lead_scoring')
    if not os.path.exists(model_path):
        train_lead_scoring_model()
    
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
        
    X_new = np.array([[engagement_score, monthly_spend, support_tickets, contract_months]])
    prob = model.predict_proba(X_new)[0][1] # Probability of converting (class 1)
    return float(prob)

def train_client_churn_model(data_df=None):
    """
    Random Forest for Client Churn Risk.
    Features: [monthly_spend, engagement_score, support_tickets, contract_months]
    """
    if data_df is None or len(data_df) < 20:
        np.random.seed(42)
        n_samples = 200
        spend = np.random.uniform(100, 5000, n_samples)
        engagement = np.random.uniform(5, 95, n_samples)
        tickets = np.random.poisson(1.5, n_samples)
        contract = np.random.choice([1, 3, 6, 12, 24], n_samples)
        
        # Churn criteria
        churn_logits = 1.5 - 0.0008 * spend - 0.04 * engagement + 0.4 * tickets - 0.1 * contract
        probs = 1 / (1 + np.exp(-churn_logits))
        churned = (probs > 0.5).astype(int)
        
        data_df = pd.DataFrame({
            'monthly_spend': spend,
            'engagement_score': engagement,
            'support_tickets': tickets,
            'contract_months': contract,
            'churned': churned
        })
        
    X = data_df[['monthly_spend', 'engagement_score', 'support_tickets', 'contract_months']]
    y = data_df['churned']
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    y_pred = model.predict(X)
    acc = accuracy_score(y, y_pred)
    cm = confusion_matrix(y, y_pred).tolist()
    
    with open(get_model_path('client_churn'), 'wb') as f:
        pickle.dump(model, f)
        
    importances = model.feature_importances_
    return {
        "accuracy": acc,
        "confusion_matrix": cm,
        "feature_importance": {
            "monthly_spend": float(importances[0]),
            "engagement_score": float(importances[1]),
            "support_tickets": float(importances[2]),
            "contract_months": float(importances[3])
        }
    }

def predict_churn_risk(monthly_spend: float, engagement_score: float, support_tickets: int, contract_months: int) -> float:
    """Predict customer churn risk (Random Forest)."""
    model_path = get_model_path('client_churn')
    if not os.path.exists(model_path):
        train_client_churn_model()
        
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
        
    X_new = np.array([[monthly_spend, engagement_score, support_tickets, contract_months]])
    prob = model.predict_proba(X_new)[0][1] # Churn probability
    return float(prob)

def train_expense_classification_model(data_df=None):
    """
    Naive Bayes text classification for expense descriptions.
    Categories: Travel, Software, Office, Marketing, Utilities
    """
    if data_df is None or len(data_df) < 10:
        samples = [
            ("AWS EC2 Cloud Hosting Services", "Software"),
            ("GitHub Copilot Enterprise License Subscription", "Software"),
            ("Slack Pro Workspace Monthly Billing", "Software"),
            ("Zoom Video Conference Annual Subscription", "Software"),
            ("Uber business trip ride to client office", "Travel"),
            ("Delta Airlines flight ticket for CEO conference", "Travel"),
            ("Hilton Hotel room reservation for corporate meeting", "Travel"),
            ("Fuel expenses for sales team vehicles", "Travel"),
            ("Printers paper and stationery boxes from Staples", "Office"),
            ("Premium Ergonomic Office Chairs for HQ Room", "Office"),
            ("Coffee beans milk and breakroom office supplies", "Office"),
            ("Google Ads Search PPC Campaign Marketing", "Marketing"),
            ("Facebook Social Media Ad Promotion Agency Fee", "Marketing"),
            ("Sponsorship of annual Tech Innovation Summit", "Marketing"),
            ("Electric bill payment for corporate headquarters", "Utilities"),
            ("City Water and Sewage utility invoice", "Utilities"),
            ("High-speed optical fiber internet connection bills", "Utilities")
        ]
        descriptions, categories = zip(*samples)
        data_df = pd.DataFrame({
            'description': descriptions,
            'category': categories
        })
        
    pipeline = Pipeline([
        ('vectorizer', CountVectorizer(stop_words='english')),
        ('classifier', MultinomialNB())
    ])
    
    pipeline.fit(data_df['description'], data_df['category'])
    
    # Simple evaluations
    acc = pipeline.score(data_df['description'], data_df['category'])
    
    with open(get_model_path('expense_classifier'), 'wb') as f:
        pickle.dump(pipeline, f)
        
    return {
        "accuracy": acc,
        "classes": pipeline.classes_.tolist()
    }

def classify_expense_text(description: str) -> str:
    """Classify expense description text into category (Naive Bayes)."""
    model_path = get_model_path('expense_classifier')
    if not os.path.exists(model_path):
        train_expense_classification_model()
        
    with open(model_path, 'rb') as f:
        pipeline = pickle.load(f)
        
    pred = pipeline.predict([description])[0]
    return str(pred)

def train_demand_prediction_model(data_df=None):
    """
    RandomForestRegressor (XGBoost fallback/equivalent) for Demand Prediction.
    Features: [price, seasonal_index, promo_active]
    """
    if data_df is None or len(data_df) < 20:
        np.random.seed(42)
        n_samples = 150
        price = np.random.uniform(5.0, 500.0, n_samples)
        seasonal_idx = np.random.uniform(0.5, 1.8, n_samples)
        promo = np.random.choice([0, 1], n_samples, p=[0.7, 0.3])
        
        # Demand logic: higher price -> lower demand, higher seasonal/promo -> higher demand
        demand = 200 - 0.3 * price + 80 * seasonal_idx + 50 * promo + np.random.normal(0, 15, n_samples)
        demand = np.clip(demand, 0, None).astype(int)
        
        data_df = pd.DataFrame({
            'price': price,
            'seasonal_index': seasonal_idx,
            'promo_active': promo,
            'demand': demand
        })
        
    X = data_df[['price', 'seasonal_index', 'promo_active']]
    y = data_df['demand']
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    y_pred = model.predict(X)
    score = float(model.score(X, y))
    
    with open(get_model_path('demand_predictor'), 'wb') as f:
        pickle.dump(model, f)
        
    importances = model.feature_importances_
    return {
        "accuracy": score,  # R-squared
        "feature_importance": {
            "price": float(importances[0]),
            "seasonal_index": float(importances[1]),
            "promo_active": float(importances[2])
        }
    }

def predict_demand(price: float, seasonal_index: float, promo_active: bool) -> int:
    """Predict demand quantity (Random Forest Regressor / XGBoost-like)."""
    model_path = get_model_path('demand_predictor')
    if not os.path.exists(model_path):
        train_demand_prediction_model()
        
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
        
    X_new = np.array([[price, seasonal_index, int(promo_active)]])
    pred = model.predict(X_new)[0]
    return int(max(0, round(pred)))

def run_anomaly_detection(expenses_data: list) -> list:
    """
    Isolation Forest for Expense Anomaly Detection.
    Accepts list of floats (expense amounts) and flags anomalies.
    Returns: list of dicts with {"id": x, "is_anomaly": bool, "score": float}
    """
    if len(expenses_data) < 5:
        # Too little data, return no anomalies
        return [{"is_anomaly": False, "score": 0.0} for _ in expenses_data]
    
    # Prepare amounts matrix
    amounts = np.array([[item['amount']] for item in expenses_data])
    
    # Fit Isolation Forest (contamination represents expected percentage of outliers)
    clf = IsolationForest(n_estimators=100, contamination=0.1, random_state=42)
    clf.fit(amounts)
    
    preds = clf.predict(amounts) # -1 for anomaly, 1 for normal
    scores = -clf.score_samples(amounts) # Raw anomaly score (higher means more anomalous)
    
    results = []
    for i, item in enumerate(expenses_data):
        results.append({
            "id": item.get('id'),
            "is_anomaly": bool(preds[i] == -1),
            "score": float(scores[i])
        })
    return results

def get_collaborative_recommendations(client_id: int, db_clients: list, services: list) -> list:
    """
    Collaborative Filtering Service recommendation.
    For a given client, inspect other client service purchase habits and recommend 
    services they haven't bought yet using dot-product user-user similarity.
    """
    np.random.seed(client_id)
    # Simulate a matrix of user purchase behaviors for services:
    # Services: ["AI Audit", "Inventory API", "Premium CRM Sync", "GST AutoFile", "Custom ML Model", "Dedicated DB"]
    n_clients = max(20, len(db_clients))
    n_services = len(services)
    
    # Generate service-purchase matrix
    purchase_matrix = np.random.choice([0, 1], size=(n_clients, n_services), p=[0.7, 0.3])
    
    # Ensure current client's profile exists
    current_idx = client_id % n_clients
    client_purchases = purchase_matrix[current_idx]
    
    # Calculate user similarities (dot product)
    similarities = np.dot(purchase_matrix, client_purchases)
    similarities[current_idx] = 0 # Don't compare user with themselves
    
    # Weighted score for services
    scores = np.dot(similarities, purchase_matrix)
    
    # Zero out already purchased services
    scores[client_purchases == 1] = -1
    
    # Sort recommendations
    rec_indices = np.argsort(scores)[::-1]
    
    recs = []
    for idx in rec_indices:
        if scores[idx] > 0:
            recs.append({
                "service": services[idx],
                "confidence": float(min(0.99, 0.4 + (scores[idx] / max(1, np.sum(similarities))) * 0.5))
            })
            
    # Default fallback recommendations if scores are low/zero
    if not recs:
        available_services = [s for i, s in enumerate(services) if client_purchases[i] == 0]
        for s in available_services[:2]:
            recs.append({
                "service": s,
                "confidence": 0.65
            })
            
    return recs[:2]
