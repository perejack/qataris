import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { QatarInteractiveApplicationForm } from "@/components/application/QatarInteractiveApplicationForm";

const Apply = () => {
  const [searchParams] = useSearchParams();
  const jobTitle = searchParams.get("job") || "";

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
