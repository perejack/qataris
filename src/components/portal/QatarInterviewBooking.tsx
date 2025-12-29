import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Calendar, CheckCircle, CreditCard, Phone, ShieldCheck, Timer } from "lucide-react";
import { format, parse } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

type Step = "details" | "schedule" | "payment" | "confirmation";

const stepMeta: Record<Step, { label: string; value: number }> = {
  details: { label: "Start", value: 10 },
  schedule: { label: "Choose slot", value: 55 },
  payment: { label: "Payment", value: 88 },
  confirmation: { label: "Confirmed", value: 100 },
};

export function QatarInterviewBooking({
  onBack,
  company,
  position,
  salary,
  location,
}: {
  onBack: () => void;
  company: string;
  position: string;
  salary: string;
  location: string;
}) {
  const [step, setStep] = useState<Step>("details");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isAlmostThereDialogOpen, setIsAlmostThereDialogOpen] = useState(false);
  const [isHoldDialogOpen, setIsHoldDialogOpen] = useState(false);
  const [isPaymentHelpDialogOpen, setIsPaymentHelpDialogOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"PENDING" | "SUCCESS" | "FAILED" | null>(null);
  const [checkoutId, setCheckoutId] = useState<string>("");
  const [holdSecondsLeft, setHoldSecondsLeft] = useState<number>(0);

  const minSelectableDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    return d;
  }, []);

  const maxSelectableDate = useMemo(() => new Date(2026, 11, 31), []);

  const selectedDateObj = useMemo(() => {
    if (!selectedDate) return undefined;
    return parse(selectedDate, "yyyy-MM-dd", new Date());
  }, [selectedDate]);

  const selectedDateLabel = useMemo(() => {
    if (!selectedDateObj) return "";
    return format(selectedDateObj, "EEEE, MMM d, yyyy");
  }, [selectedDateObj]);

  const timeSlots = useMemo(() => ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"], []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  useEffect(() => {
    if (step !== "payment") {
      setHoldSecondsLeft(0);
      return;
    }

    setHoldSecondsLeft(8 * 60);
    const interval = setInterval(() => {
      setHoldSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  const holdTimeLabel = useMemo(() => {
    const m = Math.floor(holdSecondsLeft / 60);
    const s = holdSecondsLeft % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }, [holdSecondsLeft]);

  const startPolling = (reference: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment-status?reference=${encodeURIComponent(reference)}`);
        const json = await res.json();

        if (json?.success && json?.payment?.status) {
          const status = json.payment.status as "PENDING" | "SUCCESS" | "FAILED";
          setPaymentStatus(status);

          if (status === "SUCCESS") {
            clearInterval(interval);
            setIsProcessingPayment(false);
            setStep("confirmation");
          }

          if (status === "FAILED") {
            clearInterval(interval);
            setIsProcessingPayment(false);
          }
        }
      } catch {
        // ignore polling errors
      }
    }, 3000);

    setTimeout(() => {
      clearInterval(interval);
      setIsProcessingPayment(false);
      setPaymentStatus((prev) => (prev === "PENDING" ? "FAILED" : prev));
    }, 120000);
  };

  const initiatePayment = async () => {
    if (!phone || phone.length < 9) {
      setPaymentStatus("FAILED");
      return;
    }

    setIsProcessingPayment(true);
    setPaymentStatus("PENDING");

    try {
      const res = await fetch("/api/initiate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phone.startsWith("254") ? phone : `254${phone.replace(/^0/, "")}`,
          amount: 240,
          description: "Qatar Jobs Portal Verification",
        }),
      });

      const json = await res.json();
      if (!json?.success) {
        setPaymentStatus("FAILED");
        setIsProcessingPayment(false);
        return;
      }

      const requestId =
        json.data?.checkoutRequestId ||
        json.data?.requestId ||
        json.data?.transactionRequestId ||
        json.data?.reference;

      if (!requestId) {
        setPaymentStatus("FAILED");
        setIsProcessingPayment(false);
        return;
      }

      setCheckoutId(requestId);
      startPolling(requestId);
    } catch {
      setPaymentStatus("FAILED");
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="border-b border-border/60 bg-background/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2" /> Back
          </Button>
          <div className="text-right">
            <p className="font-display font-bold text-foreground">Interview Booking</p>
            <p className="text-xs text-muted-foreground">{company}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle className="font-display">{position} • {location}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-secondary/90 text-secondary-foreground">{company}</Badge>
                <Badge variant="outline" className="bg-muted/60">{salary}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">{stepMeta[step].label}</p>
                  <p className="text-xs text-muted-foreground">
                    Step {step === "details" ? 1 : step === "schedule" ? 2 : step === "payment" ? 3 : 4} of 4
                  </p>
                </div>
                <Progress value={stepMeta[step].value} className="h-2" />
                <div className="grid grid-cols-3 gap-2">
                  <div className={`p-2 rounded-lg border text-xs ${step === "schedule" || step === "payment" || step === "confirmation" ? "border-secondary bg-secondary/10 text-foreground" : "border-border/60 bg-card text-muted-foreground"}`}>
                    1. Choose slot
                  </div>
                  <div className={`p-2 rounded-lg border text-xs ${step === "payment" || step === "confirmation" ? "border-secondary bg-secondary/10 text-foreground" : "border-border/60 bg-card text-muted-foreground"}`}>
                    2. Confirm & complete
                  </div>
                  <div className={`p-2 rounded-lg border text-xs ${step === "confirmation" ? "border-secondary bg-secondary/10 text-foreground" : "border-border/60 bg-card text-muted-foreground"}`}>
                    3. Confirm
                  </div>
                </div>
              </div>

              {(step === "details" || step === "schedule") && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-border/60">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">You’re almost there</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Priority invite from <span className="font-semibold text-foreground">{company}</span>.
                        Complete the last step to lock your interview.
                      </p>
                    </div>
                    <Badge className="bg-emerald-600/90 text-white shrink-0">Priority</Badge>
                  </div>
                  <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-red-500 text-white">High demand</Badge>
                      <Badge className="bg-secondary/90 text-secondary-foreground">Shortlist active</Badge>
                    </div>
                    <Button
                      type="button"
                      variant="gold"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => setIsAlmostThereDialogOpen(true)}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {step === "details" && (
                <div className="space-y-4">
                  <Button
                    type="button"
                    variant="gold"
                    onClick={() => setIsAlmostThereDialogOpen(true)}
                    className="w-full sm:w-auto"
                  >
                    Continue
                  </Button>
                </div>
              )}

              {step === "schedule" && (
                <div className="space-y-4">
                  {(selectedDate || selectedTime) && (
                    <div className="p-4 rounded-xl border border-border/60 bg-card">
                      <p className="font-semibold text-foreground">Your selection</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedDateLabel || "Select a date"}{selectedTime ? ` • ${selectedTime}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Next: confirm with a one-time verification payment of 10 to lock this slot.
                      </p>
                    </div>
                  )}

                  <div className="p-4 rounded-xl border border-border/60 bg-card">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">Pick date & time</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Choose any future date up to December 2026.
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-muted/60 shrink-0">Future only</Badge>
                    </div>
                    <div className="mt-4">
                      <Button
                        type="button"
                        variant="gold"
                        className="w-full sm:w-auto"
                        onClick={() => setIsScheduleDialogOpen(true)}
                      >
                        <Calendar className="mr-2" /> Open date & time picker
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep("details")}>Back</Button>
                    <Button
                      variant="gold"
                      onClick={() => {
                        setStep("payment");
                      }}
                      disabled={!selectedDate || !selectedTime}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {step === "payment" && (
                <div className="space-y-4">
                  <div className="grid gap-3">
                    <div className="p-4 rounded-xl border border-border/60 bg-gradient-to-r from-red-500/10 to-secondary/10">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">Slot hold</p>
                          <p className="text-sm text-muted-foreground mt-1">Pay to confirm before it’s released.</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {holdSecondsLeft > 0 ? (
                            <Badge className="bg-red-500 text-white">Hold: {holdTimeLabel}</Badge>
                          ) : (
                            <Badge className="bg-muted text-muted-foreground">Hold expired</Badge>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsHoldDialogOpen(true)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-border/60 bg-card">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">Slot summary</p>
                          <p className="text-sm text-muted-foreground mt-1 break-words">
                            {company} • {selectedDateLabel || selectedDate} at {selectedTime}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setStep("schedule");
                            setIsScheduleDialogOpen(true);
                          }}
                        >
                          Change
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border/60 bg-card">
                    <p className="font-semibold text-foreground flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-secondary" /> Verification Payment: 10
                    </p>
                    <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                      <p className="text-sm text-muted-foreground">
                        STK prompt → enter PIN.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => setIsPaymentHelpDialogOpen(true)}
                      >
                        How it works
                      </Button>
                    </div>

                    <div className="mt-4">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Phone className="w-4 h-4 text-secondary" /> Phone number
                      </label>
                      <Input
                        placeholder="2547XXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\s/g, ""))}
                        className="mt-2"
                      />
                    </div>

                    <div className="mt-4">
                      <Button variant="gold" onClick={initiatePayment} disabled={isProcessingPayment} className="w-full">
                        {isProcessingPayment ? "Sending STK…" : "Confirm & complete slot"}
                      </Button>
                    </div>

                    {paymentStatus && (
                      <div className="mt-4">
                        <Badge className={paymentStatus === "SUCCESS" ? "bg-secondary/90" : paymentStatus === "PENDING" ? "bg-muted" : "bg-destructive"}>
                          {paymentStatus}
                        </Badge>
                        {checkoutId && (
                          <p className="text-xs text-muted-foreground mt-1">Reference: {checkoutId}</p>
                        )}
                        {paymentStatus === "PENDING" && <Progress value={60} className="h-2 mt-3" />}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => setStep("schedule")}>
                      Back
                    </Button>
                    <Button
                      variant="gold"
                      className="w-full sm:w-auto"
                      onClick={() => setStep("confirmation")}
                      disabled={paymentStatus !== "SUCCESS"}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {step === "confirmation" && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-secondary/10 to-primary/10 border border-border/60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <p className="font-display font-bold text-foreground">Interview booked</p>
                        <p className="text-sm text-muted-foreground">{selectedDateLabel || selectedDate} at {selectedTime}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      You are verified. Employers can now message you and proceed with onboarding steps.
                    </p>
                  </div>

                  <Button variant="gold" onClick={onBack}>
                    Return to dashboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
            <DialogContent className="!left-0 !right-0 !bottom-0 !top-auto !translate-x-0 !translate-y-0 w-full !max-w-none max-h-[calc(100vh-0.5rem)] overflow-auto rounded-t-2xl rounded-b-none p-0 lg:!left-[50%] lg:!top-[50%] lg:!bottom-auto lg:!right-auto lg:!translate-x-[-50%] lg:!translate-y-[-50%] lg:!max-w-lg lg:rounded-lg lg:max-h-[80vh]">
              <div className="p-5 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
                <DialogHeader className="text-left pr-10">
                  <DialogTitle>Pick your interview date & time</DialogTitle>
                  <DialogDescription>
                    Select a future date (up to Dec 31, 2026), then choose a time slot.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4 rounded-2xl border border-border/60 bg-card">
                  <div className="p-3 border-b border-border/60">
                    <p className="text-sm font-semibold text-foreground">Select a date</p>
                    <p className="text-xs text-muted-foreground">Only future dates are available.</p>
                  </div>
                  <div className="p-2">
                    <CalendarPicker
                      mode="single"
                      selected={selectedDateObj}
                      onSelect={(d) => {
                        if (!d) return;
                        setSelectedDate(format(d, "yyyy-MM-dd"));
                        setSelectedTime("");
                      }}
                      disabled={[{ before: minSelectableDate }, { after: maxSelectableDate }]}
                      fromMonth={minSelectableDate}
                      toMonth={maxSelectableDate}
                      initialFocus
                    />
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-border/60 bg-card">
                  <div className="p-3 border-b border-border/60">
                    <p className="text-sm font-semibold text-foreground">Select a time</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedDateLabel ? `For ${selectedDateLabel}` : "Choose a date first"}
                    </p>
                  </div>
                  <div className="p-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {timeSlots.map((t) => (
                        <button
                          key={t}
                          type="button"
                          disabled={!selectedDate}
                          className={`p-2 rounded-lg border text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            selectedTime === t ? "border-secondary bg-secondary/10" : "border-border/60 bg-card"
                          }`}
                          onClick={() => setSelectedTime(t)}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <DialogFooter className="mt-5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsScheduleDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="gold"
                    disabled={!selectedDate || !selectedTime}
                    onClick={() => {
                      setIsScheduleDialogOpen(false);
                      setStep("payment");
                    }}
                  >
                    Confirm selection
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAlmostThereDialogOpen} onOpenChange={setIsAlmostThereDialogOpen}>
            <DialogContent className="!left-0 !right-0 !bottom-0 !top-auto !translate-x-0 !translate-y-0 w-full !max-w-none max-h-[calc(100vh-0.5rem)] overflow-auto rounded-t-2xl rounded-b-none p-0 lg:!left-[50%] lg:!top-[50%] lg:!bottom-auto lg:!right-auto lg:!translate-x-[-50%] lg:!translate-y-[-50%] lg:!max-w-lg lg:rounded-lg lg:max-h-[80vh]">
              <div className="p-5 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
                <DialogHeader className="text-left pr-10">
                  <DialogTitle>Finish now to stay on the shortlist</DialogTitle>
                  <DialogDescription>
                    Completing verification keeps your profile active and pushes you into the next employer review.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4 p-4 rounded-2xl border border-border/60 bg-card">
                  <p className="font-semibold text-foreground">
                    You’ve been shortlisted for <span className="font-display">{position}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Most candidates complete booking in under 2 minutes. Choose a slot now to continue.
                  </p>
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="gold"
                      className="w-full"
                      onClick={() => {
                        setIsAlmostThereDialogOpen(false);
                        setStep("schedule");
                        setIsScheduleDialogOpen(true);
                      }}
                    >
                      <Calendar className="mr-2" /> Choose your interview slot
                    </Button>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-2xl border border-border/60 bg-card">
                  <p className="text-sm font-semibold text-foreground">Don’t lose your shortlist position</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Candidates who complete verification today are placed higher in the next employer review queue.
                    If you delay, the invite can expire.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge className="bg-red-500 text-white">High demand</Badge>
                    <Badge className="bg-secondary/90 text-secondary-foreground">Shortlist active</Badge>
                    <Badge className="bg-muted text-muted-foreground">24h response window</Badge>
                  </div>
                </div>

                <div className="mt-4 grid sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl border border-border/60 bg-card">
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-secondary" /> One-time verification
                    </p>
                    <p className="text-base font-semibold text-foreground mt-1">240 only</p>
                    <p className="text-xs text-muted-foreground mt-2">No recurring fees. One payment unlocks scheduling.</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-border/60 bg-card">
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <Timer className="w-4 h-4 text-secondary" /> Fast confirmation
                    </p>
                    <p className="text-base font-semibold text-foreground mt-1">STK prompt → PIN</p>
                    <p className="text-xs text-muted-foreground mt-2">Takes under a minute for most users.</p>
                  </div>
                </div>

                <DialogFooter className="mt-5">
                  <Button type="button" variant="outline" onClick={() => setIsAlmostThereDialogOpen(false)}>
                    Close
                  </Button>
                  <Button
                    type="button"
                    variant="gold"
                    onClick={() => {
                      setIsAlmostThereDialogOpen(false);
                      setStep("schedule");
                      setIsScheduleDialogOpen(true);
                    }}
                  >
                    Continue
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isHoldDialogOpen} onOpenChange={setIsHoldDialogOpen}>
            <DialogContent className="!left-0 !right-0 !bottom-0 !top-auto !translate-x-0 !translate-y-0 w-full !max-w-none max-h-[calc(100vh-0.5rem)] overflow-auto rounded-t-2xl rounded-b-none p-0 lg:!left-[50%] lg:!top-[50%] lg:!bottom-auto lg:!right-auto lg:!translate-x-[-50%] lg:!translate-y-[-50%] lg:!max-w-lg lg:rounded-lg lg:max-h-[80vh]">
              <div className="p-5 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
                <DialogHeader className="text-left pr-10">
                  <DialogTitle>Slot hold</DialogTitle>
                  <DialogDescription>
                    This timer helps you finish quickly—your slot can be released if you delay.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4 p-4 rounded-2xl border border-border/60 bg-card">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-foreground">Hold time remaining</p>
                    {holdSecondsLeft > 0 ? (
                      <Badge className="bg-red-500 text-white">{holdTimeLabel}</Badge>
                    ) : (
                      <Badge className="bg-muted text-muted-foreground">Expired</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    To confirm your interview, complete the one-time verification payment. If the hold expires, you can still pick another slot.
                  </p>
                </div>

                <DialogFooter className="mt-5">
                  <Button type="button" variant="outline" onClick={() => setIsHoldDialogOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isPaymentHelpDialogOpen} onOpenChange={setIsPaymentHelpDialogOpen}>
            <DialogContent className="!left-0 !right-0 !bottom-0 !top-auto !translate-x-0 !translate-y-0 w-full !max-w-none max-h-[calc(100vh-0.5rem)] overflow-auto rounded-t-2xl rounded-b-none p-0 lg:!left-[50%] lg:!top-[50%] lg:!bottom-auto lg:!right-auto lg:!translate-x-[-50%] lg:!translate-y-[-50%] lg:!max-w-lg lg:rounded-lg lg:max-h-[80vh]">
              <div className="p-5 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
                <DialogHeader className="text-left pr-10">
                  <DialogTitle>How payment works</DialogTitle>
                  <DialogDescription>
                    You’ll receive an STK prompt. Enter your PIN to complete verification.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-3">
                  <div className="p-4 rounded-2xl border border-border/60 bg-card">
                    <p className="font-semibold text-foreground">1) Enter phone number</p>
                    <p className="text-sm text-muted-foreground mt-1">Use the number that will receive the STK prompt.</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-border/60 bg-card">
                    <p className="font-semibold text-foreground">2) Approve STK prompt</p>
                    <p className="text-sm text-muted-foreground mt-1">You’ll see a prompt on your phone—confirm and enter your PIN.</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-border/60 bg-card">
                    <p className="font-semibold text-foreground">3) Confirmation</p>
                    <p className="text-sm text-muted-foreground mt-1">Your dashboard updates instantly and your slot is confirmed.</p>
                  </div>

                  <div className="p-4 rounded-2xl border border-border/60 bg-muted/40">
                    <p className="text-sm text-muted-foreground">
                      One-time verification fee: <span className="font-semibold text-foreground">240</span>.
                      You’ll get a receipt after successful payment.
                    </p>
                  </div>
                </div>

                <DialogFooter className="mt-5">
                  <Button type="button" variant="outline" onClick={() => setIsPaymentHelpDialogOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
