/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  Receipt,
  CheckCircle,
  BarChart3,
  CreditCard,
  Banknote,
  Smartphone,
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  Package,
  Home,
  Shield,
  Car,
  Trash2,
  Droplets,
  Users,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  FileType,
  Building,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { Expense } from "@/services/expenseService";
import type { LocalPayment } from "./Billing";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  client: string;
  amount: number;
  status: "pending" | "paid" | "overdue";
  date: string;
  invoiceType: "tax" | "perform";
  items: InvoiceItem[];
  tax: number;
  clientEmail?: string;
  site?: string;
  serviceType?: string;
  gstNumber?: string;
  paymentMethod?: string;
  baseAmount?: number;
  managementFeesAmount?: number;
}

interface Payment {
  id: string;
  invoiceId: string;
  client: string;
  amount: number;
  date: string;
  method: string;
  status: "completed" | "failed" | "pending";
}

interface PaymentSummaryTabProps {
  invoices: Invoice[];
  payments: LocalPayment[];   // ← was Payment[]
  expenses: Expense[];
  onExportData: (type: string) => void;
}
// ─── Helper Functions ────────────────────────────────────────────────────────

const getPaymentMethodIcon = (method: string): React.ComponentType<{ className?: string }> => {
  const m = (method || "").toLowerCase();
  if (m.includes("bank")) return Banknote;
  if (m.includes("upi")) return Smartphone;
  if (m.includes("credit") || m.includes("debit")) return CreditCard;
  if (m.includes("cash")) return Wallet;
  return CreditCard;
};

const getServiceIcon = (serviceType: string = "") => {
  const st = serviceType.toLowerCase();
  if (st.includes("housekeeping")) return <Home className="h-4 w-4 text-blue-600" />;
  if (st.includes("security")) return <Shield className="h-4 w-4 text-green-600" />;
  if (st.includes("parking")) return <Car className="h-4 w-4 text-purple-600" />;
  if (st.includes("waste")) return <Trash2 className="h-4 w-4 text-red-600" />;
  if (st.includes("stp")) return <Droplets className="h-4 w-4 text-cyan-600" />;
  return <Package className="h-4 w-4 text-gray-600" />;
};

const getExpenseCategoryIcon = (category: string = "") => {
  const cat = category.toLowerCase();
  if (cat.includes("cleaning")) return <Package className="h-4 w-4 text-blue-600" />;
  if (cat.includes("security")) return <Shield className="h-4 w-4 text-green-600" />;
  if (cat.includes("office")) return <Package className="h-4 w-4 text-purple-600" />;
  if (cat.includes("utility")) return <Droplets className="h-4 w-4 text-cyan-600" />;
  if (cat.includes("maintenance")) return <Trash2 className="h-4 w-4 text-red-600" />;
  if (cat.includes("transport")) return <Car className="h-4 w-4 text-orange-600" />;
  return <Receipt className="h-4 w-4 text-gray-600" />;
};

const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  const s = status.toLowerCase();
  if (s === "paid" || s === "approved") return "default";
  if (s === "pending") return "secondary";
  if (s === "overdue" || s === "rejected") return "destructive";
  return "outline";
};

// Resolve a display site name off an Expense (siteId can be an object or string)
const getExpenseSiteName = (exp: Expense): string =>
  typeof exp.siteId === "object" && exp.siteId !== null ? exp.siteId.name : (exp.siteId as string) || "—";

// ─── Mobile‑Friendly Sub‑Components ──────────────────────────────────────

const MobileStatCard = ({ title, value, icon: Icon, color = "blue", subValue, trend }: any) => {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    purple: "bg-purple-100 text-purple-600",
    yellow: "bg-yellow-100 text-yellow-600",
  };
  return (
    <Card>
      <CardContent className="p-2.5">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground truncate">{title}</p>
            <p className="text-lg font-bold mt-0.5 truncate">{value}</p>
            {subValue && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{subValue}</p>}
            {trend && <div className="mt-1">{trend}</div>}
          </div>
          <div className={`p-2 rounded-lg shrink-0 ${colorClasses[color]}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MobileInvoiceCard = ({ invoice }: { invoice: Invoice }) => {
  const PaymentIcon = getPaymentMethodIcon(invoice.paymentMethod || "");
  const [expanded, setExpanded] = useState(false);
  return (
    <Card className="mb-2 overflow-hidden">
      <CardContent className="p-2.5">
        <div className="flex items-start justify-between mb-1.5">
          <div className="min-w-0">
            <p className="text-[11px] font-mono text-muted-foreground truncate">{invoice.invoiceNumber}</p>
            <h3 className="font-semibold text-sm mt-0.5 truncate">{invoice.client}</h3>
          </div>
          <Badge variant={getStatusBadgeVariant(invoice.status)} className="text-xs shrink-0">
            {invoice.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <div className="flex items-center gap-1 text-xs">
            {getServiceIcon(invoice.serviceType)}
            <span className="text-muted-foreground">{invoice.serviceType || "N/A"}</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span>{formatDate(invoice.date)}</span>
          </div>
          {invoice.paymentMethod && (
            <div className="flex items-center gap-1 text-xs">
              <PaymentIcon className="h-3 w-3 text-purple-600" />
              <span className="text-muted-foreground">{invoice.paymentMethod}</span>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center mt-1.5 pt-1.5 border-t">
          <span className="text-xs font-medium">Total:</span>
          <span className="text-sm font-bold text-green-600">{formatCurrency(invoice.amount)}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
        {expanded && (
          <div className="mt-1.5 pt-1.5 border-t text-xs space-y-0.5">
            <p><span className="font-semibold">GST:</span> {formatCurrency(invoice.tax)}</p>
            <p><span className="font-semibold">Site:</span> {invoice.site || "—"}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const MobileExpenseCard = ({ expense }: { expense: Expense }) => {
  const IconComponent = getPaymentMethodIcon(expense.paymentMethod);
  const [expanded, setExpanded] = useState(false);
  return (
    <Card className="mb-2 overflow-hidden">
      <CardContent className="p-2.5">
        <div className="flex items-start justify-between mb-1.5">
          <div className="min-w-0">
            <p className="text-[11px] font-mono text-muted-foreground">{formatDate(expense.date)}</p>
            <h3 className="font-semibold text-sm mt-0.5 truncate">{expense.description}</h3>
          </div>
          <Badge variant="outline" className="text-xs shrink-0">
            {getExpenseCategoryIcon(expense.category)}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <div className="flex items-center gap-1 text-xs">
            {getExpenseCategoryIcon(expense.category)}
            <span className="text-muted-foreground">{expense.category}</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Building className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground truncate max-w-[100px]">{getExpenseSiteName(expense)}</span>
          </div>
          <Badge variant="outline" className="flex items-center gap-1 text-xs">
            <IconComponent className="h-3 w-3" />
            {expense.paymentMethod}
          </Badge>
        </div>
        <div className="flex justify-between items-center mt-1.5 pt-1.5 border-t">
          <span className="text-xs font-medium">Total:</span>
          <span className="text-sm font-bold text-red-600">{formatCurrency(expense.amount)}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
        {expanded && (
          <div className="mt-1.5 pt-1.5 border-t text-xs space-y-0.5">
            <p><span className="font-semibold">Vendor:</span> {expense.vendor}</p>
            <p><span className="font-semibold">Type:</span> {expense.expenseType}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const PaymentSummaryTab: React.FC<PaymentSummaryTabProps> = ({ invoices, payments, expenses, onExportData }) => {
  const [selectedView, setSelectedView] = useState<"summary" | "invoices" | "expenses">("summary");
  const [isMobileView, setIsMobileView] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Derived data
  const paidTaxInvoices = invoices.filter(i => i.status === "paid" && i.invoiceType === "tax");
  // Real Expense records have no "status" field — an expense only exists
  // once it has already been recorded/approved (maintenance approval flow
  // creates the expense directly), so treat all of them as finalized.
  const approvedExpenses = expenses;
  const pendingInvoices = invoices.filter(i => i.status === "pending");
  const overdueInvoices = invoices.filter(i => i.status === "overdue");

  const totalRevenue = paidTaxInvoices.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = approvedExpenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Payment method distribution (paid invoices + expenses)
  const methodTotals: Record<string, { count: number; amount: number }> = {};
  let totalAmount = 0;
  approvedExpenses.forEach(e => {
    const m = e.paymentMethod || "Unknown";
    methodTotals[m] = methodTotals[m] || { count: 0, amount: 0 };
    methodTotals[m].count++;
    methodTotals[m].amount += e.amount;
    totalAmount += e.amount;
  });
  paidTaxInvoices.forEach(i => {
    const m = i.paymentMethod || "Unknown";
    methodTotals[m] = methodTotals[m] || { count: 0, amount: 0 };
    methodTotals[m].count++;
    methodTotals[m].amount += i.amount;
    totalAmount += i.amount;
  });
  const paymentMethods = Object.entries(methodTotals).map(([method, data]) => ({
    method,
    ...data,
    percentage: totalAmount > 0 ? Math.round((data.amount / totalAmount) * 100) : 0,
    Icon: getPaymentMethodIcon(method),
  })).sort((a, b) => b.amount - a.amount);
  const topMethod = paymentMethods[0];

  // Render helper for desktop table views
  const renderDesktopInvoices = () => (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice No</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paidTaxInvoices.map(inv => (
            <TableRow key={inv.id}>
              <TableCell>{inv.invoiceNumber}</TableCell>
              <TableCell>{inv.client}</TableCell>
              <TableCell>{inv.serviceType || "-"}</TableCell>
              <TableCell>{formatDate(inv.date)}</TableCell>
              <TableCell className="font-semibold text-green-600">{formatCurrency(inv.amount)}</TableCell>
              <TableCell>{inv.paymentMethod || "-"}</TableCell>
              <TableCell><Badge variant={getStatusBadgeVariant(inv.status)}>{inv.status}</Badge></TableCell>
            </TableRow>
          ))}
          {paidTaxInvoices.length === 0 && (
            <TableRow><TableCell colSpan={7} className="text-center py-8">No paid tax invoices</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  const renderDesktopExpenses = () => (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Site</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {approvedExpenses.map(exp => (
            <TableRow key={exp._id}>
              <TableCell>{exp.category}</TableCell>
              <TableCell className="max-w-xs truncate">{exp.description}</TableCell>
              <TableCell>{exp.vendor}</TableCell>
              <TableCell>{getExpenseSiteName(exp)}</TableCell>
              <TableCell>{formatDate(exp.date)}</TableCell>
              <TableCell className="font-semibold text-red-600">{formatCurrency(exp.amount)}</TableCell>
              <TableCell>{exp.paymentMethod || "-"}</TableCell>
            </TableRow>
          ))}
          {approvedExpenses.length === 0 && (
            <TableRow><TableCell colSpan={7} className="text-center py-8">No expenses</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 p-3 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
          <BarChart3 className="h-5 w-5 text-primary" />
          Financial Summary
        </CardTitle>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button variant="outline" size="sm" className="h-8" onClick={() => onExportData("summary")}>
            Export
          </Button>
        </div>
      </CardHeader>

      {/* View Toggle - Mobile Dropdown / Desktop Buttons */}
      {isMobileView ? (
        <div className="px-3 pb-3">
          <Select value={selectedView} onValueChange={(v: any) => setSelectedView(v)}>
            <SelectTrigger className="w-full h-10">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">📊 Summary</SelectItem>
              <SelectItem value="invoices">📄 Paid Invoices ({paidTaxInvoices.length})</SelectItem>
              <SelectItem value="expenses">🧾 Expenses ({approvedExpenses.length})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="px-6 pb-4">
          <div className="flex border rounded-lg p-1 w-fit">
            <Button variant={selectedView === "summary" ? "default" : "ghost"} size="sm" onClick={() => setSelectedView("summary")}>
              <BarChart3 className="mr-2 h-4 w-4" /> Summary
            </Button>
            <Button variant={selectedView === "invoices" ? "default" : "ghost"} size="sm" onClick={() => setSelectedView("invoices")}>
              <FileType className="mr-2 h-4 w-4" /> Paid Invoices ({paidTaxInvoices.length})
            </Button>
            <Button variant={selectedView === "expenses" ? "default" : "ghost"} size="sm" onClick={() => setSelectedView("expenses")}>
              <Receipt className="mr-2 h-4 w-4" /> Expenses ({approvedExpenses.length})
            </Button>
          </div>
        </div>
      )}

      <CardContent className="space-y-3 p-3 sm:p-6 pt-0">
        {selectedView === "summary" && (
          <>
            {/* Stats Cards (mobile‑friendly) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {isMobileView ? (
                <>
                  <MobileStatCard
                    title="Revenue"
                    value={formatCurrency(totalRevenue)}
                    icon={DollarSign}
                    color="green"
                    subValue={`${paidTaxInvoices.length} paid`}
                    trend={<TrendingUp className="h-3 w-3 text-green-600" />}
                  />
                  <MobileStatCard
                    title="Expenses"
                    value={formatCurrency(totalExpenses)}
                    icon={Receipt}
                    color="red"
                    subValue={`${approvedExpenses.length} recorded`}
                    trend={<TrendingDown className="h-3 w-3 text-red-600" />}
                  />
                  <MobileStatCard
                    title="Net Profit"
                    value={formatCurrency(netProfit)}
                    icon={BarChart3}
                    color={netProfit >= 0 ? "green" : "red"}
                    subValue={`${profitMargin.toFixed(1)}% margin`}
                  />
                  <MobileStatCard
                    title="Methods"
                    value={paymentMethods.length.toString()}
                    icon={CreditCard}
                    color="purple"
                    subValue={topMethod?.method || "No Data"}
                  />
                </>
              ) : (
                // Desktop summary cards (compact)
                <>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Revenue</p>
                          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
                          <p className="text-xs text-muted-foreground">{paidTaxInvoices.length} paid invoices</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="mt-4 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Pending:</span>
                          <span className="text-yellow-600">{formatCurrency(pendingInvoices.reduce((s, i) => s + i.amount, 0))}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Overdue:</span>
                          <span className="text-red-600">{formatCurrency(overdueInvoices.reduce((s, i) => s + i.amount, 0))}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card><CardContent className="pt-6"><div className="flex justify-between"><div><p className="text-sm text-muted-foreground">Total Expenses</p><p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p><p className="text-xs text-muted-foreground">{approvedExpenses.length} recorded</p></div><Receipt className="h-8 w-8 text-red-600" /></div></CardContent></Card>
                  <Card><CardContent className="pt-6"><div className="flex justify-between"><div><p className="text-sm text-muted-foreground">Net Profit</p><p className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(netProfit)}</p><p className="text-xs text-muted-foreground">{profitMargin.toFixed(1)}% margin</p></div>{netProfit >= 0 ? <TrendingUp className="h-8 w-8 text-green-600" /> : <TrendingDown className="h-8 w-8 text-red-600" />}</div></CardContent></Card>
                  <Card><CardContent className="pt-6"><div className="flex justify-between"><div><p className="text-sm text-muted-foreground">Payment Methods</p><p className="text-2xl font-bold text-purple-600">{paymentMethods.length}</p><p className="text-sm font-semibold">{topMethod?.method || "No Data"}</p></div><CreditCard className="h-8 w-8 text-purple-600" /></div><div className="mt-4 space-y-1">{paymentMethods.slice(0, 2).map(m => (<div key={m.method} className="flex justify-between text-sm"><span>{m.method}</span><span>{m.percentage}%</span></div>))}</div></CardContent></Card>
                </>
              )}
            </div>

            {/* Payment Methods Distribution (progress bars) */}
            <Card>
              <CardHeader className="p-3 sm:p-6 pb-2"><CardTitle className="text-sm sm:text-base">Payment Methods Distribution</CardTitle></CardHeader>
              <CardContent className="space-y-3 p-3 sm:p-6 pt-0">
                {paymentMethods.length > 0 ? paymentMethods.map(m => {
                  const Icon = m.Icon;
                  return (
                    <div key={m.method} className="space-y-1">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <div className="flex items-center gap-2"><Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" /><span>{m.method}</span></div>
                        <span>{m.percentage}% ({formatCurrency(m.amount)})</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${m.percentage}%` }} />
                      </div>
                    </div>
                  );
                }) : <div className="text-center text-sm text-muted-foreground">No payment data</div>}
              </CardContent>
            </Card>

            {/* Recent Invoices and Recent Expenses */}
            {isMobileView ? (
              <>
                <div>
                  <h3 className="font-semibold text-sm mb-2">Recent Paid Invoices</h3>
                  {paidTaxInvoices.slice(0, 3).map(inv => <MobileInvoiceCard key={inv.id} invoice={inv} />)}
                  {paidTaxInvoices.length === 0 && <p className="text-center text-sm text-muted-foreground">No paid invoices</p>}
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-2">Recent Expenses</h3>
                  {approvedExpenses.slice(0, 3).map(exp => <MobileExpenseCard key={exp._id} expense={exp} />)}
                  {approvedExpenses.length === 0 && <p className="text-center text-sm text-muted-foreground">No expenses</p>}
                </div>
              </>
            ) : (
              <>
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-600" />Recent Paid Tax Invoices</CardTitle></CardHeader>
                  <CardContent>{renderDesktopInvoices()}</CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-600" />Recent Expenses</CardTitle></CardHeader>
                  <CardContent>{renderDesktopExpenses()}</CardContent>
                </Card>
              </>
            )}
          </>
        )}

        {selectedView === "invoices" && (
          <Card>
            <CardHeader className="p-3 sm:p-6"><CardTitle className="text-sm sm:text-base">All Paid Tax Invoices ({paidTaxInvoices.length})</CardTitle></CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              {isMobileView ? (
                <div className="space-y-2">{paidTaxInvoices.map(inv => <MobileInvoiceCard key={inv.id} invoice={inv} />)}</div>
              ) : renderDesktopInvoices()}
            </CardContent>
          </Card>
        )}

        {selectedView === "expenses" && (
          <Card>
            <CardHeader className="p-3 sm:p-6"><CardTitle className="text-sm sm:text-base">All Expenses ({approvedExpenses.length})</CardTitle></CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              {isMobileView ? (
                <div className="space-y-2">{approvedExpenses.map(exp => <MobileExpenseCard key={exp._id} expense={exp} />)}</div>
              ) : renderDesktopExpenses()}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentSummaryTab;