import { useEffect, useMemo, useState } from "react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ExplorerRow = {
  payment_attempt_id: string;
  checkout_request_id: string;
  purpose: string;
  payment_status: string;
  amount: number | string | null;
  phone_number: string | null;
  payment_created_at: string;
  payment_updated_at: string;

  application_id: string | null;
  application_job_title: string | null;
  application_email: string | null;
  application_user_id: string | null;
  application_data: any;

  interview_booking_id: string | null;
  interview_company: string | null;
  interview_position: string | null;
  interview_type: string | null;
  interview_at: string | null;
  interview_status: string | null;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

function formatAmount(value: ExplorerRow["amount"]) {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return String(value);
  return `${num}`;
}

function StatusBadge({ value }: { value: string }) {
  const normalized = String(value || "").toLowerCase();

  const variant =
    normalized === "success" || normalized === "paid" || normalized === "completed"
      ? "secondary"
      : normalized === "failed" || normalized === "cancelled" || normalized === "canceled"
      ? "destructive"
      : "outline";

  return <Badge variant={variant as any}>{normalized || "unknown"}</Badge>;
}

const Transactions = () => {
  const [adminToken, setAdminToken] = useState("");

  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [purpose, setPurpose] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);

  const [rows, setRows] = useState<ExplorerRow[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("qatarAdminToken");
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");

    const initialToken = tokenFromUrl || stored;
    if (initialToken) {
      setAdminToken(initialToken);
      localStorage.setItem("qatarAdminToken", initialToken);
    }

    if (tokenFromUrl) {
      params.delete("token");
      const qs = params.toString();
      const nextUrl = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
      window.history.replaceState({}, "", nextUrl);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 400);
    return () => clearTimeout(t);
  }, [q]);

  const queryKey = useMemo(
    () =>
      JSON.stringify({
        adminToken,
        q: debouncedQ,
        purpose,
        status,
        page,
        pageSize,
      }),
    [adminToken, debouncedQ, purpose, status, page, pageSize],
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedQ, purpose, status]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = new URL("/api/transactions", window.location.origin);
        url.searchParams.set("page", String(page));
        url.searchParams.set("pageSize", String(pageSize));
        if (debouncedQ) url.searchParams.set("q", debouncedQ);
        if (purpose) url.searchParams.set("purpose", purpose);
        if (status) url.searchParams.set("status", status);

        const headers: Record<string, string> = {};
        if (adminToken) headers["x-admin-token"] = adminToken;

        const res = await fetch(url.toString(), { headers });
        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          setRows([]);
          setCount(null);
          setError(json?.message || `Request failed (${res.status})`);
          return;
        }

        setRows((json?.data || []) as ExplorerRow[]);
        setCount(typeof json?.count === "number" ? json.count : null);
      } catch (e: any) {
        setRows([]);
        setCount(null);
        setError(e?.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [queryKey, page, pageSize, debouncedQ, purpose, status, adminToken]);

  const totalPages = useMemo(() => {
    if (count === null) return null;
    return Math.max(1, Math.ceil(count / pageSize));
  }, [count, pageSize]);

  return (
    <div className="min-h-screen bg-background scroll-smooth">
      <Header />
      <main className="pt-16 md:pt-20">
        <div className="container mx-auto px-4 py-8">
          <Card className="shadow-elevated">
            <CardHeader className="space-y-2">
              <CardTitle className="font-display">Qatar Transactions Explorer</CardTitle>
              <div className="grid gap-3 md:grid-cols-4">
                <Input
                  placeholder="Admin token"
                  value={adminToken}
                  onChange={(e) => {
                    const next = e.target.value;
                    setAdminToken(next);
                    localStorage.setItem("qatarAdminToken", next);
                  }}
                />
                <Input placeholder="Search (phone, checkout id, company, email…)" value={q} onChange={(e) => setQ(e.target.value)} />
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                >
                  <option value="">All purposes</option>
                  <option value="interview_booking">interview_booking</option>
                  <option value="application">application</option>
                  <option value="unknown">unknown</option>
                </select>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">All statuses</option>
                  <option value="pending">pending</option>
                  <option value="success">success</option>
                  <option value="failed">failed</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </div>

              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-muted-foreground">
                  {count === null ? "" : `Total: ${count}`}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={loading || page <= 1}
                  >
                    Previous
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Page {page}{totalPages ? ` of ${totalPages}` : ""}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => (totalPages ? Math.min(totalPages, p + 1) : p + 1))}
                    disabled={loading || (totalPages ? page >= totalPages : false)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {error && <div className="mb-4 text-sm text-destructive">{error}</div>}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Checkout ID</TableHead>
                    <TableHead>Application</TableHead>
                    <TableHead>Interview</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-muted-foreground">
                        Loading…
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading && rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-muted-foreground">
                        No rows
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading &&
                    rows.map((r) => (
                      <TableRow key={r.payment_attempt_id}>
                        <TableCell className="whitespace-nowrap">{formatDate(r.payment_created_at)}</TableCell>
                        <TableCell>
                          <StatusBadge value={r.payment_status} />
                        </TableCell>
                        <TableCell>{formatAmount(r.amount)}</TableCell>
                        <TableCell className="whitespace-nowrap">{r.phone_number || "—"}</TableCell>
                        <TableCell className="whitespace-nowrap">{r.purpose || "—"}</TableCell>
                        <TableCell className="max-w-[260px] truncate" title={r.checkout_request_id}>
                          {r.checkout_request_id}
                        </TableCell>
                        <TableCell className="max-w-[340px]">
                          <div className="space-y-1">
                            <div className="truncate" title={r.application_job_title || ""}>
                              {r.application_job_title || "—"}
                            </div>
                            <div className="text-xs text-muted-foreground truncate" title={r.application_email || ""}>
                              {r.application_email || ""}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[360px]">
                          <div className="space-y-1">
                            <div className="truncate" title={r.interview_company || ""}>
                              {r.interview_company || "—"}
                            </div>
                            <div className="text-xs text-muted-foreground truncate" title={r.interview_position || ""}>
                              {r.interview_position || ""}
                            </div>
                            <div className="text-xs text-muted-foreground whitespace-nowrap">
                              {r.interview_at ? formatDate(r.interview_at) : ""}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Transactions;
