import { motion } from "framer-motion";
import { Search, FileText, CheckCircle, Plane } from "lucide-react";

export const HowItWorksSection = () => {
  const steps = [
    {
      icon: Search,
      step: "01",
      title: "Browse Jobs",
      description: "Explore hundreds of verified job listings across various industries in Qatar.",
    },
    {
      icon: FileText,
      step: "02",
      title: "Apply Online",
      description: "Complete our simple multi-step application form with your details and experience.",
    },
    {
      icon: CheckCircle,
      step: "03",
      title: "Get Selected",
      description: "Our team reviews your application and matches you with the perfect employer.",
    },
    {
      icon: Plane,
      step: "04",
      title: "Start Working",
      description: "Receive your visa, travel to Qatar, and begin your exciting new career.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-4">
            Simple Process
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            How It <span className="text-gradient-gold">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg font-body">
            Your journey to a rewarding career in Qatar is just four simple steps away.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-secondary/50 to-transparent" />
              )}

              <div className="relative p-6 rounded-2xl bg-card shadow-soft hover:shadow-medium transition-all duration-300 border border-border/50 group">
                {/* Step Number */}
                <span className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-gold-400 flex items-center justify-center text-sm font-bold text-foreground shadow-gold">
                  {step.step}
                </span>

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm font-body">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
