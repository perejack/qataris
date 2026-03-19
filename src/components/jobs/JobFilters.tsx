import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const categories = [
  "All",
  "Childcare",
  "Hospitality",
  "Maintenance",
  "Entertainment",
  "Culinary",
  "Transportation",
  "Service",
  "Skilled Trades",
  "Manufacturing",
  "Landscaping",
  "Cleaning",
  "Administrative",
  "Security",
  "Retail",
];

const jobTypes = ["All", "Full-time", "Part-time"];

interface JobFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
}

export const JobFilters = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedType,
  setSelectedType,
}: JobFiltersProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-card rounded-2xl shadow-medium p-6 mb-8"
    >
      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 h-12 bg-background border-border/50 rounded-xl text-base focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Categories */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-foreground mb-3">Categories</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "gold" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory !== category 
                ? "bg-muted hover:bg-muted/80 text-muted-foreground" 
                : ""
              }
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Job Type */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">Job Type</p>
        <div className="flex gap-2">
          {jobTypes.map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? "teal" : "ghost"}
              size="sm"
              onClick={() => setSelectedType(type)}
              className={selectedType !== type 
                ? "bg-muted hover:bg-muted/80 text-muted-foreground" 
                : ""
              }
            >
              {type}
            </Button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
