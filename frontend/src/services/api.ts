const API_BASE_URL = typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ? "http://127.0.0.1:8000/api"
  : "/api";

function getHeaders() {
  const token = localStorage.getItem("bizintel_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || "Something went wrong";
    throw new Error(message);
  }
  return response.json();
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },
  
  async getMe() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Dashboard
  async getKpis() {
    const res = await fetch(`${API_BASE_URL}/dashboard/kpis`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getRevenueChart() {
    const res = await fetch(`${API_BASE_URL}/dashboard/revenue-chart`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getExpensesChart() {
    const res = await fetch(`${API_BASE_URL}/dashboard/expenses-chart`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getAiRecommendations() {
    const res = await fetch(`${API_BASE_URL}/dashboard/ai-recommendations`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Inventory
  async getInventory() {
    const res = await fetch(`${API_BASE_URL}/inventory`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createInventoryItem(data: any) {
    const res = await fetch(`${API_BASE_URL}/inventory`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async recalculateInventoryDemand(id: number) {
    const res = await fetch(`${API_BASE_URL}/inventory/${id}/predict-demand`, {
      method: "POST",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getInventoryAlerts() {
    const res = await fetch(`${API_BASE_URL}/inventory/alerts`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getWarehouseOptimization() {
    const res = await fetch(`${API_BASE_URL}/inventory/warehouse-optimization`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Finance & Expenses
  async getExpenses() {
    const res = await fetch(`${API_BASE_URL}/finance/expenses`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createExpense(data: any) {
    const res = await fetch(`${API_BASE_URL}/finance/expenses`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async scanAnomalies() {
    const res = await fetch(`${API_BASE_URL}/finance/scan-anomalies`, {
      method: "POST",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async generateInvoice(data: any) {
    const res = await fetch(`${API_BASE_URL}/finance/invoice`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // CRM Intelligence
  async getClients() {
    const res = await fetch(`${API_BASE_URL}/crm`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createClient(data: any) {
    const res = await fetch(`${API_BASE_URL}/crm`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async recalculateClientScores(id: number) {
    const res = await fetch(`${API_BASE_URL}/crm/${id}/recalculate-scores`, {
      method: "POST",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getClientRecommendations(id: number) {
    const res = await fetch(`${API_BASE_URL}/crm/${id}/recommendations`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getClientTimeline(id: number) {
    const res = await fetch(`${API_BASE_URL}/crm/${id}/timeline`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Predictive Analytics
  async getForecast(steps = 6) {
    const res = await fetch(`${API_BASE_URL}/predictions/forecast?steps=${steps}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Models Lab
  async getModelsStatus() {
    const res = await fetch(`${API_BASE_URL}/models-lab/status`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async retrainModel(type: string) {
    const res = await fetch(`${API_BASE_URL}/models-lab/retrain/${type}`, {
      method: "POST",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Reports
  async getReportsSummary() {
    const res = await fetch(`${API_BASE_URL}/reports/summary`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getExportData(type = "all") {
    const res = await fetch(`${API_BASE_URL}/reports/export-data?data_type=${type}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
