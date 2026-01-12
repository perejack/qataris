import * as React from "react";
import { useEffect, useState } from "react";
import { QatarAuthSystem } from "@/components/portal/QatarAuthSystem";
import { QatarDashboard } from "@/components/portal/QatarDashboard";

export function QatarJobsApp() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("qatarJobsUser");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("qatarJobsUser");
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem("qatarJobsUser", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("qatarJobsUser");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display text-lg font-semibold text-foreground">Loading Qatar Jobs Portal…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <QatarAuthSystem onLogin={handleLogin} />;
  }

  return <QatarDashboard user={user} onLogout={handleLogout} />;
}
