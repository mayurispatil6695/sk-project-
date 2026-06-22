// src/pages/superadmin/billing/ExpensesTab.tsx
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Trash2, Edit, Eye, DollarSign, Calendar, Building,
  Loader2, AlertCircle, X, Receipt, ChevronDown, ChevronUp,
  TrendingUp, Search, RefreshCw, CheckCircle,
  ChevronLeft, ChevronRight, Clock, Wrench,
  Check, XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { siteService, Site } from "@/services/SiteService";
import { expenseService, Expense, CreateExpenseRequest, MonthlyExpense } from "@/services/expenseService";
import { machineService, FrontendMachine } from "@/services/machineService";
import { useRole } from "@/context/RoleContext";

// ─── Props ────────────────────────────────────────────────────────────────────
// All three props are optional so Billing.tsx can either pass data down
// (controlled mode) or let this component fetch its own data (standalone mode).
interface ExpensesTabProps {
  expenses?: Expense[];
  onExpenseAdd?: (expense: Expense) => void | Promise<void>;
  onExpenseUpdate?: (expense: Expense) => void | Promise<void>;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const EXPENSE_TYPES = [
  { value: "operational", label: "Operational", icon: "🏭" },
  { value: "maintenance", label: "Maintenance", icon: "🔧" },
  { value: "salary",      label: "Salary",      icon: "💰" },
  { value: "utility",     label: "Utility",     icon: "⚡" },
  { value: "supplies",    label: "Supplies",    icon: "📦" },
  { value: "other",       label: "Other",       icon: "📌" },
];

const EXPENSE_CATEGORIES = [
  { value: "housekeeping",   label: "Housekeeping",   icon: "🧹" },
  { value: "security",       label: "Security",       icon: "🛡️" },
  { value: "parking",        label: "Parking",        icon: "🅿️" },
  { value: "waste_management", label: "Waste Mgmt",   icon: "🗑️" },
  { value: "maintenance",    label: "Maintenance",    icon: "🔧" },
  { value: "electricity",    label: "Electricity",    icon: "⚡" },
  { value: "water",          label: "Water",          icon: "💧" },
  { value: "internet",       label: "Internet",       icon: "🌐" },
  { value: "salary",         label: "Salary",         icon: "💰" },
  { value: "supplies",       label: "Supplies",       icon: "📦" },
  { value: "equipment",      label: "Equipment",      icon: "🔨" },
  { value: "transportation", label: "Transport",      icon: "🚚" },
  { value: "office_expense", label: "Office",         icon: "📋" },
  { value: "other",          label: "Other",          icon: "📌" },
];

const PAYMENT_METHODS = [
  { value: "cash",          label: "Cash",          icon: "💵" },
  { value: "bank transfer", label: "Bank Transfer", icon: "🏦" },
  { value: "credit card",   label: "Credit Card",   icon: "💳" },
  { value: "cheque",        label: "Cheque",        icon: "📝" },
  { value: "upi",           label: "UPI",           icon: "📱" },
];

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface PendingMaintenanceItem {
  machine: FrontendMachine;
  maintenanceIndex: number;
  record: {
    date: string;
    type: string;
    description: string;
    cost: number;
    performedBy: string;
    status?: string;
  };
}

const emptyForm = () => ({
  expenseType: "",
  category: "",
  description: "",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  vendor: "",
  paymentMethod: "",
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);

const formatDate = (s: string) =>
  new Date(s).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });

const getCategoryIcon = (cat: string) => EXPENSE_CATEGORIES.find(c => c.value === cat)?.icon ?? "📌";
const getPaymentIcon  = (pm: string)  => PAYMENT_METHODS.find(m => m.value === pm)?.icon ?? "💳";

// ─── Component ────────────────────────────────────────────────────────────────
const ExpensesTab = ({ expenses: propExpenses, onExpenseAdd, onExpenseUpdate }: ExpensesTabProps) => {
  const { role } = useRole();
  const isAdmin = role === "admin" || role === "superadmin";

  // Controlled vs standalone mode
  const isControlled = propExpenses !== undefined;

  const [sites,             setSites]             = useState<Site[]>([]);
  const [internalExpenses,  setInternalExpenses]  = useState<Expense[]>([]);
  const [monthlyExpenses,   setMonthlyExpenses]   = useState<MonthlyExpense[]>([]);
  const [filteredSites,     setFilteredSites]     = useState<Site[]>([]);
  const [pendingMaintenance,setPendingMaintenance] = useState<PendingMaintenanceItem[]>([]);

  // Dialogs
  const [addOpen,           setAddOpen]           = useState(false);
  const [viewOpen,          setViewOpen]          = useState(false);
  const [monthlyOpen,       setMonthlyOpen]       = useState(false);
  const [monthDetailOpen,   setMonthDetailOpen]   = useState(false);
  const [siteExpensesOpen,  setSiteExpensesOpen]  = useState(false);
  const [approveOpen,       setApproveOpen]       = useState(false);

  // Selection
  const [selectedSite,        setSelectedSite]        = useState<Site | null>(null);
  const [selectedExpense,     setSelectedExpense]     = useState<Expense | null>(null);
  const [selectedMonth,       setSelectedMonth]       = useState<MonthlyExpense | null>(null);
  const [selectedPendingItem, setSelectedPendingItem] = useState<PendingMaintenanceItem | null>(null);
  const [selectedYear,        setSelectedYear]        = useState(new Date().getFullYear());

  // UI state
  const [editMode,          setEditMode]          = useState(false);
  const [activeTab,         setActiveTab]         = useState("expenses");
  const [isLoading,         setIsLoading]         = useState(!isControlled);
  const [isSubmitting,      setIsSubmitting]      = useState(false);
  const [errorMsg,          setErrorMsg]          = useState<string | null>(null);
  const [searchQuery,       setSearchQuery]       = useState("");
  const [expandedSections,  setExpandedSections]  = useState<Set<string>>(new Set());

  // Form state
  const [formData,      setFormData]      = useState(emptyForm());
  const [customFields,  setCustomFields]  = useState<{ fieldName: string; fieldValue: string }[]>([]);
  const [newFieldName,  setNewFieldName]  = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");
  const [approvalForm,  setApprovalForm]  = useState({
    category: "maintenance", paymentMethod: "bank transfer", vendor: "", notes: "",
  });

  // The expenses to display: prop-driven or internal
  const expenses = isControlled ? propExpenses! : internalExpenses;

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = {
    totalExpenses:           expenses.reduce((s, e) => s + e.amount, 0),
    averageExpense:          expenses.length > 0 ? expenses.reduce((s, e) => s + e.amount, 0) / expenses.length : 0,
    expenseCount:            expenses.length,
    pendingMaintenanceCount: pendingMaintenance.length,
    approvedMaintenanceTotal: expenses
      .filter(e => e.expenseType === "maintenance" || e.category === "maintenance")
      .reduce((s, e) => s + e.amount, 0),
  };

  // ── Site helpers ────────────────────────────────────────────────────────────
  const getSiteNameFromMachine = useCallback((loc: string): string => {
    if (!loc) return "No site assigned";
    return (
      sites.find(s => s.name.toLowerCase() === loc.toLowerCase())?.name ??
      sites.find(s => s.location?.toLowerCase() === loc.toLowerCase())?.name ??
      loc
    );
  }, [sites]);

  const getSiteIdFromMachine = useCallback((loc: string): string | null => {
    if (!loc) return null;
    return (
      sites.find(s => s.name.toLowerCase() === loc.toLowerCase())?._id ??
      sites.find(s => s.location?.toLowerCase() === loc.toLowerCase())?._id ??
      null
    );
  }, [sites]);

  const getSiteExpenses = (siteId: string) =>
    expenses.filter(e => {
      const eid = typeof e.siteId === "object" ? e.siteId._id : e.siteId;
      return eid === siteId;
    });

  // ── Load data ───────────────────────────────────────────────────────────────
  const loadPendingMaintenance = useCallback(async () => {
    try {
      const allMachines = await machineService.getMachines();
      const pending: PendingMaintenanceItem[] = [];
      allMachines.forEach(machine => {
        machine.maintenanceHistory?.forEach((record, index) => {
          if (record.status === "pending") {
            pending.push({ machine, maintenanceIndex: index, record: { ...record } });
          }
        });
      });
      setPendingMaintenance(pending);
    } catch {
      // non-fatal
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [sitesData, expensesData] = await Promise.all([
        siteService.getAllSites(),
        expenseService.getExpenses(),
      ]);
      setSites(sitesData ?? []);
      if (!isControlled) setInternalExpenses(expensesData ?? []);
      await loadPendingMaintenance();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load data";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [isControlled, loadPendingMaintenance]);

  useEffect(() => { loadData(); }, [loadData]);

  // Filter sites by search
  useEffect(() => {
    if (!searchQuery.trim()) { setFilteredSites(sites); return; }
    const q = searchQuery.toLowerCase();
    setFilteredSites(sites.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.clientName.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q)
    ));
  }, [sites, searchQuery]);

  // ── Form helpers ────────────────────────────────────────────────────────────
  const resetForm = () => {
    setFormData(emptyForm());
    setCustomFields([]);
    setNewFieldName("");
    setNewFieldValue("");
    setEditMode(false);
    setSelectedExpense(null);
  };

  const handleAddExpense  = (site: Site) => { setSelectedSite(site); resetForm(); setAddOpen(true); };
  const handleViewSiteExp = (site: Site) => { setSelectedSite(site); setSiteExpensesOpen(true); };

  const handleViewMonthly = async (site: Site) => {
    setSelectedSite(site);
    try {
      const monthly = await expenseService.getMonthlyExpenses(site._id);
      setMonthlyExpenses(monthly);
      setMonthlyOpen(true);
    } catch { toast.error("Failed to load monthly expenses"); }
  };

  const handleViewMonthDetails = (site: Site, month: number, year: number) => {
    const monthExp = expenses.filter(e => {
      const eid = typeof e.siteId === "object" ? e.siteId._id : e.siteId;
      const d = new Date(e.date);
      return eid === site._id && d.getMonth() + 1 === month && d.getFullYear() === year;
    });
    setSelectedMonth({
      _id: { month, year }, month, year,
      totalAmount: monthExp.reduce((s, e) => s + e.amount, 0),
      count: monthExp.length,
      categories: [...new Set(monthExp.map(e => e.category))],
      expenses: monthExp,
    });
    setSelectedSite(site);
    setMonthDetailOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    const siteId = typeof expense.siteId === "object" ? expense.siteId._id : expense.siteId;
    setSelectedSite(sites.find(s => s._id === siteId) ?? null);
    setFormData({
      expenseType:   expense.expenseType,
      category:      expense.category,
      description:   expense.description,
      amount:        expense.amount.toString(),
      date:          new Date(expense.date).toISOString().split("T")[0],
      vendor:        expense.vendor,
      paymentMethod: expense.paymentMethod,
    });
    setCustomFields(expense.customFields ?? []);
    setEditMode(true);
    setAddOpen(true);
  };

  // ── Submit expense ──────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSite) { toast.error("Please select a site"); return; }

    const requiredFields = ["expenseType","category","description","amount","vendor","paymentMethod"] as const;
    for (const f of requiredFields) {
      if (!formData[f]) {
        toast.error(`Please fill in ${f.replace(/([A-Z])/g, " $1").toLowerCase()}`);
        return;
      }
    }
    if (parseFloat(formData.amount) <= 0) { toast.error("Amount must be > 0"); return; }

    const payload: CreateExpenseRequest = {
      siteId: selectedSite._id,
      ...formData,
      amount: parseFloat(formData.amount),
      customFields: customFields.filter(f => f.fieldName && f.fieldValue),
    };

    try {
      setIsSubmitting(true);
      if (editMode && selectedExpense) {
        const updated = await expenseService.updateExpense(selectedExpense._id, payload);
        if (updated) {
          if (isControlled && onExpenseUpdate) {
            await onExpenseUpdate(updated);
          } else {
            setInternalExpenses(prev => prev.map(ex => ex._id === updated._id ? updated : ex));
          }
          toast.success("Expense updated!");
        }
      } else {
        const created = await expenseService.createExpense(payload);
        if (created) {
          if (isControlled && onExpenseAdd) {
            await onExpenseAdd(created);
          } else {
            setInternalExpenses(prev => [created, ...prev]);
          }
          toast.success("Expense added!");
        }
      }
      setAddOpen(false);
      resetForm();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete expense ──────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this expense?")) return;
    try {
      const res = await expenseService.deleteExpense(id);
      if (res?.success) {
        setInternalExpenses(prev => prev.filter(e => e._id !== id));
        toast.success("Expense deleted!");
        setViewOpen(false);
        setMonthDetailOpen(false);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete expense");
    }
  };

  // ── Approve maintenance ─────────────────────────────────────────────────────
  const handleApproveMaintenance = async () => {
    if (!selectedPendingItem) return;
    if (!approvalForm.vendor) { toast.error("Please enter vendor name"); return; }

    const { machine, maintenanceIndex, record } = selectedPendingItem;
    const siteId = getSiteIdFromMachine(machine.location ?? "");
    if (!siteId) {
      toast.error(`Site not found for machine location: "${machine.location}"`);
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: CreateExpenseRequest = {
        siteId,
        expenseType:   "maintenance",
        category:      approvalForm.category,
        description:   `Maintenance: ${record.description} (Machine: ${machine.name})`,
        amount:        record.cost,
        date:          new Date().toISOString().split("T")[0],
        vendor:        approvalForm.vendor,
        paymentMethod: approvalForm.paymentMethod,
        customFields: [
          { fieldName: "Machine Name",      fieldValue: machine.name },
          { fieldName: "Machine Location",  fieldValue: machine.location ?? "Not specified" },
          { fieldName: "Maintenance Type",  fieldValue: record.type },
          { fieldName: "Performed By",      fieldValue: record.performedBy },
          { fieldName: "Notes",             fieldValue: approvalForm.notes },
        ],
      };

      const created = await expenseService.createExpense(payload);
      if (created) {
        const updated = { ...machine };
        if (updated.maintenanceHistory?.[maintenanceIndex]) {
          updated.maintenanceHistory[maintenanceIndex].status    = "approved";
          updated.maintenanceHistory[maintenanceIndex].expenseId = created._id;
          await machineService.updateMachine(machine.id, { maintenanceHistory: updated.maintenanceHistory });
        }
        if (isControlled && onExpenseAdd) {
          await onExpenseAdd(created);
        } else {
          setInternalExpenses(prev => [created, ...prev]);
        }
        await loadPendingMaintenance();
        toast.success(`Maintenance approved for site: ${getSiteNameFromMachine(machine.location ?? "")}`);
        setApproveOpen(false);
        setSelectedPendingItem(null);
        setApprovalForm({ category: "maintenance", paymentMethod: "bank transfer", vendor: "", notes: "" });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to approve maintenance");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectMaintenance = async (item: PendingMaintenanceItem) => {
    if (!confirm("Reject this maintenance request?")) return;
    try {
      const { machine, maintenanceIndex } = item;
      const updated = { ...machine };
      if (updated.maintenanceHistory?.[maintenanceIndex]) {
        updated.maintenanceHistory[maintenanceIndex].status = "rejected";
        await machineService.updateMachine(machine.id, { maintenanceHistory: updated.maintenanceHistory });
      }
      await loadPendingMaintenance();
      toast.success("Maintenance request rejected");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to reject maintenance");
    }
  };

  const toggleSection = (id: string) => {
  setExpandedSections((prev) => {
    const next = new Set(prev);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    return next;
  });
};
  // ── Loading / error ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-7 w-7 animate-spin text-primary mr-3" />
        <span className="text-sm text-muted-foreground">Loading expenses…</span>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3 max-w-full overflow-x-hidden">
      {/* Error banner */}
      {errorMsg && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-3 flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="flex-1">{errorMsg}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setErrorMsg(null)}>
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats — 2-col on mobile, 5-col on large screens */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
        {[
          { label: "Total",            value: formatCurrency(stats.totalExpenses),            Icon: DollarSign,   color: "text-blue-500"  },
          { label: "Average",          value: formatCurrency(stats.averageExpense),            Icon: TrendingUp,   color: "text-green-500" },
          { label: "Transactions",     value: String(stats.expenseCount),                     Icon: Receipt,      color: "text-purple-500"},
          { label: "Maint. Pending",   value: String(stats.pendingMaintenanceCount),           Icon: Wrench,       color: "text-amber-500" },
          { label: "Maint. Approved",  value: formatCurrency(stats.approvedMaintenanceTotal), Icon: CheckCircle,  color: "text-green-500" },
        ].map(({ label, value, Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-2 sm:p-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground truncate">{label}</p>
                  <p className="text-sm sm:text-base font-bold truncate">{value}</p>
                </div>
                <Icon className={`h-5 w-5 shrink-0 ml-2 ${color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <TabsList className="grid grid-cols-2 h-auto flex-1">
            <TabsTrigger value="expenses" className="text-xs sm:text-sm py-2">
              <Receipt className="h-3 w-3 mr-1 sm:mr-2" />
              Expenses
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="pending" className="text-xs sm:text-sm py-2 relative">
                <Clock className="h-3 w-3 mr-1 sm:mr-2" />
                Pending
                {stats.pendingMaintenanceCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-red-500">
                    {stats.pendingMaintenanceCount}
                  </Badge>
                )}
              </TabsTrigger>
            )}
          </TabsList>
          {activeTab === "expenses" && (
            <Button size="sm" onClick={() => { resetForm(); setSelectedSite(null); setAddOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Add Expense</span>
              <span className="sm:hidden">Add</span>
            </Button>
          )}
        </div>

        {/* ── Expenses tab ── */}
        <TabsContent value="expenses" className="space-y-3">
          {/* Search */}
          <Card>
            <CardContent className="p-2 sm:p-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search sites…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 text-sm h-9"
                  />
                </div>
                <Button variant="outline" size="sm" className="h-9 px-3" onClick={loadData}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Site cards */}
          {filteredSites.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Building className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-semibold text-sm">No Sites Found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {searchQuery ? "Try adjusting your search" : "No sites available"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredSites.map(site => {
              const siteExp   = getSiteExpenses(site._id);
              const siteTotal = siteExp.reduce((s, e) => s + e.amount, 0);
              const isExpanded = expandedSections.has(site._id);

              return (
                <Card key={site._id}>
                  <CardContent className="p-3">
                    {/* Site header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Building className="h-4 w-4 text-blue-500 shrink-0" />
                          <h3 className="font-semibold text-sm truncate">{site.name}</h3>
                          <Badge variant={site.status === "active" ? "default" : "secondary"} className="text-xs px-1.5 py-0">
                            {site.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{site.clientName}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <Receipt className="h-3 w-3" />{siteExp.length}
                          </span>
                          <span className="font-medium text-green-600 flex items-center gap-0.5">
                            <DollarSign className="h-3 w-3" />{formatCurrency(siteTotal)}
                          </span>
                        </div>
                      </div>
                      {siteExp.length > 0 && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => toggleSection(site._id)}>
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-3 gap-1.5 mt-2">
                      <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => handleViewMonthly(site)}>
                        <Calendar className="h-3 w-3 mr-1" />Monthly
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => handleViewSiteExp(site)}>
                        <Eye className="h-3 w-3 mr-1" />View
                      </Button>
                      <Button size="sm" className="text-xs h-8" onClick={() => handleAddExpense(site)}>
                        <Plus className="h-3 w-3 mr-1" />Add
                      </Button>
                    </div>

                    {/* Expanded recent expenses */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        <p className="text-xs font-medium">Recent Expenses</p>
                        {siteExp.slice(0, 3).map(exp => (
                          <div key={exp._id} className="border rounded-lg p-2">
                            <div className="flex justify-between items-start gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium truncate">{exp.description}</p>
                                <p className="text-xs text-muted-foreground">{formatDate(exp.date)}</p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <span className="text-xs font-semibold">{formatCurrency(exp.amount)}</span>
                                <span className="text-sm">{getCategoryIcon(exp.category)}</span>
                              </div>
                            </div>
                            <div className="flex justify-end gap-1 mt-1.5">
                              {[
                                { Icon: Eye,   onClick: () => { setSelectedExpense(exp); setViewOpen(true); } },
                                { Icon: Edit,  onClick: () => handleEditExpense(exp) },
                                { Icon: Trash2,onClick: () => handleDelete(exp._id) },
                              ].map(({ Icon, onClick }, i) => (
                                <Button key={i} variant="ghost" size="icon" className="h-7 w-7" onClick={onClick}>
                                  <Icon className="h-3 w-3" />
                                </Button>
                              ))}
                            </div>
                          </div>
                        ))}
                        {siteExp.length > 3 && (
                          <Button variant="link" size="sm" className="w-full text-xs" onClick={() => handleViewSiteExp(site)}>
                            View all {siteExp.length} expenses
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* ── Pending maintenance tab ── */}
        {isAdmin && (
          <TabsContent value="pending">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Pending Maintenance Approvals</CardTitle>
                <CardDescription className="text-xs">Approved requests are added as expenses.</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingMaintenance.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No pending maintenance requests</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingMaintenance.map((item, idx) => {
                      const displaySite   = getSiteNameFromMachine(item.machine.location ?? "");
                      const assocSite     = sites.find(s => s.name === displaySite);
                      const isSiteValid   = displaySite !== "No site assigned" && !!assocSite;

                      return (
                        <div key={`${item.machine.id}-${idx}`} className="border rounded-lg p-3 space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Wrench className="h-4 w-4 text-amber-500 shrink-0" />
                            <h4 className="font-semibold text-sm">{item.machine.name}</h4>
                            {item.machine.model && (
                              <Badge variant="outline" className="text-xs">{item.machine.model}</Badge>
                            )}
                          </div>

                          <div className="space-y-1 text-sm">
                            {[
                              ["Type",         item.record.type],
                              ["Description",  item.record.description],
                              ["Performed By", item.record.performedBy],
                              ["Date",         formatDate(item.record.date)],
                            ].map(([l, v]) => (
                              <p key={l}><span className="text-muted-foreground">{l}:</span> {v}</p>
                            ))}
                            <p className="font-bold text-green-600">Amount: {formatCurrency(item.record.cost)}</p>
                          </div>

                          <div className="flex items-center gap-2 text-sm pt-1 border-t flex-wrap">
                            <Building className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">Site:</span>
                            <span className={isSiteValid ? "text-green-600 font-semibold" : "text-red-500"}>
                              {displaySite}
                            </span>
                            {!isSiteValid && (
                              <p className="text-xs text-amber-600 w-full">⚠️ Machine not assigned to a valid site.</p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700 h-9"
                              disabled={!isSiteValid}
                              onClick={() => {
                                setSelectedPendingItem(item);
                                setApprovalForm({ category: "maintenance", paymentMethod: "bank transfer", vendor: "", notes: "" });
                                setApproveOpen(true);
                              }}
                            >
                              <Check className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1 h-9"
                              onClick={() => handleRejectMaintenance(item)}
                            >
                              <XCircle className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* ── Add / Edit Expense Dialog ── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="w-full max-w-full sm:max-w-2xl h-full sm:h-auto sm:max-h-[90vh] m-0 p-0 rounded-none sm:rounded-lg flex flex-col overflow-hidden">
          <DialogHeader className="p-4 border-b sticky top-0 bg-background z-10">
            <DialogTitle className="text-base pr-8">
              {editMode ? "Edit Expense" : "Add Expense"}
              {selectedSite && <span className="block text-xs font-normal text-muted-foreground mt-0.5">{selectedSite.name}</span>}
            </DialogTitle>
            <DialogDescription className="text-xs">Fill in the expense details below.</DialogDescription>
            <Button variant="ghost" size="icon" className="absolute right-3 top-3 h-7 w-7" onClick={() => setAddOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Site selector (when no site pre-selected) */}
            {!selectedSite && (
              <div className="space-y-1.5">
                <Label className="text-sm">Site *</Label>
                <Select onValueChange={v => setSelectedSite(sites.find(s => s._id === v) ?? null)} required>
                  <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="Select site" /></SelectTrigger>
                  <SelectContent>
                    {sites.map(s => (
                      <SelectItem key={s._id} value={s._id} className="text-sm">{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Type *</Label>
                <Select value={formData.expenseType} onValueChange={v => setFormData(f => ({ ...f, expenseType: v }))} required>
                  <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {EXPENSE_TYPES.map(t => <SelectItem key={t.value} value={t.value} className="text-sm">{t.icon} {t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Category *</Label>
                <Select value={formData.category} onValueChange={v => setFormData(f => ({ ...f, category: v }))} required>
                  <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value} className="text-sm">{c.icon} {c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Description *</Label>
              <Textarea
                value={formData.description}
                onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                placeholder="Enter description"
                required rows={2}
                className="text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "amount", label: "Amount (₹) *", type: "number", placeholder: "0", value: formData.amount, onChange: (v: string) => setFormData(f => ({ ...f, amount: v })), extra: { min: "0", step: "0.01" } },
                { id: "date",   label: "Date *",        type: "date",   placeholder: "",  value: formData.date,   onChange: (v: string) => setFormData(f => ({ ...f, date: v })),   extra: { max: new Date().toISOString().split("T")[0] } },
                { id: "vendor", label: "Vendor *",      type: "text",   placeholder: "Vendor", value: formData.vendor, onChange: (v: string) => setFormData(f => ({ ...f, vendor: v })), extra: {} },
              ].map(({ id, label, type, placeholder, value, onChange, extra }) => (
                <div key={id} className="space-y-1.5">
                  <Label htmlFor={id} className="text-sm">{label}</Label>
                  <Input
                    id={id} type={type} placeholder={placeholder} value={value}
                    onChange={e => onChange(e.target.value)}
                    required className="h-10 text-sm" {...extra}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Payment Method *</Label>
              <Select value={formData.paymentMethod} onValueChange={v => setFormData(f => ({ ...f, paymentMethod: v }))} required>
                <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(m => <SelectItem key={m.value} value={m.value} className="text-sm">{m.icon} {m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Custom fields */}
            <div className="border rounded-lg p-3 space-y-2">
              <Label className="text-sm font-medium">Custom Fields</Label>
              {customFields.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-muted/30 rounded p-2 text-xs">
                  <span className="font-medium truncate flex-1">{f.fieldName}:</span>
                  <span className="truncate flex-1">{f.fieldValue}</span>
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCustomFields(cf => cf.filter((_, j) => j !== i))}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input placeholder="Field name"  value={newFieldName}  onChange={e => setNewFieldName(e.target.value)}  className="h-9 text-sm" />
                <Input placeholder="Field value" value={newFieldValue} onChange={e => setNewFieldValue(e.target.value)} className="h-9 text-sm" />
                <Button
                  type="button" variant="outline" size="sm" className="h-9 shrink-0"
                  disabled={!newFieldName || !newFieldValue}
                  onClick={() => {
                    if (newFieldName && newFieldValue) {
                      setCustomFields(cf => [...cf, { fieldName: newFieldName, fieldValue: newFieldValue }]);
                      setNewFieldName(""); setNewFieldValue("");
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Submit buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2 sticky bottom-0 bg-background border-t pb-1">
              <Button type="button" variant="outline" className="h-10" onClick={() => setAddOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="h-10 flex-1" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{editMode ? "Updating…" : "Adding…"}</> : editMode ? "Update Expense" : "Add Expense"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Approve Maintenance Dialog ── */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent className="w-full max-w-full sm:max-w-md h-full sm:h-auto sm:max-h-[90vh] m-0 p-0 rounded-none sm:rounded-lg flex flex-col overflow-hidden">
          <DialogHeader className="p-4 border-b sticky top-0 bg-background z-10">
            <DialogTitle className="text-base pr-8">Approve Maintenance</DialogTitle>
            <DialogDescription className="text-xs">Creates an expense record for this maintenance.</DialogDescription>
            <Button variant="ghost" size="icon" className="absolute right-3 top-3 h-7 w-7" onClick={() => setApproveOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedPendingItem && (
              <>
                <div className="bg-muted/30 rounded-lg p-3 text-sm space-y-1">
                  {[
                    ["Machine",    selectedPendingItem.machine.name],
                    ["Site",       getSiteNameFromMachine(selectedPendingItem.machine.location ?? "")],
                    ["Type",       selectedPendingItem.record.type],
                    ["Performed",  selectedPendingItem.record.performedBy],
                    ["Amount",     formatCurrency(selectedPendingItem.record.cost)],
                  ].map(([l, v]) => (
                    <p key={l}><span className="text-muted-foreground">{l}:</span> <span className={l === "Amount" ? "font-bold text-green-600" : "font-medium"}>{v}</span></p>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Category *</Label>
                    <Select value={approvalForm.category} onValueChange={v => setApprovalForm(f => ({ ...f, category: v }))}>
                      <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maintenance">🔧 Maintenance</SelectItem>
                        <SelectItem value="equipment">🔨 Equipment</SelectItem>
                        <SelectItem value="other">📌 Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Payment Method *</Label>
                    <Select value={approvalForm.paymentMethod} onValueChange={v => setApprovalForm(f => ({ ...f, paymentMethod: v }))}>
                      <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map(m => <SelectItem key={m.value} value={m.value} className="text-sm">{m.icon} {m.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Vendor *</Label>
                    <Input value={approvalForm.vendor} onChange={e => setApprovalForm(f => ({ ...f, vendor: e.target.value }))} placeholder="Vendor name" className="h-10 text-sm" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Notes</Label>
                    <Textarea value={approvalForm.notes} onChange={e => setApprovalForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes…" rows={2} className="text-sm resize-none" />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 h-10" onClick={() => setApproveOpen(false)}>Cancel</Button>
                  <Button className="flex-1 h-10 bg-green-600 hover:bg-green-700" onClick={handleApproveMaintenance} disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Approving…</> : <><Check className="h-4 w-4 mr-2" />Approve</>}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Site Expenses Dialog ── */}
      <Dialog open={siteExpensesOpen} onOpenChange={setSiteExpensesOpen}>
        <DialogContent className="w-full max-w-full sm:max-w-4xl h-full sm:h-auto sm:max-h-[90vh] m-0 p-0 rounded-none sm:rounded-lg flex flex-col overflow-hidden">
          <DialogHeader className="p-4 border-b sticky top-0 bg-background z-10">
            <DialogTitle className="text-base pr-8">Expenses — {selectedSite?.name}</DialogTitle>
            <Button variant="ghost" size="icon" className="absolute right-3 top-3 h-7 w-7" onClick={() => setSiteExpensesOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-3">
            {selectedSite && (() => {
              const siteExp = getSiteExpenses(selectedSite._id);
              if (siteExp.length === 0) return (
                <div className="text-center py-12">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-semibold text-sm">No Expenses</p>
                  <Button className="mt-4" size="sm" onClick={() => { setSiteExpensesOpen(false); handleAddExpense(selectedSite); }}>
                    <Plus className="h-4 w-4 mr-1" />Add First Expense
                  </Button>
                </div>
              );
              return (
                <>
                  {/* Mobile cards */}
                  <div className="sm:hidden space-y-3">
                    {siteExp.map(exp => (
                      <div key={exp._id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{exp.description}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(exp.date)}</p>
                          </div>
                          <span className="text-base">{getCategoryIcon(exp.category)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><p className="text-muted-foreground">Vendor</p><p className="font-medium">{exp.vendor}</p></div>
                          <div><p className="text-muted-foreground">Amount</p><p className="font-bold text-green-600">{formatCurrency(exp.amount)}</p></div>
                          <div className="col-span-2"><p className="text-muted-foreground">Payment</p><p>{getPaymentIcon(exp.paymentMethod)} {exp.paymentMethod}</p></div>
                        </div>
                        <div className="flex gap-1.5 pt-1 border-t">
                          <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => { setSelectedExpense(exp); setViewOpen(true); }}><Eye className="h-3 w-3 mr-1" />View</Button>
                          <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => { setSiteExpensesOpen(false); handleEditExpense(exp); }}><Edit className="h-3 w-3 mr-1" />Edit</Button>
                          <Button size="sm" variant="destructive" className="flex-1 h-8 text-xs" onClick={() => handleDelete(exp._id)}><Trash2 className="h-3 w-3 mr-1" />Del</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Desktop table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead><TableHead>Description</TableHead>
                          <TableHead>Category</TableHead><TableHead>Vendor</TableHead>
                          <TableHead>Payment</TableHead><TableHead>Amount</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {siteExp.map(exp => (
                          <TableRow key={exp._id}>
                            <TableCell className="whitespace-nowrap text-sm">{formatDate(exp.date)}</TableCell>
                            <TableCell className="max-w-[200px]"><p className="font-medium text-sm truncate">{exp.description}</p><p className="text-xs text-muted-foreground">{exp.expenseType}</p></TableCell>
                            <TableCell><Badge variant="secondary" className="text-xs">{getCategoryIcon(exp.category)} {exp.category.replace("_"," ")}</Badge></TableCell>
                            <TableCell className="text-sm">{exp.vendor}</TableCell>
                            <TableCell className="text-sm">{getPaymentIcon(exp.paymentMethod)} {exp.paymentMethod}</TableCell>
                            <TableCell className="font-medium text-sm">{formatCurrency(exp.amount)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSelectedExpense(exp); setViewOpen(true); }}><Eye className="h-3.5 w-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSiteExpensesOpen(false); handleEditExpense(exp); }}><Edit className="h-3.5 w-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(exp._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Monthly Summary Dialog ── */}
      <Dialog open={monthlyOpen} onOpenChange={setMonthlyOpen}>
        <DialogContent className="w-full max-w-full sm:max-w-3xl h-full sm:h-auto sm:max-h-[90vh] m-0 p-0 rounded-none sm:rounded-lg flex flex-col overflow-hidden">
          <DialogHeader className="p-4 border-b sticky top-0 bg-background z-10">
            <DialogTitle className="text-base pr-8">Monthly Summary — {selectedSite?.name}</DialogTitle>
            <DialogDescription className="text-xs">Tap a month to view details.</DialogDescription>
            <Button variant="ghost" size="icon" className="absolute right-3 top-3 h-7 w-7" onClick={() => setMonthlyOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {selectedSite && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{selectedYear}</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8" onClick={() => setSelectedYear(y => y - 1)}>
                      <ChevronLeft className="h-4 w-4 mr-1" />Prev
                    </Button>
                    <Button variant="outline" size="sm" className="h-8" onClick={() => setSelectedYear(y => y + 1)}>
                      Next<ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
                {monthlyExpenses.filter(m => m.year === selectedYear).length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No expenses for {selectedYear}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Month</TableHead><TableHead>Count</TableHead>
                          <TableHead>Categories</TableHead><TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {monthlyExpenses.filter(m => m.year === selectedYear).sort((a,b) => a.month - b.month).map(m => (
                          <TableRow
                            key={`${m.year}-${m.month}`}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => { handleViewMonthDetails(selectedSite, m.month, m.year); setMonthlyOpen(false); }}
                          >
                            <TableCell className="font-medium text-sm">{MONTHS[m.month - 1]}</TableCell>
                            <TableCell><Badge variant="secondary" className="text-xs">{m.count}</Badge></TableCell>
                            <TableCell>
                              <div className="flex gap-1 flex-wrap">
                                {m.categories.slice(0,3).map((c,i) => <span key={i} className="text-sm">{getCategoryIcon(c)}</span>)}
                                {m.categories.length > 3 && <span className="text-xs text-muted-foreground">+{m.categories.length - 3}</span>}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium text-green-600 text-sm">{formatCurrency(m.totalAmount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Month Details Dialog ── */}
      <Dialog open={monthDetailOpen} onOpenChange={setMonthDetailOpen}>
        <DialogContent className="w-full max-w-full sm:max-w-4xl h-full sm:h-auto sm:max-h-[90vh] m-0 p-0 rounded-none sm:rounded-lg flex flex-col overflow-hidden">
          <DialogHeader className="p-4 border-b sticky top-0 bg-background z-10">
            <DialogTitle className="text-base pr-8">
              {selectedMonth && `${MONTHS[selectedMonth.month - 1]} ${selectedMonth.year}`}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {selectedMonth?.count} expense(s) · {selectedMonth && formatCurrency(selectedMonth.totalAmount)}
            </DialogDescription>
            <Button variant="ghost" size="icon" className="absolute right-3 top-3 h-7 w-7" onClick={() => setMonthDetailOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-3">
            {selectedMonth?.expenses?.length ? (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead><TableHead>Description</TableHead>
                        <TableHead>Category</TableHead><TableHead>Vendor</TableHead>
                        <TableHead>Amount</TableHead><TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedMonth.expenses.map(exp => (
                        <TableRow key={exp._id}>
                          <TableCell className="text-sm whitespace-nowrap">{formatDate(exp.date)}</TableCell>
                          <TableCell className="max-w-[200px]"><p className="text-sm font-medium truncate">{exp.description}</p></TableCell>
                          <TableCell><Badge variant="secondary" className="text-xs">{getCategoryIcon(exp.category)} {exp.category.replace("_"," ")}</Badge></TableCell>
                          <TableCell className="text-sm">{exp.vendor}</TableCell>
                          <TableCell className="font-medium text-sm">{formatCurrency(exp.amount)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setMonthDetailOpen(false); setSelectedExpense(exp); setViewOpen(true); }}><Eye className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setMonthDetailOpen(false); handleEditExpense(exp); }}><Edit className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(exp._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end items-center gap-3 pt-3 border-t mt-3">
                  <span className="text-sm text-muted-foreground">Total:</span>
                  <span className="text-xl font-bold text-green-600">{formatCurrency(selectedMonth.totalAmount)}</span>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Receipt className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No expenses for this period</p>
                {selectedSite && (
                  <Button className="mt-4" size="sm" onClick={() => { setMonthDetailOpen(false); handleAddExpense(selectedSite); }}>
                    <Plus className="h-4 w-4 mr-1" />Add Expense
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── View Expense Dialog ── */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="w-full max-w-full sm:max-w-lg h-full sm:h-auto sm:max-h-[90vh] m-0 p-0 rounded-none sm:rounded-lg flex flex-col overflow-hidden">
          <DialogHeader className="p-4 border-b sticky top-0 bg-background z-10">
            <DialogTitle className="text-base pr-8">Expense Details</DialogTitle>
            <Button variant="ghost" size="icon" className="absolute right-3 top-3 h-7 w-7" onClick={() => setViewOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedExpense && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-muted-foreground">Date</p><p className="font-medium text-sm">{formatDate(selectedExpense.date)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Amount</p><p className="font-bold text-lg text-green-600">{formatCurrency(selectedExpense.amount)}</p></div>
                </div>
                <div><p className="text-xs text-muted-foreground">Description</p><p className="font-medium text-sm">{selectedExpense.description}</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Site</p>
                    <p className="font-medium text-sm">
                      {typeof selectedExpense.siteId === "object"
                        ? selectedExpense.siteId.name
                        : sites.find(s => s._id === selectedExpense.siteId)?.name ?? "Unknown"}
                    </p>
                  </div>
                  <div><p className="text-xs text-muted-foreground">Vendor</p><p className="font-medium text-sm">{selectedExpense.vendor}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-muted-foreground mb-1">Type</p><Badge variant="secondary" className="text-xs">{selectedExpense.expenseType}</Badge></div>
                  <div><p className="text-xs text-muted-foreground mb-1">Category</p><Badge variant="outline" className="text-xs">{getCategoryIcon(selectedExpense.category)} {selectedExpense.category.replace("_"," ")}</Badge></div>
                </div>
                <div><p className="text-xs text-muted-foreground mb-1">Payment Method</p><Badge variant="outline" className="text-xs">{getPaymentIcon(selectedExpense.paymentMethod)} {selectedExpense.paymentMethod}</Badge></div>
                {selectedExpense.customFields && selectedExpense.customFields.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Custom Fields</p>
                    <div className="space-y-1.5">
                      {selectedExpense.customFields.map((f, i) => (
                        <div key={i} className="p-2 bg-muted/30 rounded text-xs">
                          <span className="font-medium">{f.fieldName}:</span> {f.fieldValue}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground border-t pt-3">
                  Created: {new Date(selectedExpense.createdAt).toLocaleString()}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 h-9" onClick={() => { setViewOpen(false); handleEditExpense(selectedExpense); }}>
                    <Edit className="h-4 w-4 mr-1" />Edit
                  </Button>
                  <Button variant="destructive" className="flex-1 h-9" onClick={() => { setViewOpen(false); handleDelete(selectedExpense._id); }}>
                    <Trash2 className="h-4 w-4 mr-1" />Delete
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpensesTab;