import { motion } from "framer-motion";
import { Shield, Globe, Users, Award, CheckCircle2 } from "lucide-react";

export const AboutSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Verified Employers",
      description: "All companies are thoroughly vetted to ensure safe and legitimate employment opportunities.",
    },
    {
      icon: Globe,
      title: "Global Opportunities",
      description: "Connect with international employers offering positions across various industries in Qatar.",
    },
    {
      icon: Users,
      title: "Dedicated Support",
      description: "Our team assists you throughout the entire application and relocation process.",
    },
    {
      icon: Award,
      title: "Premium Benefits",
      description: "Accommodation, competitive salaries, and comprehensive benefits packages included.",
    },
  ];

  const benefits = [
    "Free accommodation provided",
    "Competitive tax-free salaries",
    "Flight tickets included",
    "Health insurance coverage",
    "Career growth opportunities",
    "Multicultural work environment",
  ];

  return (
    <section id="about" className="py-20 md:py-32 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 pattern-geometric opacity-30" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-semibold text-sm mb-4">
            Why Choose Us
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Your Gateway to{" "}
            <span className="text-gradient-gold">Qatar Careers</span>
          </h2>
          <p className="text-muted-foreground text-lg font-body">
            We connect talented professionals with leading employers in Qatar,
            offering exceptional career opportunities with world-class benefits.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-card shadow-soft hover:shadow-medium transition-all duration-300 border border-border/50 hover:border-secondary/30"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-secondary/20 to-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm font-body">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-primary to-teal-700 rounded-3xl p-8 md:p-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 pattern-geometric opacity-10" />
          
          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
                Benefits Included With Every Position
              </h3>
              <p className="text-primary-foreground/80 font-body mb-6">
                All our job listings come with comprehensive benefits packages designed
                to ensure your comfort and success in Qatar.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-2 text-primary-foreground"
                >
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                  <span className="text-sm font-medium">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
