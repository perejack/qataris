import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Bell, Calendar, ChevronLeft, LogOut, MessageSquare, Sparkles, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QatarInterviewBooking } from "@/components/portal/QatarInterviewBooking";

type Page = "dashboard" | "notifications" | "messages";

const CountBadge = ({ count }: { count: number }) => {
  if (!count) return null;

  return (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] leading-[18px] text-center font-semibold shadow-sm">
      {count > 99 ? "99+" : count}
    </span>
  );
};

const buildStaticData = (position: string) => {
  const normalized = position?.toLowerCase?.() || "chef";

  const companies = [
    {
      id: 1,
      company: "Four Seasons Doha",
      position,
      salary: "QAR 7,500 - 10,500",
      location: "Doha, Qatar",
      type: "Full-time",
    },
    {
      id: 2,
      company: "Qatar Airways",
      position,
      salary: "QAR 8,200 - 12,000",
      location: "Doha, Qatar",
      type: "Full-time",
    },
    {
      id: 3,
      company: normalized.includes("driver") ? "Doha Logistics" : "The Pearl Hospitality Group",
      position,
      salary: "QAR 6,500 - 9,000",
      location: "The Pearl, Qatar",
      type: "Full-time",
    },
  ];

  const messages = [
    {
      id: 1,
      company: companies[0].company,
      subject: `Interview Invitation: ${position}`,
      time: "5 minutes ago",
      body: `We reviewed your profile and would like to invite you for an interview for the ${position} role. Please book a slot to proceed.`,
      isNew: true,
    },
    {
      id: 2,
      company: companies[1].company,
      subject: `Next Steps: ${position}`,
      time: "1 hour ago",
      body: "Complete verification to unlock interview scheduling and proceed with employer onboarding.",
      isNew: true,
    },
  ];

  const notifications = [
    {
      id: 1,
      title: "New interview request",
      message: `${companies[0].company} wants to interview you for ${position}`,
      time: "5 minutes ago",
      priority: "high" as const,
      isNew: true,
    },
    {
      id: 2,
      title: "Profile matched",
      message: `Your ${position} profile matched 3 employers in Doha.`,
      time: "25 minutes ago",
      priority: "medium" as const,
      isNew: true,
    },
  ];

  return { companies, messages, notifications };
};

export function QatarDashboard({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [page, setPage] = useState<Page>("dashboard");
  const [bookingCompany, setBookingCompany] = useState<any>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);

  const data = useMemo(() => buildStaticData(user?.positionApplied || "Chef"), [user?.positionApplied]);
  const [messages, setMessages] = useState(() => data.messages);
  const [notifications, setNotifications] = useState(() => data.notifications);

  useEffect(() => {
    setMessages(data.messages);
    setNotifications(data.notifications);
    setSelectedMessageId(null);
  }, [data.messages, data.notifications]);

  const unreadMessageCount = useMemo(() => messages.filter((m) => m.isNew).length, [messages]);
  const unreadNotificationCount = useMemo(() => notifications.filter((n) => n.isNew).length, [notifications]);

  const selectedMessage = useMemo(
    () => messages.find((m) => m.id === selectedMessageId) || null,
    [messages, selectedMessageId],
  );

  if (bookingCompany) {
    return (
      <QatarInterviewBooking
        company={bookingCompany.company}
        position={bookingCompany.position}
        salary={bookingCompany.salary}
        location={bookingCompany.location}
        onBack={() => setBookingCompany(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/60 bg-background/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center shadow-medium shrink-0">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="font-display font-bold text-foreground leading-tight truncate">Qatar Jobs Portal</p>
              <p className="text-xs text-muted-foreground truncate">Welcome, {user?.fullName || user?.username}</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Button variant={page === "dashboard" ? "default" : "ghost"} onClick={() => setPage("dashboard")}>
              <User className="mr-2" /> Dashboard
            </Button>
            <Button
              variant={page === "messages" ? "default" : "ghost"}
              onClick={() => {
                setPage("messages");
                setSelectedMessageId(null);
              }}
              className="relative"
            >
              <MessageSquare className="mr-2" /> Messages
              <CountBadge count={unreadMessageCount} />
            </Button>
            <Button
              variant={page === "notifications" ? "default" : "ghost"}
              onClick={() => setPage("notifications")}
              className="relative"
            >
              <Bell className="mr-2" /> Alerts
              <CountBadge count={unreadNotificationCount} />
            </Button>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="mr-2" /> Logout
            </Button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8 pb-28 md:pb-8">
        {page === "dashboard" && (
          <div className="space-y-6">
            <Card className="shadow-soft border border-border/60 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5">
              <CardContent className="p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-display font-bold text-foreground leading-tight">
                    You’re one step away from interview slots in Doha
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Employers are actively shortlisting for <span className="font-semibold text-foreground">{user?.positionApplied}</span>.
                    Complete verification and book an interview to secure your slot.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge className="bg-emerald-600/90 text-white">Profile submitted</Badge>
                    <Badge className="bg-emerald-600/90 text-white">Application approved</Badge>
                    <Badge className="bg-muted text-muted-foreground">Interview not booked</Badge>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <Button
                    variant="gold"
                    className="w-full sm:w-auto"
                    onClick={() => setBookingCompany(data.companies[0])}
                  >
                    <Calendar className="mr-2" /> Complete & Book
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setPage("messages");
                      setSelectedMessageId(null);
                    }}
                  >
                    View inbox
                    {unreadMessageCount ? <span className="ml-2 text-xs font-semibold text-red-500">({unreadMessageCount})</span> : null}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-3 gap-6">
            <Card className="shadow-soft lg:col-span-2">
              <CardHeader>
                <CardTitle className="font-display">Interview-ready employers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.companies.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl border border-border/60 bg-gradient-to-r from-primary/5 to-secondary/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{c.company}</p>
                      <p className="text-sm text-muted-foreground">{c.position} • {c.location}</p>
                      <p className="text-sm text-secondary font-semibold">{c.salary}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                      <Badge className="bg-secondary/90 text-secondary-foreground w-fit">Priority</Badge>
                      <Button variant="gold" onClick={() => setBookingCompany(c)} className="w-full sm:w-auto">
                        <Calendar className="mr-2" /> Book Interview
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="font-display">Account status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 rounded-2xl bg-muted/60 border border-border/60">
                  <p className="text-sm text-muted-foreground">Position</p>
                  <p className="font-semibold text-foreground">{user?.positionApplied}</p>
                </div>
                <div className="p-4 rounded-2xl bg-muted/60 border border-border/60">
                  <p className="text-sm text-muted-foreground">Verification</p>
                  <p className="font-semibold text-foreground">Required</p>
                  <p className="text-xs text-muted-foreground mt-1">One-time payment: 10 • Complete in Interview Booking to unlock scheduling.</p>
                </div>
              </CardContent>
            </Card>
            </div>
          </div>
        )}

        {page === "messages" && (
          <Card className="shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="font-display">
                  {selectedMessage ? "Inbox" : "Messages"}
                </CardTitle>
                {selectedMessage ? (
                  <Button variant="outline" size="sm" onClick={() => setSelectedMessageId(null)}>
                    <ChevronLeft className="mr-2 w-4 h-4" /> Back
                  </Button>
                ) : null}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {!selectedMessage && (
                <div className="space-y-3">
                  {messages.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, isNew: false } : x)));
                        setSelectedMessageId(m.id);
                      }}
                      className="w-full text-left p-4 rounded-2xl border border-border/60 bg-card hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{m.subject}</p>
                          <p className="text-sm text-muted-foreground truncate">{m.company} • {m.time}</p>
                        </div>
                        {m.isNew ? (
                          <span className="shrink-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] leading-[18px] font-semibold">
                            1
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{m.body}</p>
                    </button>
                  ))}
                </div>
              )}

              {selectedMessage && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl border border-border/60 bg-card">
                    <p className="font-semibold text-foreground">{selectedMessage.subject}</p>
                    <p className="text-sm text-muted-foreground mt-1">{selectedMessage.company} • {selectedMessage.time}</p>
                    <p className="text-sm text-muted-foreground mt-4">{selectedMessage.body}</p>
                  </div>

                  <div className="p-4 rounded-2xl border border-border/60 bg-gradient-to-r from-secondary/10 to-primary/10">
                    <p className="font-semibold text-foreground">Next step: book your slot</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Booking keeps your profile active and confirms you for the next employer shortlist.
                    </p>
                    <div className="mt-4">
                      <Button
                        variant="gold"
                        className="w-full sm:w-auto"
                        onClick={() => {
                          const company = data.companies.find((c) => c.company === selectedMessage.company) || data.companies[0];
                          setBookingCompany(company);
                        }}
                      >
                        <Calendar className="mr-2" /> Book Interview
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {page === "notifications" && (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="font-display">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, isNew: false } : x)))}
                  className="w-full text-left p-4 rounded-2xl border border-border/60 bg-card hover:bg-muted/40 transition-colors flex items-start justify-between gap-3"
                >
                  <div>
                    <p className="font-semibold text-foreground">{n.title}</p>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    {n.isNew ? (
                      <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] leading-[18px] font-semibold">
                        1
                      </span>
                    ) : null}
                    <Badge className={n.priority === "high" ? "bg-secondary/90 text-secondary-foreground" : "bg-muted text-muted-foreground"}>
                      {n.priority}
                    </Badge>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/90 backdrop-blur-lg">
        <div className="container mx-auto px-4 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)]">
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant={page === "dashboard" ? "default" : "ghost"}
              onClick={() => setPage("dashboard")}
              className="h-11"
            >
              <User className="mr-2" /> Home
            </Button>
            <Button
              type="button"
              variant={page === "messages" ? "default" : "ghost"}
              onClick={() => {
                setPage("messages");
                setSelectedMessageId(null);
              }}
              className="h-11 relative"
            >
              <MessageSquare className="mr-2" /> Messages
              <CountBadge count={unreadMessageCount} />
            </Button>
            <Button
              type="button"
              variant={page === "notifications" ? "default" : "ghost"}
              onClick={() => setPage("notifications")}
              className="h-11 relative"
            >
              <Bell className="mr-2" /> Alerts
              <CountBadge count={unreadNotificationCount} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
