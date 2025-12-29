import { motion } from "framer-motion";
import { DollarSign, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface Job {
  id: string;
  title: string;
  company: string;
  category: string;
  type: "Full-time" | "Part-time";
  salary: string;
  description: string;
  keyRoles: string[];
  image?: string;
}

interface JobCardProps {
  job: Job;
  onApply: (job: Job) => void;
  index: number;
}

export const JobCard = ({ job, onApply, index }: JobCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group relative overflow-hidden rounded-2xl bg-card shadow-soft hover:shadow-elevated transition-all duration-500"
    >
      {/* Decorative gradient border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-secondary/20 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative">
        {/* Job Image */}
        {job.image && (
          <div className="relative h-48 w-full overflow-hidden">
            <img 
              src={job.image} 
              alt={`${job.title} professional at work`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
            <Badge 
              variant={job.type === "Full-time" ? "default" : "secondary"}
              className={`absolute top-3 right-3 ${job.type === "Full-time" 
                ? "bg-primary/90 text-primary-foreground border-primary/20" 
                : "bg-secondary/90 text-secondary-foreground border-secondary/30"
              }`}
            >
              {job.type}
            </Badge>
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/20 flex items-center justify-center shadow-soft flex-shrink-0">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors truncate">
                {job.title}
              </h3>
              <p className="text-muted-foreground font-body text-sm">{job.company}</p>
            </div>
          </div>

          {/* Category */}
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border/50 text-xs">
              {job.category}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2 font-body">
            {job.description}
          </p>

          {/* Key Roles */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-2">Key Roles:</p>
            <ul className="space-y-1">
              {job.keyRoles.slice(0, 3).map((role, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
                  <span className="truncate">{role}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Salary */}
          <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-gradient-to-r from-secondary/10 to-gold-100/50">
            <DollarSign className="w-4 h-4 text-secondary flex-shrink-0" />
            <span className="font-semibold text-foreground text-sm">{job.salary}</span>
            <span className="text-muted-foreground text-xs">/month</span>
          </div>

          {/* Apply Button */}
          <Button 
            variant="gold" 
            size="lg" 
            className="w-full"
            onClick={() => onApply(job)}
          >
            Apply Now
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
