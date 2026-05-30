import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

// Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CRM from "./pages/CRM";
import Inventory from "./pages/Inventory";
import Finance from "./pages/Finance";
import Predictions from "./pages/Predictions";
import ModelsLab from "./pages/ModelsLab";
import Reports from "./pages/Reports";

const DashboardLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState("dashboard");
  const { isAuthenticated, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (loading) {
    return (
      <div className="bg-brand-bg min-h-screen flex items-center justify-center text-slate-500 animate-pulse text-xs tracking-widest uppercase">
        Initializing BizIntel Node...
      </div>
    );
  }

  // If not authenticated, render site or login form
  if (!isAuthenticated) {
    if (showLogin) {
      return <Login onBackToLanding={() => setShowLogin(false)} />;
    }
    return (
      <LandingPage
        onLaunchDashboard={() => setShowLogin(true)}
        onExploreAI={() => {
          // Explores AI means sending user to pricing or listing features
          const el = document.getElementById("features");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />
    );
  }

  // Route mapping
  const renderContent = () => {
    switch (currentTab) {
      case "dashboard":
        return <Dashboard />;
      case "crm":
        return <CRM />;
      case "inventory":
        return <Inventory />;
      case "finance":
        return <Finance />;
      case "predictions":
        return <Predictions />;
      case "models_lab":
        return <ModelsLab />;
      case "reports":
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="bg-brand-bg text-slate-100 min-h-screen flex overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Glow orbs in background */}
        <div className="glow-orb glow-orb-primary w-[300px] h-[300px] -top-12 -right-12" />
        <div className="glow-orb glow-orb-secondary w-[250px] h-[250px] -bottom-12 left-1/4" />

        {/* Header Navbar */}
        <Navbar title={currentTab} />

        {/* Dashboard Workspace Router */}
        <main className="flex-1 overflow-hidden relative z-10">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DashboardLayout />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
