import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { QatarInteractiveApplicationForm } from "@/components/application/QatarInteractiveApplicationForm";
import { QatarAuthSystem } from "@/components/portal/QatarAuthSystem";

const Apply = () => {
  const [searchParams] = useSearchParams();
  const jobTitle = searchParams.get("job") || "";

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display text-lg font-semibold text-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <QatarAuthSystem onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background scroll-smooth">
      <Header />
      <main className="pt-16 md:pt-20">
        <QatarInteractiveApplicationForm jobTitle={jobTitle} />
      </main>
      <Footer />
    </div>
  );
};

export default Apply;
