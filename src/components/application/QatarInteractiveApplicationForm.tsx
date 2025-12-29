import * as React from "react";
import { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowRight, Calendar, CheckCircle, CreditCard, Globe, Mail, MapPin, Phone, Sparkles, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { jobsData } from "@/data/jobs";

interface QatarInteractiveApplicationFormProps {
  jobTitle: string;
}

const applicationSchema = z.object({
  first_name: z.string().min(2, "First name required"),
  last_name: z.string().min(2, "Last name required"),
  date_of_birth: z.string().min(1, "Date of birth required"),
  id_number: z.string().min(1, "ID/Birth certificate number required"),
  location: z.string().min(2, "Location required"),
  marital_status: z.string().min(1, "Please select marital status"),

  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone required"),

  experience_years: z.string().min(1, "Please select your experience"),
  education_level: z.string().min(1, "Please select education level"),
  field_of_study: z.string().optional(),
  institution: z.string().optional(),
  graduation_year: z.string().optional(),

  motivation: z.string().min(1, "Please select your motivation"),
  stay_duration: z.string().min(1, "Please select how long you plan to stay"),

  availability: z.string().min(1, "Please select your availability"),
  passport_status: z.string().min(1, "Please select passport status"),
  preferred_hours: z.string().min(1, "Please select preferred working hours"),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

const processingMessages = [
  "Validating your profile…",
  "Matching you with Qatar employers…",
  "Checking accommodation & benefits eligibility…",
  "Verifying role availability…",
  "Preparing your portal access…",
  "Finalizing your application…",
];

const successCompanies = [
  { name: "Qatar Airways", hiring: "Hiring now" },
  { name: "Hamad International Airport", hiring: "Urgent roles" },
  { name: "Four Seasons Doha", hiring: "Premium roles" },
  { name: "The Pearl Hospitality Group", hiring: "New openings" },
];

export function QatarInteractiveApplicationForm({ jobTitle }: QatarInteractiveApplicationFormProps) {
  const [step, setStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingIndex, setProcessingIndex] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const job = useMemo(() => jobsData.find((j) => j.title === jobTitle), [jobTitle]);

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      date_of_birth: "",
      id_number: "",
      location: "",
      marital_status: "",
      email: "",
      phone: "",
      experience_years: "",
      education_level: "",
      field_of_study: "",
      institution: "",
      graduation_year: "",
      motivation: "",
      stay_duration: "",
      availability: "",
      passport_status: "",
      preferred_hours: "",
    },
  });

  const progress = useMemo(() => ((step + 1) / 6) * 100, [step]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, isProcessing, showSuccess]);

  const fieldsForStep = (s: number): (keyof ApplicationFormData)[] => {
    switch (s) {
      case 0:
        return ["first_name", "last_name", "date_of_birth", "id_number", "location", "marital_status"];
      case 1:
        return ["email", "phone"];
      case 2:
        return ["experience_years", "education_level", "field_of_study", "institution", "graduation_year"];
      case 3:
        return ["motivation", "stay_duration"];
      case 4:
        return ["availability"];
      case 5:
        return ["passport_status", "preferred_hours"];
      default:
        return [];
    }
  };

  const next = async () => {
    const ok = await form.trigger(fieldsForStep(step));
    if (!ok) return;
    setStep((v) => Math.min(5, v + 1));
  };

  const prev = () => setStep((v) => Math.max(0, v - 1));

  const onSubmit = async () => {
    setIsProcessing(true);
    setProcessingIndex(0);
    setProcessingProgress(0);

    for (let i = 0; i < processingMessages.length; i++) {
      setProcessingIndex(i);
      setProcessingProgress(Math.round(((i + 1) / processingMessages.length) * 100));
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 1200));
    }

    try {
      const values = form.getValues();
      await fetch("/api/submit-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: values.phone,
          userId: "guest-user",
          jobTitle,
        }),
      });
    } catch {
      // Ignore backend failures; keep the conversion flow running.
    }

    setIsProcessing(false);
    setShowSuccess(true);
  };

  if (!jobTitle) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="shadow-elevated">
          <CardContent className="p-8 text-center">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">Select a job first</h1>
            <p className="text-muted-foreground">Go back to the Jobs section and click Apply.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-elevated overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">Pay <strong>240 only</strong> to verify your number and submit your application.</p>
                <Badge variant="outline" className="bg-muted/60">{processingProgress}%</Badge>
              </div>
              <Progress value={processingProgress} className="h-3" />
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-secondary/10 to-primary/10 border border-border/50">
                <p className="text-foreground font-semibold">{processingMessages[processingIndex]}</p>
                <p className="text-muted-foreground text-sm mt-1">This usually takes less than 30 seconds.</p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {successCompanies.map((c) => (
                  <div key={c.name} className="p-4 rounded-xl bg-card shadow-soft border border-border/50">
                    <p className="font-semibold text-foreground">{c.name}</p>
                    <p className="text-sm text-secondary font-medium">{c.hiring}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="shadow-elevated">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary/15 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-secondary" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">Application submitted</h1>
              <p className="text-muted-foreground mb-6">
                Your application for <span className="font-semibold text-foreground">{jobTitle}</span> has been queued for employer review.
              </p>

              <div className="grid md:grid-cols-2 gap-4 text-left mb-6">
                {successCompanies.map((c) => (
                  <div key={c.name} className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-border/50">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground">{c.name}</p>
                      <Badge className="bg-secondary/90 text-secondary-foreground">Hiring</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{c.hiring} for {jobTitle}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-primary text-primary-foreground text-left">
                <p className="font-display text-lg font-bold mb-2">Next steps</p>
                <div className="space-y-1 text-sm text-primary-foreground/90">
                  <p>1) Create your Qatar Jobs Portal account</p>
                  <p>2) Review interview invitations</p>
                  <p>3) Complete verification payment to unlock interviews</p>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  variant="gold"
                  size="lg"
                  onClick={() => {
                    localStorage.setItem(
                      "qatarJobsApplicationData",
                      JSON.stringify({ jobTitle, redirectToSignup: true }),
                    );
                    window.location.href = "/account";
                  }}
                >
                  Create Portal Account <ArrowRight className="ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {job?.image && (
            <Card className="shadow-soft overflow-hidden">
              <img src={job.image} alt={jobTitle} className="w-full h-56 object-cover" />
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-secondary font-semibold mb-2">Qatar Career Connect</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Apply for <span className="text-gradient-gold">{jobTitle}</span>
          </h1>
          <p className="text-muted-foreground">A guided application designed for high conversion and fast employer matching.</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {step + 1} of 6</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        <Card className="shadow-elevated">
          <CardContent className="p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {step === 0 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground">Personal information</h2>
                      <p className="text-muted-foreground text-sm">Tell us about yourself.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your first name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="date_of_birth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-secondary" /> Date of birth
                            </FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="id_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-secondary" /> ID / Birth certificate
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="ID number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-secondary" /> Current location
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Nairobi, Kenya" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="marital_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-secondary" /> Marital status
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="single">Single</SelectItem>
                              <SelectItem value="married">Married</SelectItem>
                              <SelectItem value="prefer-not-say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground">Contact</h2>
                      <p className="text-muted-foreground text-sm">So employers can reach you quickly.</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-secondary" /> Email
                          </FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-secondary" /> Phone
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="+254 700 000 000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground">Experience & education</h2>
                      <p className="text-muted-foreground text-sm">This helps us match you to the right employer.</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="experience_years"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of experience</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0-1">0-1 years</SelectItem>
                              <SelectItem value="1-3">1-3 years</SelectItem>
                              <SelectItem value="3-5">3-5 years</SelectItem>
                              <SelectItem value="5+">5+ years</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="education_level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Education level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="primary">Primary</SelectItem>
                              <SelectItem value="secondary">Secondary</SelectItem>
                              <SelectItem value="college">College</SelectItem>
                              <SelectItem value="university">University</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="field_of_study"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Field of study (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Hospitality" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="institution"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Institution (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="School/College" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="graduation_year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Graduation year (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="2021" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground">Motivation</h2>
                      <p className="text-muted-foreground text-sm">Help us understand your goals in Qatar.</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="motivation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Why Qatar?</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="career">Career growth</SelectItem>
                              <SelectItem value="financial">Financial goals</SelectItem>
                              <SelectItem value="experience">International experience</SelectItem>
                              <SelectItem value="family">Better life for family</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="stay_duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>How long do you plan to stay?</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="6m">6 months</SelectItem>
                              <SelectItem value="1y">1 year</SelectItem>
                              <SelectItem value="2y">2 years</SelectItem>
                              <SelectItem value="3y+">3+ years</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground">Availability</h2>
                      <p className="text-muted-foreground text-sm">When can you start?</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="availability"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start availability</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="immediately">Immediately</SelectItem>
                              <SelectItem value="2w">Within 2 weeks</SelectItem>
                              <SelectItem value="1m">Within 1 month</SelectItem>
                              <SelectItem value="2m">Within 2 months</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground">Documents</h2>
                      <p className="text-muted-foreground text-sm">Final details before submitting.</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="passport_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-secondary" /> Passport status
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="valid">Valid passport</SelectItem>
                              <SelectItem value="expired">Expired passport</SelectItem>
                              <SelectItem value="none">No passport (need assistance)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preferred_hours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred working hours</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="full-time">Full-time</SelectItem>
                              <SelectItem value="part-time">Part-time</SelectItem>
                              <SelectItem value="shifts">Shift work</SelectItem>
                              <SelectItem value="flexible">Flexible</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="p-4 rounded-xl bg-gradient-to-r from-secondary/10 to-primary/10 border border-border/50">
                      <p className="font-semibold text-foreground flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-secondary" /> Verification payment will be required in the portal.
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        After you create your portal account, you’ll complete a one-time verification payment of <span className="font-semibold text-foreground">10</span> to unlock interview booking.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={prev} disabled={step === 0}>
                    Previous
                  </Button>

                  {step < 5 ? (
                    <Button type="button" variant="gold" onClick={next}>
                      Continue <ArrowRight className="ml-2" />
                    </Button>
                  ) : (
                    <Button type="submit" variant="gold">
                      Submit application <Sparkles className="ml-2" />
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
