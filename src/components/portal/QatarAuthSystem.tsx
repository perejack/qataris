import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { LogIn, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const registerSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(4, "Password must be at least 4 characters"),
    confirmPassword: z.string().min(4, "Confirm your password"),
    fullName: z.string().min(2, "Full name required"),
    phone: z.string().min(8, "Phone required"),
    location: z.string().min(2, "Location required"),
    dateOfBirth: z.string().min(1, "Date of birth required"),
    positionApplied: z.string().min(2, "Position required"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  username: z.string().min(3, "Username required"),
  password: z.string().min(1, "Password required"),
});

type RegisterFormData = z.infer<typeof registerSchema>;
type LoginFormData = z.infer<typeof loginSchema>;

export function QatarAuthSystem({ onLogin }: { onLogin: (userData: any) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [applicationJob, setApplicationJob] = useState<string>("");

  useEffect(() => {
    const raw = localStorage.getItem("qatarJobsApplicationData");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.redirectToSignup) {
        setIsLogin(false);
        setApplicationJob(parsed?.jobTitle || "");
      }
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("qatarJobsApplicationData");
    }
  }, []);

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      phone: "",
      location: "",
      dateOfBirth: "",
      positionApplied: "",
    },
  });

  const fullNameValue = registerForm.watch("fullName");

  useEffect(() => {
    if (!isLogin && applicationJob) {
      registerForm.setValue("positionApplied", applicationJob);
    }
  }, [applicationJob, isLogin, registerForm]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const header = useMemo(() => {
    if (isLogin) return { title: "Welcome back", icon: LogIn, subtitle: "Sign in to access your portal" };
    return { title: "Create your portal account", icon: UserPlus, subtitle: "Unlock interviews & employer messages" };
  }, [isLogin]);

  const onRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 900));

    const userData = {
      id: `qatar_user_${Date.now()}`,
      username: data.username,
      password: data.password,
      fullName: data.fullName,
      phone: data.phone,
      location: data.location,
      dateOfBirth: data.dateOfBirth,
      positionApplied: data.positionApplied,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("qatarJobsUser", JSON.stringify(userData));
    setIsLoading(false);
    onLogin(userData);
  };

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 650));

    const stored = localStorage.getItem("qatarJobsUser");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (u?.username === data.username) {
          setIsLoading(false);
          onLogin(u);
          return;
        }
      } catch {
        // ignore
      }
    }

    const demoUser = {
      id: `qatar_user_${Date.now()}`,
      username: data.username,
      password: data.password,
      fullName: "Applicant",
      phone: "+254700000000",
      location: "Nairobi, Kenya",
      dateOfBirth: "1995-01-01",
      positionApplied: applicationJob || "Chef",
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("qatarJobsUser", JSON.stringify(demoUser));
    setIsLoading(false);
    onLogin(demoUser);
  };

  const Icon = header.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center mx-auto shadow-elevated mb-4">
            <Icon className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Qatar Jobs Portal</h1>
          <p className="text-muted-foreground">Secure access for interviews and offers</p>
        </div>

        <Card className="shadow-elevated">
          <CardHeader className="text-center">
            <div className="font-display text-xl font-bold text-foreground">{header.title}</div>
            <div className="text-sm text-muted-foreground">{header.subtitle}</div>
          </CardHeader>
          <CardContent className="p-6">
            {isLogin ? (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="yourusername" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" variant="gold" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in…" : "Sign in"}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setIsLogin(false);
                      loginForm.reset();
                    }}
                  >
                    Create account
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your full name"
                            autoComplete="name"
                            name={field.name}
                            ref={field.ref}
                            value={fullNameValue ?? ""}
                            onChange={(e) =>
                              registerForm.setValue("fullName", e.target.value, {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true,
                              })
                            }
                            onBlur={field.onBlur}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="yourusername" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="+254…" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={registerForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="City, Country" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="positionApplied"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Chef" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" variant="gold" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating…" : "Create account"}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setIsLogin(true);
                      registerForm.reset();
                    }}
                  >
                    Back to sign in
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
