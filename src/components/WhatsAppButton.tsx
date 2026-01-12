import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const whatsappNumber = "254105575260";
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-[hsl(185_65%_22%)] to-[hsl(195_60%_28%)] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
      style={{
        boxShadow: "0 4px 20px -4px hsl(185 65% 22% / 0.4)"
      }}
    >
      <MessageCircle className="w-6 h-6" />
      <span className="font-medium text-sm hidden sm:inline">Talk to us</span>
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[hsl(38_92%_50%)] to-[hsl(45_95%_60%)] opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
    </a>
  );
};

export default WhatsAppButton;
