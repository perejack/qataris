import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { JobCard, Job } from "@/components/jobs/JobCard";
import { JobFilters } from "@/components/jobs/JobFilters";
import { jobsData } from "@/data/jobs";
import { useNavigate } from "react-router-dom";

export const JobsSection = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");

  const filteredJobs = useMemo(() => {
    return jobsData.filter((job) => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "All" || job.category === selectedCategory;
      const matchesType = selectedType === "All" || job.type === selectedType;
      
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [searchTerm, selectedCategory, selectedType]);

  const handleApply = (job: Job) => {
    navigate(`/apply?job=${encodeURIComponent(job.title)}`);
  };

  return (
    <section id="jobs" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-semibold text-sm mb-4">
            Available Positions
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Explore <span className="text-gradient-gold">Qatar Jobs</span>
          </h2>
          <p className="text-muted-foreground text-lg font-body">
            Browse through our curated list of job opportunities with top employers in Qatar.
          </p>
        </motion.div>

        {/* Filters */}
        <JobFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
        />

        {/* Results Count */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground mb-6"
        >
          Showing <span className="font-semibold text-foreground">{filteredJobs.length}</span> jobs
        </motion.p>

        {/* Jobs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredJobs.map((job, index) => (
              <JobCard
                key={job.id}
                job={job}
                onApply={handleApply}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* No Results */}
        {filteredJobs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <p className="text-muted-foreground text-lg mb-2">No jobs found matching your criteria.</p>
            <p className="text-muted-foreground">Try adjusting your filters or search term.</p>
          </motion.div>
        )}

      </div>
    </section>
  );
};
