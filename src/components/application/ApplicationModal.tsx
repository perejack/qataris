import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Check, User, Mail, Phone, Briefcase, GraduationCap, Sparkles } from "lucide-react";
import { Job } from "@/components/jobs/JobCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface ApplicationModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Contact", icon: Mail },
  { id: 3, title: "Experience", icon: Briefcase },
  { id: 4, title: "Motivation", icon: Sparkles },
];

export const ApplicationModal = ({ job, isOpen, onClose }: ApplicationModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    idNumber: "",
    currentLocation: "",
    maritalStatus: "",
    email: "",
    phone: "",
    yearsExperience: "",
    educationLevel: "",
    fieldOfStudy: "",
    institutionName: "",
    graduationYear: "",
    motivation: "",
    stayDuration: "",
    startDate: "",
    hasPassport: "",
    preferredHours: "",
  });

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    toast({
      title: "Application Submitted!",
      description: `Your application for ${job?.title} at ${job?.company} has been received. We'll be in touch soon!`,
    });
    onClose();
    setCurrentStep(1);
    setFormData({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      idNumber: "",
      currentLocation: "",
      maritalStatus: "",
      email: "",
      phone: "",
      yearsExperience: "",
      educationLevel: "",
      fieldOfStudy: "",
      institutionName: "",
      graduationYear: "",
      motivation: "",
      stayDuration: "",
      startDate: "",
      hasPassport: "",
      preferredHours: "",
    });
  };

  if (!isOpen || !job) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-3xl shadow-elevated"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-primary to-teal-600 p-6 rounded-t-3xl">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center text-primary-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-display text-2xl font-bold text-primary-foreground mb-1">
              Apply for {job.title}
            </h2>
            <p className="text-primary-foreground/70">{job.company}</p>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mt-6">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                      currentStep >= step.id
                        ? "bg-secondary text-foreground"
                        : "bg-primary-foreground/20 text-primary-foreground/60"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`hidden sm:block w-12 lg:w-20 h-0.5 mx-2 transition-all duration-300 ${
                        currentStep > step.id ? "bg-secondary" : "bg-primary-foreground/20"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <h3 className="font-display text-xl font-semibold text-foreground mb-6">
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="Enter your first name"
                        value={formData.firstName}
                        onChange={(e) => updateFormData("firstName", e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter your last name"
                        value={formData.lastName}
                        onChange={(e) => updateFormData("lastName", e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="idNumber">ID/Birth Certificate Number</Label>
                    <Input
                      id="idNumber"
                      placeholder="Enter your ID or birth certificate number"
                      value={formData.idNumber}
                      onChange={(e) => updateFormData("idNumber", e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="currentLocation">Current Location</Label>
                    <Input
                      id="currentLocation"
                      placeholder="e.g., Nairobi, Kenya"
                      value={formData.currentLocation}
                      onChange={(e) => updateFormData("currentLocation", e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label>Marital Status</Label>
                    <Select
                      value={formData.maritalStatus}
                      onValueChange={(value) => updateFormData("maritalStatus", value)}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select your marital status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Contact */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <h3 className="font-display text-xl font-semibold text-foreground mb-6">
                    Contact Information
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    How can Qatar employers reach you for exciting opportunities?
                  </p>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@email.com"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+254 (700) 123-456"
                      value={formData.phone}
                      onChange={(e) => updateFormData("phone", e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 3: Experience & Education */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <h3 className="font-display text-xl font-semibold text-foreground mb-6">
                    Experience & Education
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Tell us about your professional journey and educational background
                  </p>

                  <div>
                    <Label>Years of Experience</Label>
                    <Select
                      value={formData.yearsExperience}
                      onValueChange={(value) => updateFormData("yearsExperience", value)}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level (0-1 years)</SelectItem>
                        <SelectItem value="junior">Junior (1-3 years)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (3-5 years)</SelectItem>
                        <SelectItem value="senior">Senior (5+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Level of Education</Label>
                    <Select
                      value={formData.educationLevel}
                      onValueChange={(value) => updateFormData("educationLevel", value)}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high-school">High School</SelectItem>
                        <SelectItem value="diploma">Diploma</SelectItem>
                        <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                        <SelectItem value="masters">Master's Degree</SelectItem>
                        <SelectItem value="phd">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="fieldOfStudy">Field of Study</Label>
                    <Input
                      id="fieldOfStudy"
                      placeholder="e.g., Business Administration, Engineering"
                      value={formData.fieldOfStudy}
                      onChange={(e) => updateFormData("fieldOfStudy", e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="institutionName">Institution Name</Label>
                    <Input
                      id="institutionName"
                      placeholder="Name of your school/college/university"
                      value={formData.institutionName}
                      onChange={(e) => updateFormData("institutionName", e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="graduationYear">Year of Graduation</Label>
                    <Input
                      id="graduationYear"
                      type="number"
                      placeholder="2020"
                      value={formData.graduationYear}
                      onChange={(e) => updateFormData("graduationYear", e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 4: Motivation */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <h3 className="font-display text-xl font-semibold text-foreground mb-6">
                    Your Motivation
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Tell us what excites you about working as a {job.title} in beautiful Qatar
                  </p>

                  <div>
                    <Label>What motivates you to work in Qatar?</Label>
                    <Select
                      value={formData.motivation}
                      onValueChange={(value) => updateFormData("motivation", value)}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select your motivation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="career-growth">Career Growth Opportunities</SelectItem>
                        <SelectItem value="financial">Financial Goals</SelectItem>
                        <SelectItem value="experience">International Experience</SelectItem>
                        <SelectItem value="adventure">Adventure & New Culture</SelectItem>
                        <SelectItem value="family">Better Life for Family</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>How long do you plan to stay in Qatar?</Label>
                    <Select
                      value={formData.stayDuration}
                      onValueChange={(value) => updateFormData("stayDuration", value)}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select intended stay duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6-months">6 months</SelectItem>
                        <SelectItem value="1-year">1 year</SelectItem>
                        <SelectItem value="2-years">2 years</SelectItem>
                        <SelectItem value="long-term">Long-term (3+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>When can you start?</Label>
                    <Select
                      value={formData.startDate}
                      onValueChange={(value) => updateFormData("startDate", value)}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select start availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediately">Immediately</SelectItem>
                        <SelectItem value="2-weeks">Within 2 weeks</SelectItem>
                        <SelectItem value="1-month">Within 1 month</SelectItem>
                        <SelectItem value="2-months">Within 2 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Do you have a passport?</Label>
                    <Select
                      value={formData.hasPassport}
                      onValueChange={(value) => updateFormData("hasPassport", value)}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select passport status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes, I have a valid passport</SelectItem>
                        <SelectItem value="expired">I have an expired passport</SelectItem>
                        <SelectItem value="no">No, I need help applying</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Preferred working hours</Label>
                    <Select
                      value={formData.preferredHours}
                      onValueChange={(value) => updateFormData("preferredHours", value)}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select preferred schedule" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time (40+ hours/week)</SelectItem>
                        <SelectItem value="part-time">Part-time (20-30 hours/week)</SelectItem>
                        <SelectItem value="flexible">Flexible schedule</SelectItem>
                        <SelectItem value="shifts">Shift work</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button variant="gold" onClick={handleNext} className="gap-2">
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button variant="gold" onClick={handleSubmit} className="gap-2">
                  Submit Application
                  <Check className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
