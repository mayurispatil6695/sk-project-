import React, { useState, useEffect } from 'react';
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { DashboardSidebar } from "@/components/shared/DashboardSidebar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Upload,
  Plus,
  Search,
  Package,
  UserCheck,
  AlertTriangle,
  Eye,
  Trash2,
  Download,
  Edit,
  History,
  Building,
  Shield,
  Wrench,
  Printer,
  Palette,
  ShoppingBag,
  Coffee,
  BarChart3,
  Tag,
  MapPin,
  RefreshCw,
  Cpu,
  Settings,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Server,
  Database,
  Filter,
  MoreVertical,
  ChevronRight,
  FileText,
  UploadCloud,
  DownloadCloud,
  Sun,
  Moon,
  Bell,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Users,
  MessageSquare,
  Target,
  ChevronDown,
  ChevronUp,
  Car,
  Droplets,
  ShoppingCart,
  Hash,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { inventoryService, type FrontendInventoryItem } from '@/services/inventoryService';
import { machineService, type FrontendMachine, type MachineStats, type MaintenanceRecordDTO } from '@/services/machineService';
import { motion, AnimatePresence } from "framer-motion";

// Recharts for charts
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Types
interface Site {
  id: string;
  name: string;
}

interface Department {
  value: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface InventoryStats {
  totalItems: number;
  lowStockItems: number;
  totalValue: number;
  itemsValueChange: number;
}

type InventoryItem = FrontendInventoryItem;
type Machine = FrontendMachine;

// Mobile Stat Card Component - Compact for single line
const MobileStatCard = ({ title, value, icon: Icon, color = "primary", loading }: any) => {
  const colorClasses: Record<string, string> = {
    primary: "text-blue-600 bg-blue-100",
    warning: "text-amber-600 bg-amber-100",
    success: "text-green-600 bg-green-100",
    purple: "text-purple-600 bg-purple-100"
  };

  return (
    <Card className="border-0 shadow-sm rounded-lg">
      <CardContent className="p-1.5 sm:p-2">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-[8px] sm:text-[10px] text-muted-foreground truncate">{title}</p>
            <p className="text-xs sm:text-sm font-bold mt-0.5 truncate">
              {loading ? <Loader2 className="h-2.5 w-2.5 animate-spin inline" /> : value}
            </p>
          </div>
          <div className={`p-1 rounded-lg flex-shrink-0 ml-1 ${colorClasses[color]}`}>
            <Icon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Mobile Department Card Component - No percentage
const MobileDepartmentCard = ({ dept, onClick }: any) => {
  const IconComponent = dept.icon;
  return (
    <Card
      className={`text-center cursor-pointer transform transition-all duration-200 hover:shadow-md border-2 ${dept.color}`}
      onClick={() => onClick(dept.department)}
    >
      <CardContent className="p-3">
        <div className="p-1.5 bg-white/50 rounded-full w-8 h-8 mx-auto mb-2 flex items-center justify-center">
          <IconComponent className="h-3.5 w-3.5 text-gray-700" />
        </div>
        <p className="text-xs font-medium text-gray-800 mb-1 truncate">{dept.department}</p>
        <div>
          <p className="text-base font-bold text-gray-900">{dept.present}</p>
          <p className="text-[9px] text-muted-foreground">of {dept.total}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Mobile Small Pie Chart Component - No percentage badge
const MobileSmallPieChart = ({ dayData, onClick }: any) => {
  const CHART_COLORS = {
    present: '#10b981',
    absent: '#ef4444',
    weeklyOff: '#94a3b8',
    leave: '#f97316'
  };
  
  const pieData = [
    { name: 'Present', value: dayData.present, color: CHART_COLORS.present },
    { name: 'Weekly Off', value: dayData.weeklyOff, color: CHART_COLORS.weeklyOff },
    { name: 'Leave', value: dayData.leave, color: CHART_COLORS.leave },
    { name: 'Absent', value: dayData.absent, color: CHART_COLORS.absent }
  ].filter(item => item.value > 0);

  return (
    <Card className="cursor-pointer transform transition-all duration-200 hover:shadow-md border" onClick={() => onClick(dayData)}>
      <CardContent className="p-2">
        <div className="text-center mb-1">
          <p className="text-[10px] font-medium text-gray-700">{dayData.day}</p>
          <p className="text-[9px] text-muted-foreground">{dayData.date.slice(5)}</p>
        </div>
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={28} dataKey="value">
                {pieData.map((entry, idx) => <Cell key={`cell-${idx}`} fill={entry.color} />)}
              </Pie>
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-1 text-[8px] mt-1">
          <span className="text-green-600">{dayData.present}</span>
          <span className="text-gray-400">|</span>
          <span className="text-orange-500">{dayData.leave}</span>
          <span className="text-gray-400">|</span>
          <span className="text-red-500">{dayData.absent}</span>
        </div>
      </CardContent>
    </Card>
  );
};
const InventoryPage = () => {
  // State for mobile sidebar
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // State
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSite, setSelectedSite] = useState("all");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [changeHistoryDialogOpen, setChangeHistoryDialogOpen] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState({
    items: true,
    machines: true,
    stats: true
  });
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<InventoryStats>({
    totalItems: 0,
    lowStockItems: 0,
    totalValue: 0,
    itemsValueChange: 0,
  });
  
  // Machine states
  const [machineDialogOpen, setMachineDialogOpen] = useState(false);
  const [editMachine, setEditMachine] = useState<Machine | null>(null);
  const [viewMachine, setViewMachine] = useState<Machine | null>(null);
  const [machineSearchQuery, setMachineSearchQuery] = useState("");
  const [machineStats, setMachineStats] = useState<MachineStats | null>(null);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [selectedMachineForMaintenance, setSelectedMachineForMaintenance] = useState<string | null>(null);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  
  // Track active tab
  const [activeTab, setActiveTab] = useState("inventory");
  
  // New state for tracking data source
  const [usingLocalMachineStats, setUsingLocalMachineStats] = useState(false);
  const [backendConnected, setBackendConnected] = useState(true);
  
  // New item form state
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: "",
    sku: "",
    department: "cleaning",
    category: "",
    site: "1",
    assignedManager: "",
    quantity: 0,
    price: 0,
    costPrice: 0,
    supplier: "",
    reorderLevel: 10,
    description: "",
  });

  // New machine form state
  const [newMachine, setNewMachine] = useState<Partial<Machine>>({
    name: "",
    cost: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    quantity: 1,
    description: "",
    status: 'operational',
    location: "",
    manufacturer: "",
    model: "",
    serialNumber: "",
    department: "",
    assignedTo: "",
  });

  // Maintenance form state
  const [maintenanceRecord, setMaintenanceRecord] = useState<MaintenanceRecordDTO>({
    type: "Routine",
    description: "",
    cost: 0,
    performedBy: "",
  });

  const handleMenuClick = () => setMobileSidebarOpen(!mobileSidebarOpen);
  const handleMobileClose = () => setMobileSidebarOpen(false);

  const departments: Department[] = [
    { value: "cleaning", label: "Cleaning", icon: Shield },
    { value: "maintenance", label: "Maintenance", icon: Wrench },
    { value: "office", label: "Office Supplies", icon: Printer },
    { value: "paint", label: "Paint", icon: Palette },
    { value: "tools", label: "Tools", icon: ShoppingBag },
    { value: "canteen", label: "Canteen", icon: Coffee },
  ];

  const sites: Site[] = [
    { id: "1", name: "Main Site" },
    { id: "2", name: "Branch Office" },
    { id: "3", name: "Warehouse A" },
    { id: "4", name: "Construction Site B" },
  ];

  const managers = ["John Doe", "Jane Smith", "Robert Johnson", "Sarah Wilson", "Michael Brown"];
  
  const categories = {
    cleaning: ["Tools", "Chemicals", "Equipment", "Supplies"],
    maintenance: ["Tools", "Safety", "Equipment", "Parts"],
    office: ["Furniture", "Stationery", "Electronics", "Supplies"],
    paint: ["Paints", "Brushes", "Rollers", "Accessories"],
    tools: ["Power Tools", "Hand Tools", "Safety Gear", "Consumables"],
    canteen: ["Food Items", "Beverages", "Utensils", "Cleaning"],
  };

  const machineStatusOptions = [
    { value: 'operational', label: 'Operational', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { value: 'maintenance', label: 'Under Maintenance', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
    { value: 'out-of-service', label: 'Out of Service', color: 'bg-red-100 text-red-800', icon: XCircle },
  ];

  const maintenanceTypes = [
    "Routine", "Preventive", "Corrective", "Emergency", "Scheduled", "Overhaul"
  ];

  const calculateStats = (itemsList: InventoryItem[]): InventoryStats => ({
    totalItems: itemsList.length,
    lowStockItems: itemsList.filter(item => item.quantity <= item.reorderLevel).length,
    totalValue: itemsList.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0),
    itemsValueChange: 0
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const calculateMachineAge = (purchaseDate: string) => {
    const purchase = new Date(purchaseDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - purchase.getTime());
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    return Math.floor(diffYears);
  };

  const calculateLocalMachineStats = () => {
    const totalMachines = machines.length;
    const totalMachineValue = machines.reduce((sum, m) => sum + (m.cost * m.quantity), 0);
    return {
      totalMachines, totalMachineValue,
      operationalMachines: machines.filter(m => m.status === 'operational').length,
      maintenanceMachines: machines.filter(m => m.status === 'maintenance').length,
      outOfServiceMachines: machines.filter(m => m.status === 'out-of-service').length,
      averageMachineCost: totalMachines > 0 ? totalMachineValue / totalMachines : 0,
      machinesByDepartment: {}, machinesByLocation: {}, upcomingMaintenanceCount: 0
    };
  };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading({ items: true, machines: true, stats: true });
      const [itemsData, machinesData] = await Promise.all([
        inventoryService.getItems(), machineService.getMachines()
      ]);
      setItems(itemsData || []);
      setMachines(machinesData || []);
      
      try {
        const statsData = await machineService.getMachineStats();
        setMachineStats(statsData);
      } catch {
        setMachineStats(calculateLocalMachineStats());
      }
      setStats(calculateStats(itemsData || []));
    } catch (error) {
      toast.warning("Backend connection issue. Using local data.");
    } finally {
      setLoading({ items: false, machines: false, stats: false });
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success("Data refreshed!");
  };

  const getDepartmentIcon = (department: string) => {
    return departments.find(d => d.value === department)?.icon || Package;
  };

  const getCategoriesForDepartment = (dept: string) => categories[dept as keyof typeof categories] || [];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDepartment === "all" || item.department === selectedDepartment;
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSite = selectedSite === "all" || item.site === selectedSite;
    return matchesSearch && matchesDept && matchesCategory && matchesSite;
  });

  const filteredMachines = machines.filter(machine =>
    machine.name.toLowerCase().includes(machineSearchQuery.toLowerCase()) ||
    machine.manufacturer?.toLowerCase().includes(machineSearchQuery.toLowerCase()) ||
    machine.model?.toLowerCase().includes(machineSearchQuery.toLowerCase())
  );

  const handleDeleteItem = async (itemId: string) => {
    await inventoryService.deleteItem(itemId);
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    setStats(calculateStats(updatedItems));
    toast.success("Item deleted!");
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.sku) return toast.error("Please fill required fields");
    
    const itemData = {
      sku: newItem.sku.toUpperCase(), name: newItem.name, department: newItem.department || "cleaning",
      category: newItem.category || "Tools", site: newItem.site || "1", assignedManager: newItem.assignedManager || "John Doe",
      quantity: newItem.quantity || 0, price: newItem.price || 0, costPrice: newItem.costPrice || 0,
      supplier: newItem.supplier || "", reorderLevel: newItem.reorderLevel || 10, description: newItem.description,
      changeHistory: [{ date: new Date().toISOString().split('T')[0], change: "Created", user: "Supervisor", quantity: newItem.quantity || 0 }]
    };
    
    const createdItem = await inventoryService.createItem(itemData);
    const updatedItems = [...items, createdItem];
    setItems(updatedItems);
    setStats(calculateStats(updatedItems));
    setItemDialogOpen(false);
    resetNewItemForm();
    toast.success("Item added!");
  };

  const handleEditItem = async () => {
    if (!editItem) return;
    
    const updateData = {
      name: editItem.name, sku: editItem.sku, department: editItem.department,
      category: editItem.category, site: editItem.site, assignedManager: editItem.assignedManager,
      quantity: editItem.quantity, price: editItem.price, costPrice: editItem.costPrice,
      supplier: editItem.supplier, reorderLevel: editItem.reorderLevel, description: editItem.description,
    };
    
    const updatedItem = await inventoryService.updateItem(editItem.id, updateData);
    const updatedItems = items.map(item => item.id === updatedItem.id ? updatedItem : item);
    setItems(updatedItems);
    setStats(calculateStats(updatedItems));
    setEditItem(null);
    setItemDialogOpen(false);
    toast.success("Item updated!");
  };

  const resetNewItemForm = () => {
    setNewItem({ name: "", sku: "", department: "cleaning", category: "", site: "1", assignedManager: "", quantity: 0, price: 0, costPrice: 0, supplier: "", reorderLevel: 10, description: "" });
  };

  const openEditDialog = (item: InventoryItem) => {
    setEditItem(item);
    setItemDialogOpen(true);
  };

  const handleAddMachine = async () => {
    if (!newMachine.name || !newMachine.cost) return toast.error("Please fill required fields");
    
    const machineData = {
      name: newMachine.name, cost: newMachine.cost, purchaseDate: newMachine.purchaseDate,
      quantity: newMachine.quantity || 1, description: newMachine.description, status: newMachine.status || 'operational',
      location: newMachine.location, manufacturer: newMachine.manufacturer, model: newMachine.model,
      serialNumber: newMachine.serialNumber, department: newMachine.department, assignedTo: newMachine.assignedTo,
    };
    
    if (editMachine) {
      const updatedMachine = await machineService.updateMachine(editMachine.id, machineData);
      setMachines(machines.map(m => m.id === editMachine.id ? updatedMachine : m));
      toast.success("Machine updated!");
    } else {
      const createdMachine = await machineService.createMachine(machineData);
      setMachines([...machines, createdMachine]);
      toast.success("Machine added!");
    }
    
    setMachineDialogOpen(false);
    resetNewMachineForm();
    setEditMachine(null);
  };

  const handleEditMachine = (machine: Machine) => {
    setEditMachine(machine);
    setNewMachine({
      name: machine.name, cost: machine.cost, purchaseDate: machine.purchaseDate,
      quantity: machine.quantity, description: machine.description, status: machine.status,
      location: machine.location, manufacturer: machine.manufacturer, model: machine.model,
      serialNumber: machine.serialNumber, department: machine.department, assignedTo: machine.assignedTo,
    });
    setMachineDialogOpen(true);
  };

  const handleViewMachine = async (machineId: string) => {
    try {
      const machine = await machineService.getMachineById(machineId);
      setViewMachine(machine);
    } catch (error) {
      toast.error("Failed to fetch machine details");
    }
  };

  const handleDeleteMachine = async (machineId: string) => {
    await machineService.deleteMachine(machineId);
    setMachines(machines.filter(m => m.id !== machineId));
    toast.success("Machine deleted!");
  };

  const resetNewMachineForm = () => {
    setNewMachine({ name: "", cost: 0, purchaseDate: new Date().toISOString().split('T')[0], quantity: 1, description: "", status: 'operational', location: "", manufacturer: "", model: "", serialNumber: "", department: "", assignedTo: "" });
  };

  const handleAddMaintenance = async () => {
    if (!selectedMachineForMaintenance || !maintenanceRecord.type || !maintenanceRecord.description || !maintenanceRecord.performedBy) {
      toast.error("Please fill in all maintenance record fields");
      return;
    }

    try {
      setMaintenanceLoading(true);
      const updatedMachine = await machineService.addMaintenanceRecord(selectedMachineForMaintenance, maintenanceRecord);
      setMachines(machines.map(m => m.id === selectedMachineForMaintenance ? updatedMachine : m));
      setMaintenanceRecord({ type: "Routine", description: "", cost: 0, performedBy: "" });
      setSelectedMachineForMaintenance(null);
      setMaintenanceDialogOpen(false);
      toast.success("Maintenance record added successfully!");
    } catch (error) {
      toast.error("Failed to add maintenance record");
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const handleExport = () => {
    if (items.length === 0) return toast.error("No items to export");
    const csvContent = [["SKU", "Name", "Department", "Category", "Quantity", "Price", "Supplier", "Reorder Level"],
      ...items.map(item => [item.sku, item.name, item.department, item.category, item.quantity, item.price, item.supplier, item.reorderLevel])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported!");
  };

  const handleExportMachines = async () => {
    if (machines.length === 0) return toast.error("No machines to export");
    const csvContent = [["Name", "Cost", "Purchase Date", "Quantity", "Status", "Location", "Manufacturer", "Model", "Serial Number", "Department", "Assigned To"],
      ...machines.map(machine => [machine.name, machine.cost, new Date(machine.purchaseDate).toISOString().split('T')[0], machine.quantity, machine.status, machine.location || '', machine.manufacturer || '', machine.model || '', machine.serialNumber || '', machine.department || '', machine.assignedTo || ''])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `machines-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Machines exported!");
  };

  const machineStatsDisplay = machineStats || calculateLocalMachineStats();

  // Department View Data - With imported icons Car, Droplets, ShoppingCart
  const departmentViewData = [
    { department: 'Housekeeping', present: 56, total: 65, icon: Shield, color: 'border-blue-200 bg-blue-50' },
    { department: 'Security', present: 26, total: 28, icon: Shield, color: 'border-green-200 bg-green-50' },
    { department: 'Parking', present: 5, total: 5, icon: Car, color: 'border-purple-200 bg-purple-50' },
    { department: 'Waste Management', present: 8, total: 10, icon: Trash2, color: 'border-gray-200 bg-gray-50' },
    { department: 'Consumables', present: 3, total: 3, icon: ShoppingCart, color: 'border-orange-200 bg-orange-50' },
    { department: 'Other', present: 5, total: 7, icon: Droplets, color: 'border-cyan-200 bg-cyan-50' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title={<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Inventory Management</span>}
        subtitle="Manage inventory, machinery, and equipment across sites"
        onMenuClick={handleMenuClick}
      />

      {mobileSidebarOpen && (
        <DashboardSidebar mobileOpen={mobileSidebarOpen} onMobileClose={handleMobileClose} />
      )}

      <div className="p-4 md:p-6 space-y-6">
        {/* Stats Cards - All 4 in one row */}
        <div className="grid grid-cols-4 gap-2">
          <MobileStatCard title="Total Items" value={stats.totalItems} icon={Package} color="primary" loading={loading.stats} />
          <MobileStatCard title="Low Stock" value={stats.lowStockItems} icon={AlertTriangle} color="warning" loading={loading.stats} />
          <MobileStatCard title="Total Value" value={formatCurrency(stats.totalValue)} icon={DollarSign} color="success" loading={loading.stats} />
          <MobileStatCard title="Machines" value={machineStatsDisplay.totalMachines} icon={Cpu} color="purple" loading={loading.stats} />
        </div>

        {/* Tabs Section */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 overflow-x-auto pb-px">
            <Tabs defaultValue="inventory" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="inline-flex h-10 md:h-12 items-center justify-start rounded-lg bg-transparent p-0 min-w-max">
                <TabsTrigger value="inventory" className="relative px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium text-gray-600 hover:text-gray-900 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 transition-all whitespace-nowrap">
                  <Package className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                  Inventory ({items.length})
                </TabsTrigger>
                <TabsTrigger value="low-stock" className="relative px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium text-gray-600 hover:text-gray-900 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 transition-all whitespace-nowrap">
                  <AlertTriangle className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                  Low Stock ({stats.lowStockItems})
                </TabsTrigger>
                <TabsTrigger value="machines" className="relative px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium text-gray-600 hover:text-gray-900 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 transition-all whitespace-nowrap">
                  <Cpu className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                  Machines ({machines.length})
                </TabsTrigger>
                <TabsTrigger value="categories" className="relative px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium text-gray-600 hover:text-gray-900 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 transition-all whitespace-nowrap">
                  <Tag className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                  Categories
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* INVENTORY TAB */}
          <AnimatePresence mode="wait">
            {activeTab === "inventory" && (
              <motion.div key="inventory" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                <Card className="border-0 shadow-lg rounded-xl md:rounded-2xl overflow-hidden">
                  <CardHeader className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <CardTitle className="text-base md:text-xl font-bold text-gray-900">Inventory Items</CardTitle>
                        <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Manage all inventory items across departments</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" onClick={() => setImportDialogOpen(true)} className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg md:rounded-xl text-xs md:text-sm px-2 md:px-4 py-1 md:py-2 h-8 md:h-10">
                          <Upload className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                          <span className="hidden xs:inline">Import</span>
                        </Button>
                        <Button variant="outline" onClick={refreshData} disabled={refreshing} className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg md:rounded-xl text-xs md:text-sm px-2 md:px-4 py-1 md:py-2 h-8 md:h-10">
                          <RefreshCw className={`mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4 ${refreshing ? 'animate-spin' : ''}`} />
                          <span className="hidden xs:inline">Refresh</span>
                        </Button>
                        <Button onClick={() => { setEditItem(null); setItemDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700 rounded-lg md:rounded-xl text-xs md:text-sm px-2 md:px-4 py-1 md:py-2 h-8 md:h-10">
                          <Plus className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                          <span className="hidden xs:inline">Add</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {/* Filters */}
                    <div className="px-3 md:px-6 py-3 md:py-4 border-b border-gray-100 bg-gray-50/50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="relative">
                          <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-gray-400" />
                          <Input placeholder="Search items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-7 md:pl-10 h-8 md:h-10 text-xs md:text-sm rounded-lg border-gray-300 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                        </div>
                        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                          <SelectTrigger className="h-8 md:h-10 text-xs md:text-sm rounded-lg border-gray-300 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                            <SelectValue placeholder="All Departments" />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg">
                            <SelectItem value="all">All Departments</SelectItem>
                            {departments.map(dept => {
                              const Icon = dept.icon;
                              return (
                                <SelectItem key={dept.value} value={dept.value} className="rounded-md">
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />
                                    <span className="text-xs md:text-sm">{dept.label}</span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={selectedDepartment === "all"}>
                          <SelectTrigger className="h-8 md:h-10 text-xs md:text-sm rounded-lg border-gray-300 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg">
                            <SelectItem value="all">All Categories</SelectItem>
                            {selectedDepartment !== "all" && getCategoriesForDepartment(selectedDepartment).map(cat => (
                              <SelectItem key={cat} value={cat} className="rounded-md text-xs md:text-sm">{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={selectedSite} onValueChange={setSelectedSite}>
                          <SelectTrigger className="h-8 md:h-10 text-xs md:text-sm rounded-lg border-gray-300 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                            <SelectValue placeholder="All Sites" />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg">
                            <SelectItem value="all">All Sites</SelectItem>
                            {sites.map(site => (
                              <SelectItem key={site.id} value={site.id} className="rounded-md text-xs md:text-sm">{site.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Inventory Table */}
                    {loading.items ? (
                      <div className="flex justify-center items-center py-8 md:py-12">
                        <div className="text-center">
                          <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin mx-auto text-blue-500" />
                          <p className="text-xs md:text-sm text-gray-500 mt-2">Loading inventory items...</p>
                        </div>
                      </div>
                    ) : filteredItems.length === 0 ? (
                      <div className="text-center py-8 md:py-12 px-4">
                        <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 md:mb-4">
                          <Package className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
                        </div>
                        <h3 className="text-sm md:text-lg font-semibold text-gray-900">No items found</h3>
                        <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">Add your first item or import from CSV to get started</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="bg-gray-50">
                            <TableRow className="hover:bg-gray-50">
                              <TableHead className="py-2 md:py-3 px-3 md:px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Item</TableHead>
                              <TableHead className="py-2 md:py-3 px-3 md:px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">SKU</TableHead>
                              <TableHead className="py-2 md:py-3 px-3 md:px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">Department</TableHead>
                              <TableHead className="py-2 md:py-3 px-3 md:px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Quantity</TableHead>
                              <TableHead className="py-2 md:py-3 px-3 md:px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">Value</TableHead>
                              <TableHead className="py-2 md:py-3 px-3 md:px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</TableHead>
                              <TableHead className="py-2 md:py-3 px-3 md:px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredItems.map((item, index) => {
                              const DeptIcon = getDepartmentIcon(item.department);
                              const isLowStock = item.quantity <= item.reorderLevel;
                              return (
                                <TableRow key={item.id} className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                  <TableCell className="py-2 md:py-4 px-3 md:px-6">
                                    <div className="flex items-center">
                                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-100 flex items-center justify-center mr-2 md:mr-3">
                                        <span className="text-blue-600 font-semibold text-xs md:text-sm">{item.name.charAt(0)}</span>
                                      </div>
                                      <div className="min-w-0">
                                        <div className="font-medium text-gray-900 text-xs md:text-sm truncate max-w-[80px] md:max-w-none">{item.name}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-[80px] md:max-w-none">{item.supplier}</div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-2 md:py-4 px-3 md:px-6">
                                    <div className="font-mono text-xs md:text-sm text-blue-600">{item.sku}</div>
                                  </TableCell>
                                  <TableCell className="py-2 md:py-4 px-3 md:px-6 hidden md:table-cell">
                                    <Badge variant="outline" className="flex items-center gap-1 w-fit border-gray-300 bg-gray-50 text-gray-700 text-xs">
                                      <DeptIcon className="h-3 w-3" />
                                      {departments.find(d => d.value === item.department)?.label}
                                    </Badge>
                                    <div className="text-xs text-gray-500 mt-1">{item.category}</div>
                                  </TableCell>
                                  <TableCell className="py-2 md:py-4 px-3 md:px-6">
                                    <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-2">
                                      <span className={`font-medium text-xs md:text-sm ${isLowStock ? 'text-amber-600' : 'text-blue-600'}`}>{item.quantity}</span>
                                      <div className="text-[10px] md:text-xs text-gray-500">Reorder: {item.reorderLevel}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-2 md:py-4 px-3 md:px-6 hidden sm:table-cell">
                                    <div className="font-medium text-blue-600 text-xs md:text-sm">{formatCurrency(item.price)}</div>
                                    <div className="text-[10px] md:text-xs text-gray-500">Cost: {formatCurrency(item.costPrice)}</div>
                                  </TableCell>
                                  <TableCell className="py-2 md:py-4 px-3 md:px-6">
                                    {isLowStock ? (
                                      <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] md:text-xs px-1.5 md:px-2 py-0.5">Low</Badge>
                                    ) : (
                                      <Badge className="bg-green-100 text-green-800 border-green-200 text-[10px] md:text-xs px-1.5 md:px-2 py-0.5">In Stock</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="py-2 md:py-4 px-3 md:px-6 text-right">
                                    <div className="flex items-center justify-end gap-1 md:gap-2">
                                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)} className="w-6 h-6 md:w-8 md:h-8 p-0 rounded-full hover:bg-blue-100 hover:text-blue-600" title="Edit">
                                        <Edit className="h-3 w-3 md:h-4 md:w-4" />
                                      </Button>
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button variant="ghost" size="sm" className="w-6 h-6 md:w-8 md:h-8 p-0 rounded-full hover:bg-blue-100 hover:text-blue-600" title="View Details">
                                            <Eye className="h-3 w-3 md:h-4 md:w-4" />
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-sm md:max-w-2xl bg-white rounded-xl md:rounded-2xl">
                                          <DialogHeader><DialogTitle className="text-base md:text-lg font-semibold text-gray-900">Item Details</DialogTitle></DialogHeader>
                                          <div className="space-y-4 md:space-y-6">
                                            <div className="flex items-center gap-3 md:gap-4">
                                              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-blue-100 flex items-center justify-center">
                                                <span className="text-blue-600 font-bold text-sm md:text-xl">{item.name.charAt(0)}</span>
                                              </div>
                                              <div className="min-w-0">
                                                <h3 className="text-base md:text-xl font-bold text-gray-900 truncate">{item.name}</h3>
                                                <p className="text-xs md:text-sm text-gray-500">{item.sku}</p>
                                              </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                              <div className="space-y-3 md:space-y-4">
                                                <div><Label className="text-[10px] md:text-xs text-gray-500 uppercase font-medium">Department</Label><div className="flex items-center gap-2 text-xs md:text-sm text-gray-900"><DeptIcon className="h-3 w-3 md:h-4 md:w-4 text-gray-400" />{departments.find(d => d.value === item.department)?.label}</div></div>
                                                <div><Label className="text-[10px] md:text-xs text-gray-500 uppercase font-medium">Category</Label><p className="text-xs md:text-sm text-gray-900">{item.category}</p></div>
                                                <div><Label className="text-[10px] md:text-xs text-gray-500 uppercase font-medium">Manager</Label><p className="text-xs md:text-sm text-gray-900">{item.assignedManager}</p></div>
                                              </div>
                                              <div className="space-y-3 md:space-y-4">
                                                <div><Label className="text-[10px] md:text-xs text-gray-500 uppercase font-medium">Quantity</Label><p className="text-base md:text-lg font-bold text-blue-600">{item.quantity}</p></div>
                                                <div><Label className="text-[10px] md:text-xs text-gray-500 uppercase font-medium">Price</Label><p className="text-base md:text-lg font-bold text-green-600">{formatCurrency(item.price)}</p></div>
                                                <div><Label className="text-[10px] md:text-xs text-gray-500 uppercase font-medium">Status</Label><Badge className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs ${isLowStock ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-green-100 text-green-800 border-green-200'}`}>{isLowStock ? 'Low Stock' : 'In Stock'}</Badge></div>
                                              </div>
                                            </div>
                                            {item.description && (<div><Label className="text-[10px] md:text-xs text-gray-500 uppercase font-medium">Description</Label><div className="mt-1 md:mt-2 p-2 md:p-3 bg-gray-50 rounded-lg"><p className="text-xs md:text-sm text-gray-900">{item.description}</p></div></div>)}
                                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between text-[10px] md:text-sm text-gray-500 pt-3 md:pt-4 border-t gap-1 md:gap-0"><span>Supplier: {item.supplier}</span><span>Reorder Level: {item.reorderLevel}</span></div>
                                          </div>
                                        </DialogContent>
                                      </Dialog>
                                      <Button variant="ghost" size="sm" onClick={() => setChangeHistoryDialogOpen(item.id)} className="w-6 h-6 md:w-8 md:h-8 p-0 rounded-full hover:bg-blue-100 hover:text-blue-600" title="History">
                                        <History className="h-3 w-3 md:h-4 md:w-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)} className="w-6 h-6 md:w-8 md:h-8 p-0 rounded-full hover:bg-red-100 hover:text-red-600" title="Delete">
                                        <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
          {/* LOW STOCK TAB */}
          <AnimatePresence mode="wait">
            {activeTab === "low-stock" && (
              <motion.div key="low-stock" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                <Card className="border-0 shadow-lg rounded-xl md:rounded-2xl overflow-hidden">
                  <CardHeader className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div><CardTitle className="text-base md:text-xl font-bold text-gray-900">Low Stock Items</CardTitle><p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Items that need immediate reordering</p></div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleExport} disabled={stats.lowStockItems === 0} className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg md:rounded-xl text-xs md:text-sm px-2 md:px-4 py-1 md:py-2 h-8 md:h-10">
                          <Download className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                          <span className="hidden xs:inline">Export</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {stats.lowStockItems === 0 ? (
                      <div className="text-center py-8 md:py-12 px-4">
                        <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mb-3 md:mb-4">
                          <AlertTriangle className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
                        </div>
                        <h3 className="text-sm md:text-lg font-semibold text-gray-900">All items are in stock!</h3>
                        <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">No items need reordering at this time.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="bg-amber-50">
                            <TableRow className="hover:bg-amber-50">
                              <TableHead className="py-2 md:py-3 px-3 md:px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Item</TableHead>
                              <TableHead className="py-2 md:py-3 px-3 md:px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Current Stock</TableHead>
                              <TableHead className="py-2 md:py-3 px-3 md:px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">Reorder Level</TableHead>
                              <TableHead className="py-2 md:py-3 px-3 md:px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">Deficit</TableHead>
                              <TableHead className="py-2 md:py-3 px-3 md:px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Urgency</TableHead>
                              <TableHead className="py-2 md:py-3 px-3 md:px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {items.filter(item => item.quantity <= item.reorderLevel).map((item, index) => {
                              const deficit = item.reorderLevel - item.quantity;
                              const urgency = deficit >= 10 ? 'High' : deficit >= 5 ? 'Medium' : 'Low';
                              return (
                                <TableRow key={item.id} className={`hover:bg-amber-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-amber-50/30'}`}>
                                  <TableCell className="py-2 md:py-4 px-3 md:px-6">
                                    <div className="flex items-center">
                                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-amber-100 flex items-center justify-center mr-2 md:mr-3">
                                        <span className="text-amber-600 font-semibold text-xs md:text-sm">{item.name.charAt(0)}</span>
                                      </div>
                                      <div className="min-w-0">
                                        <div className="font-medium text-gray-900 text-xs md:text-sm truncate max-w-[80px] md:max-w-none">{item.name}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-[80px] md:max-w-none">{item.sku}</div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-2 md:py-4 px-3 md:px-6"><div className="text-base md:text-lg font-bold text-amber-600">{item.quantity}</div></TableCell>
                                  <TableCell className="py-2 md:py-4 px-3 md:px-6 hidden md:table-cell"><div className="text-xs md:text-sm text-gray-700">{item.reorderLevel}</div></TableCell>
                                  <TableCell className="py-2 md:py-4 px-3 md:px-6 hidden sm:table-cell"><div className="font-bold text-red-600 text-xs md:text-sm">-{deficit}</div></TableCell>
                                  <TableCell className="py-2 md:py-4 px-3 md:px-6">
                                    <Badge className={`text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 ${urgency === 'High' ? 'bg-red-100 text-red-800 border-red-200' : urgency === 'Medium' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-blue-100 text-blue-800 border-blue-200'} border-0`}>{urgency}</Badge>
                                  </TableCell>
                                  <TableCell className="py-2 md:py-4 px-3 md:px-6 text-right">
                                    <div className="flex items-center justify-end gap-1 md:gap-2">
                                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)} className="w-6 h-6 md:w-8 md:h-8 p-0 rounded-full hover:bg-blue-100 hover:text-blue-600" title="Edit"><Edit className="h-3 w-3 md:h-4 md:w-4" /></Button>
                                      <Button variant="ghost" size="sm" onClick={() => setChangeHistoryDialogOpen(item.id)} className="w-6 h-6 md:w-8 md:h-8 p-0 rounded-full hover:bg-blue-100 hover:text-blue-600" title="History"><History className="h-3 w-3 md:h-4 md:w-4" /></Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* MACHINES TAB */}
          <AnimatePresence mode="wait">
            {activeTab === "machines" && (
              <motion.div key="machines" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                <Card className="border-0 shadow-lg rounded-xl md:rounded-2xl overflow-hidden">
                  <CardHeader className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <CardTitle className="text-base md:text-xl font-bold text-gray-900">Machinery & Equipment</CardTitle>
                        <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Manage all machinery and equipment across sites</p>
                        {usingLocalMachineStats && (<div className="mt-1 md:mt-2"><Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-[10px] md:text-xs"><Database className="h-2 w-2 md:h-3 md:w-3 mr-0.5 md:mr-1" />Using locally calculated statistics</Badge></div>)}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" onClick={handleExportMachines} disabled={machines.length === 0} className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg md:rounded-xl text-xs md:text-sm px-2 md:px-4 py-1 md:py-2 h-8 md:h-10"><Download className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" /><span className="hidden xs:inline">Export</span></Button>
                        <Button variant="outline" onClick={() => setMaintenanceDialogOpen(true)} disabled={machines.length === 0} className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg md:rounded-xl text-xs md:text-sm px-2 md:px-4 py-1 md:py-2 h-8 md:h-10"><Wrench className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" /><span className="hidden xs:inline">Maintenance</span></Button>
                        <Button onClick={() => { setEditMachine(null); resetNewMachineForm(); setMachineDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700 rounded-lg md:rounded-xl text-xs md:text-sm px-2 md:px-4 py-1 md:py-2 h-8 md:h-10"><Plus className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" /><span className="hidden xs:inline">Add</span></Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="px-3 md:px-6 py-3 md:py-4 border-b border-gray-100 bg-gray-50/50">
                      <div className="relative">
                        <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-gray-400" />
                        <Input placeholder="Search machines..." value={machineSearchQuery} onChange={(e) => setMachineSearchQuery(e.target.value)} className="pl-7 md:pl-10 h-8 md:h-10 text-xs md:text-sm rounded-lg border-gray-300 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      </div>
                    </div>
                    {loading.machines ? (
                      <div className="flex justify-center items-center py-8 md:py-12"><div className="text-center"><Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin mx-auto text-blue-500" /><p className="text-xs md:text-sm text-gray-500 mt-2">Loading machines...</p></div></div>
                    ) : filteredMachines.length === 0 ? (
                      <div className="text-center py-8 md:py-12 px-4"><div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 md:mb-4"><Cpu className="h-6 w-6 md:h-8 md:w-8 text-gray-400" /></div><h3 className="text-sm md:text-lg font-semibold text-gray-900">No machines found</h3><p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">{machines.length === 0 ? "No machines in database. Add your first machine!" : "Try adjusting your search"}</p></div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="bg-gray-50">
                            <TableRow className="hover:bg-gray-50">
                              <TableHead className="py-2 md:py-3 px-3 md:px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Machine</TableHead>
                              <TableHead className="py-2 md:py-3 px-3 md:px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">Model & Serial</TableHead>
                              <TableHead className="py-2 md:py-3 px-3 md:px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">Cost</TableHead>
                              <TableHead className="py-2 md:py-3 px-3 md:px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">Purchase Date</TableHead>
                              <TableHead className="py-2 md:py-3 px-3 md:px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</TableHead>
                              <TableHead className="py-2 md:py-3 px-3 md:px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredMachines.map((machine, index) => {
                              const statusOption = machineStatusOptions.find(s => s.value === machine.status);
                              const StatusIcon = statusOption?.icon || CheckCircle;
                              return (
                                <TableRow key={machine.id} className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                  <TableCell className="py-2 md:py-4 px-3 md:px-6">
                                    <div className="flex items-center">
                                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-100 flex items-center justify-center mr-2 md:mr-3">
                                        <span className="text-blue-600 font-semibold text-xs md:text-sm">{machine.name.charAt(0)}</span>
                                      </div>
                                      <div className="min-w-0">
                                        <div className="font-medium text-gray-900 text-xs md:text-sm truncate max-w-[100px] md:max-w-none">{machine.name}</div>
                                        <div className="text-[10px] md:text-xs text-gray-500 truncate max-w-[100px] md:max-w-none">{machine.manufacturer}</div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-2 md:py-4 px-3 md:px-6 hidden md:table-cell">
                                    <div className="text-xs md:text-sm text-gray-700">{machine.model || 'N/A'}</div>
                                    {machine.serialNumber && <div className="text-[10px] md:text-xs text-gray-500">SN: {machine.serialNumber}</div>}
                                  </TableCell>
                                  <TableCell className="py-2 md:py-4 px-3 md:px-6 hidden sm:table-cell">
                                    <div className="font-medium text-blue-600 text-xs md:text-sm">{formatCurrency(machine.cost)}</div>
                                    <div className="text-[10px] md:text-xs text-gray-500">Total: {formatCurrency(machine.cost * machine.quantity)}</div>
                                  </TableCell>
                                  <TableCell className="py-2 md:py-4 px-3 md:px-6 hidden lg:table-cell">
                                    <div className="flex items-center gap-1"><Calendar className="h-3 w-3 md:h-4 md:w-4 text-gray-400" /><span className="text-xs md:text-sm text-gray-700">{formatDate(machine.purchaseDate)}</span></div>
                                  </TableCell>
                                  <TableCell className="py-2 md:py-4 px-3 md:px-6">
                                    <Badge className={`${statusOption?.color} border-0 flex items-center gap-1 text-[10px] md:text-xs px-1.5 md:px-2 py-0.5`}>
                                      <StatusIcon className="h-2 w-2 md:h-3 md:w-3" />
                                      <span className="hidden xs:inline">{statusOption?.label}</span>
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="py-2 md:py-4 px-3 md:px-6 text-right">
                                    <div className="flex items-center justify-end gap-1 md:gap-2">
                                      <Button variant="ghost" size="sm" onClick={() => handleViewMachine(machine.id)} className="w-6 h-6 md:w-8 md:h-8 p-0 rounded-full hover:bg-blue-100 hover:text-blue-600" title="View Details"><Eye className="h-3 w-3 md:h-4 md:w-4" /></Button>
                                      <Button variant="ghost" size="sm" onClick={() => handleEditMachine(machine)} className="w-6 h-6 md:w-8 md:h-8 p-0 rounded-full hover:bg-blue-100 hover:text-blue-600" title="Edit"><Edit className="h-3 w-3 md:h-4 md:w-4" /></Button>
                                      <Button variant="ghost" size="sm" onClick={() => { setSelectedMachineForMaintenance(machine.id); setMaintenanceDialogOpen(true); }} className="w-6 h-6 md:w-8 md:h-8 p-0 rounded-full hover:bg-blue-100 hover:text-blue-600" title="Maintenance"><Wrench className="h-3 w-3 md:h-4 md:w-4" /></Button>
                                      <Button variant="ghost" size="sm" onClick={() => handleDeleteMachine(machine.id)} className="w-6 h-6 md:w-8 md:h-8 p-0 rounded-full hover:bg-red-100 hover:text-red-600" title="Delete"><Trash2 className="h-3 w-3 md:h-4 md:w-4" /></Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CATEGORIES TAB */}
          <AnimatePresence mode="wait">
            {activeTab === "categories" && (
              <motion.div key="categories" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                <Card className="border-0 shadow-lg rounded-xl md:rounded-2xl overflow-hidden">
                  <CardHeader className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
                    <div className="flex items-center justify-between">
                      <div><CardTitle className="text-base md:text-xl font-bold text-gray-900">Categories & Departments</CardTitle><p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Browse inventory by categories and departments</p></div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {departments.map(dept => {
                        const Icon = dept.icon;
                        const deptItems = items.filter(item => item.department === dept.value);
                        const deptCategories = [...new Set(deptItems.map(item => item.category))];
                        const deptValue = deptItems.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
                        return (
                          <Card key={dept.value} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <CardHeader className="pb-2 md:pb-3">
                              <div className="flex items-center gap-2 md:gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-100 flex items-center justify-center"><Icon className="h-4 w-4 md:h-5 md:w-5 text-blue-600" /></div>
                                <div className="min-w-0"><CardTitle className="text-sm md:text-lg text-gray-900 truncate">{dept.label}</CardTitle><CardDescription className="text-[10px] md:text-xs truncate">{deptItems.length} items • {deptCategories.length} categories</CardDescription></div>
                              </div>
                            </CardHeader>
                            <CardContent className="p-3 md:p-4 pt-0">
                              <div className="space-y-2 md:space-y-3">
                                <div className="flex justify-between items-center text-[10px] md:text-xs"><span className="text-gray-600">Total Value:</span><span className="font-semibold text-blue-600 text-xs md:text-sm">{formatCurrency(deptValue)}</span></div>
                                <div className="space-y-1 md:space-y-2"><div className="text-[10px] md:text-xs font-medium text-gray-700">Categories:</div>{deptCategories.length > 0 ? (<div className="flex flex-wrap gap-1 md:gap-2">{deptCategories.map(category => { const categoryItems = deptItems.filter(item => item.category === category); return (<Badge key={category} variant="outline" className="bg-gray-50 text-gray-700 text-[8px] md:text-xs px-1.5 md:px-2 py-0.5">{category} ({categoryItems.length})</Badge>); })}</div>) : (<p className="text-[10px] md:text-xs text-gray-500">No items in this department</p>)}</div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* ADD/EDIT ITEM DIALOG */}
      <Dialog open={itemDialogOpen} onOpenChange={(open) => { setItemDialogOpen(open); if (!open) { setEditItem(null); resetNewItemForm(); } }}>
        <DialogContent className="max-w-sm md:max-w-2xl bg-white rounded-xl md:rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-base md:text-lg font-semibold text-gray-900">{editItem ? 'Edit Item' : 'Add New Item'}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); editItem ? handleEditItem() : handleAddItem(); }} className="space-y-4 md:space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
              <div className="space-y-1 md:space-y-2"><Label htmlFor="name" className="text-xs md:text-sm font-medium text-gray-700">Item Name *</Label><Input id="name" value={editItem ? editItem.name : newItem.name} onChange={(e) => editItem ? setEditItem({...editItem, name: e.target.value}) : setNewItem({...newItem, name: e.target.value})} placeholder="Enter item name" required className="h-8 md:h-10 text-xs md:text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
              <div className="space-y-1 md:space-y-2"><Label htmlFor="sku" className="text-xs md:text-sm font-medium text-gray-700">SKU *</Label><Input id="sku" value={editItem ? editItem.sku : newItem.sku} onChange={(e) => editItem ? setEditItem({...editItem, sku: e.target.value.toUpperCase()}) : setNewItem({...newItem, sku: e.target.value.toUpperCase()})} placeholder="Enter SKU (e.g., INV-001)" required className="h-8 md:h-10 text-xs md:text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
              <div className="space-y-1 md:space-y-2"><Label htmlFor="department" className="text-xs md:text-sm font-medium text-gray-700">Department *</Label><Select value={editItem ? editItem.department : newItem.department} onValueChange={(value) => editItem ? setEditItem({...editItem, department: value, category: ''}) : setNewItem({...newItem, department: value, category: ''})}><SelectTrigger className="h-8 md:h-10 text-xs md:text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"><SelectValue placeholder="Select department" /></SelectTrigger><SelectContent className="rounded-lg">{departments.map(dept => { const Icon = dept.icon; return (<SelectItem key={dept.value} value={dept.value} className="rounded-md"><div className="flex items-center gap-2"><Icon className="h-3 w-3 md:h-4 md:w-4 text-blue-500" /><span className="text-xs md:text-sm">{dept.label}</span></div></SelectItem>); })}</SelectContent></Select></div>
              <div className="space-y-1 md:space-y-2"><Label htmlFor="category" className="text-xs md:text-sm font-medium text-gray-700">Category *</Label><Select value={editItem ? editItem.category : newItem.category} onValueChange={(value) => editItem ? setEditItem({...editItem, category: value}) : setNewItem({...newItem, category: value})} disabled={!editItem?.department && !newItem.department}><SelectTrigger className="h-8 md:h-10 text-xs md:text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent className="rounded-lg">{(editItem ? getCategoriesForDepartment(editItem.department) : getCategoriesForDepartment(newItem.department || '')).map(cat => (<SelectItem key={cat} value={cat} className="rounded-md text-xs md:text-sm">{cat}</SelectItem>))}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
              <div className="space-y-1 md:space-y-2"><Label htmlFor="quantity" className="text-xs md:text-sm font-medium text-gray-700">Quantity *</Label><Input id="quantity" type="number" min="0" value={editItem ? editItem.quantity : newItem.quantity} onChange={(e) => editItem ? setEditItem({...editItem, quantity: parseInt(e.target.value) || 0}) : setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})} placeholder="Enter quantity" required className="h-8 md:h-10 text-xs md:text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
              <div className="space-y-1 md:space-y-2"><Label htmlFor="reorderLevel" className="text-xs md:text-sm font-medium text-gray-700">Reorder Level *</Label><Input id="reorderLevel" type="number" min="0" value={editItem ? editItem.reorderLevel : newItem.reorderLevel} onChange={(e) => editItem ? setEditItem({...editItem, reorderLevel: parseInt(e.target.value) || 0}) : setNewItem({...newItem, reorderLevel: parseInt(e.target.value) || 0})} placeholder="Enter reorder level" required className="h-8 md:h-10 text-xs md:text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
              <div className="space-y-1 md:space-y-2"><Label htmlFor="price" className="text-xs md:text-sm font-medium text-gray-700">Price *</Label><Input id="price" type="number" step="0.01" min="0" value={editItem ? editItem.price : newItem.price} onChange={(e) => editItem ? setEditItem({...editItem, price: parseFloat(e.target.value) || 0}) : setNewItem({...newItem, price: parseFloat(e.target.value) || 0})} placeholder="Enter price" required className="h-8 md:h-10 text-xs md:text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
              <div className="space-y-1 md:space-y-2"><Label htmlFor="costPrice" className="text-xs md:text-sm font-medium text-gray-700">Cost Price *</Label><Input id="costPrice" type="number" step="0.01" min="0" value={editItem ? editItem.costPrice : newItem.costPrice} onChange={(e) => editItem ? setEditItem({...editItem, costPrice: parseFloat(e.target.value) || 0}) : setNewItem({...newItem, costPrice: parseFloat(e.target.value) || 0})} placeholder="Enter cost price" required className="h-8 md:h-10 text-xs md:text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
              <div className="space-y-1 md:space-y-2"><Label htmlFor="assignedManager" className="text-xs md:text-sm font-medium text-gray-700">Assigned Manager</Label><Select value={editItem ? editItem.assignedManager : newItem.assignedManager} onValueChange={(value) => editItem ? setEditItem({...editItem, assignedManager: value}) : setNewItem({...newItem, assignedManager: value})}><SelectTrigger className="h-8 md:h-10 text-xs md:text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"><SelectValue placeholder="Select manager" /></SelectTrigger><SelectContent className="rounded-lg">{managers.map(manager => (<SelectItem key={manager} value={manager} className="rounded-md text-xs md:text-sm">{manager}</SelectItem>))}</SelectContent></Select></div>
              <div className="space-y-1 md:space-y-2"><Label htmlFor="supplier" className="text-xs md:text-sm font-medium text-gray-700">Supplier *</Label><Input id="supplier" value={editItem ? editItem.supplier : newItem.supplier} onChange={(e) => editItem ? setEditItem({...editItem, supplier: e.target.value}) : setNewItem({...newItem, supplier: e.target.value})} placeholder="Enter supplier name" required className="h-8 md:h-10 text-xs md:text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
            </div>
            <div className="space-y-1 md:space-y-2"><Label htmlFor="description" className="text-xs md:text-sm font-medium text-gray-700">Description</Label><Textarea id="description" value={editItem ? editItem.description : newItem.description} onChange={(e) => editItem ? setEditItem({...editItem, description: e.target.value}) : setNewItem({...newItem, description: e.target.value})} placeholder="Enter item description" rows={2} className="text-xs md:text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2"><Button type="button" variant="outline" onClick={() => { setItemDialogOpen(false); setEditItem(null); resetNewItemForm(); }} className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg md:rounded-xl text-xs md:text-sm h-8 md:h-10">Cancel</Button><Button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 rounded-lg md:rounded-xl text-xs md:text-sm h-8 md:h-10">{editItem ? 'Update Item' : 'Add Item'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ADD/EDIT MACHINE DIALOG */}
      <Dialog open={machineDialogOpen} onOpenChange={(open) => { setMachineDialogOpen(open); if (!open) { setEditMachine(null); resetNewMachineForm(); } }}>
        <DialogContent className="max-w-sm md:max-w-2xl bg-white rounded-xl md:rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-base md:text-lg font-semibold text-gray-900">{editMachine ? 'Edit Machine' : 'Add New Machine'}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleAddMachine(); }} className="space-y-4 md:space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
              <div className="space-y-1 md:space-y-2"><Label htmlFor="machineName" className="text-xs md:text-sm font-medium text-gray-700">Machine Name *</Label><Input id="machineName" value={newMachine.name} onChange={(e) => setNewMachine({...newMachine, name: e.target.value})} placeholder="Enter machine name" required className="h-8 md:h-10 text-xs md:text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
              <div className="space-y-1 md:space-y-2"><Label htmlFor="machineCost" className="text-xs md:text-sm font-medium text-gray-700">Cost/Price *</Label><Input id="machineCost" type="number" step="0.01" min="0" value={newMachine.cost} onChange={(e) => setNewMachine({...newMachine, cost: parseFloat(e.target.value) || 0})} placeholder="Enter cost" required className="h-8 md:h-10 text-xs md:text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
              <div className="space-y-1 md:space-y-2"><Label htmlFor="purchaseDate" className="text-xs md:text-sm font-medium text-gray-700">Purchase Date *</Label><Input id="purchaseDate" type="date" value={newMachine.purchaseDate} onChange={(e) => setNewMachine({...newMachine, purchaseDate: e.target.value})} required className="h-8 md:h-10 text-xs md:text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
              <div className="space-y-1 md:space-y-2"><Label htmlFor="machineQuantity" className="text-xs md:text-sm font-medium text-gray-700">Quantity *</Label><Input id="machineQuantity" type="number" min="1" value={newMachine.quantity} onChange={(e) => setNewMachine({...newMachine, quantity: parseInt(e.target.value) || 1})} placeholder="Enter quantity" required className="h-8 md:h-10 text-xs md:text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
              <div className="space-y-1 md:space-y-2"><Label htmlFor="machineStatus" className="text-xs md:text-sm font-medium text-gray-700">Status *</Label><Select value={newMachine.status} onValueChange={(value: 'operational' | 'maintenance' | 'out-of-service') => setNewMachine({...newMachine, status: value})}><SelectTrigger className="h-8 md:h-10 text-xs md:text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent className="rounded-lg">{machineStatusOptions.map(status => (<SelectItem key={status.value} value={status.value} className="rounded-md text-xs md:text-sm">{status.label}</SelectItem>))}</SelectContent></Select></div>
              <div className="space-y-1 md:space-y-2"><Label htmlFor="machineLocation" className="text-xs md:text-sm font-medium text-gray-700">Location</Label><Input id="machineLocation" value={newMachine.location} onChange={(e) => setNewMachine({...newMachine, location: e.target.value})} placeholder="Enter location" className="h-8 md:h-10 text-xs md:text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
              <div className="space-y-1 md:space-y-2"><Label htmlFor="manufacturer" className="text-xs md:text-sm font-medium text-gray-700">Manufacturer</Label><Input id="manufacturer" value={newMachine.manufacturer} onChange={(e) => setNewMachine({...newMachine, manufacturer: e.target.value})} placeholder="Enter manufacturer" className="h-8 md:h-10 text-xs md:text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
              <div className="space-y-1 md:space-y-2"><Label htmlFor="model" className="text-xs md:text-sm font-medium text-gray-700">Model</Label><Input id="model" value={newMachine.model} onChange={(e) => setNewMachine({...newMachine, model: e.target.value})} placeholder="Enter model" className="h-8 md:h-10 text-xs md:text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
              <div className="space-y-1 md:space-y-2"><Label htmlFor="serialNumber" className="text-xs md:text-sm font-medium text-gray-700">Serial Number</Label><Input id="serialNumber" value={newMachine.serialNumber} onChange={(e) => setNewMachine({...newMachine, serialNumber: e.target.value})} placeholder="Enter serial number" className="h-8 md:h-10 text-xs md:text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
              <div className="space-y-1 md:space-y-2"><Label htmlFor="department" className="text-xs md:text-sm font-medium text-gray-700">Department</Label><Input id="department" value={newMachine.department} onChange={(e) => setNewMachine({...newMachine, department: e.target.value})} placeholder="Enter department" className="h-8 md:h-10 text-xs md:text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
            </div>
            <div className="space-y-1 md:space-y-2"><Label htmlFor="machineDescription" className="text-xs md:text-sm font-medium text-gray-700">Description</Label><Textarea id="machineDescription" value={newMachine.description} onChange={(e) => setNewMachine({...newMachine, description: e.target.value})} placeholder="Enter machine description" rows={2} className="text-xs md:text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2"><Button type="button" variant="outline" onClick={() => { setMachineDialogOpen(false); setEditMachine(null); resetNewMachineForm(); }} className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg md:rounded-xl text-xs md:text-sm h-8 md:h-10">Cancel</Button><Button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 rounded-lg md:rounded-xl text-xs md:text-sm h-8 md:h-10">{editMachine ? 'Update Machine' : 'Add Machine'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* VIEW MACHINE DETAILS DIALOG - IMPROVED WITH PROPER WHITE BACKGROUND */}
      <Dialog open={!!viewMachine} onOpenChange={() => setViewMachine(null)}>
        <DialogContent className="max-w-sm md:max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto p-0">
          {/* Header - Sticky with white background */}
          <div className="sticky top-0 z-10 bg-white rounded-t-2xl border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Cpu className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Machine Details</h2>
                <p className="text-sm text-gray-500 mt-0.5">Complete information about the equipment</p>
              </div>
            </div>
          </div>
          
          {viewMachine && (
            <div className="p-6 space-y-6 bg-white">
              {/* Machine Header Card - White background */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-2xl">{viewMachine.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{viewMachine.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {viewMachine.manufacturer && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg text-xs font-medium text-gray-600 shadow-sm">
                          <Building className="h-3 w-3" />
                          {viewMachine.manufacturer}
                        </span>
                      )}
                      {viewMachine.model && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg text-xs font-medium text-gray-600 shadow-sm">
                          <Tag className="h-3 w-3" />
                          {viewMachine.model}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${machineStatusOptions.find(s => s.value === viewMachine.status)?.color} shadow-sm`}>
                    {machineStatusOptions.find(s => s.value === viewMachine.status)?.label}
                  </div>
                </div>
              </div>
              
              {/* Key Information Grid - White background cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cost</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(viewMachine.cost)}</p>
                    <p className="text-xs text-gray-400 mt-1">per unit</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-green-100 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Value</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(viewMachine.cost * viewMachine.quantity)}</p>
                    <p className="text-xs text-gray-400 mt-1">{viewMachine.quantity} units × {formatCurrency(viewMachine.cost)}</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-purple-100 rounded-lg">
                        <Package className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{viewMachine.quantity}</p>
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-amber-100 rounded-lg">
                        <Calendar className="h-4 w-4 text-amber-600" />
                      </div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Purchase Date</span>
                    </div>
                    <p className="text-base font-semibold text-gray-900">{formatDate(viewMachine.purchaseDate)}</p>
                    <p className="text-xs text-gray-400 mt-1">Age: {calculateMachineAge(viewMachine.purchaseDate)} years</p>
                  </div>
                  
                  {viewMachine.location && (
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-indigo-100 rounded-lg">
                          <MapPin className="h-4 w-4 text-indigo-600" />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</span>
                      </div>
                      <p className="text-base font-semibold text-gray-900">{viewMachine.location}</p>
                    </div>
                  )}
                  
                  {viewMachine.department && (
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-teal-100 rounded-lg">
                          <Building className="h-4 w-4 text-teal-600" />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</span>
                      </div>
                      <p className="text-base font-semibold text-gray-900">{viewMachine.department}</p>
                    </div>
                  )}
                  
                  {viewMachine.assignedTo && (
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-cyan-100 rounded-lg">
                          <UserCheck className="h-4 w-4 text-cyan-600" />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned To</span>
                      </div>
                      <p className="text-base font-semibold text-gray-900">{viewMachine.assignedTo}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Serial Number & Model Info */}
              {(viewMachine.serialNumber || viewMachine.model) && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {viewMachine.serialNumber && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Hash className="h-3.5 w-3.5 text-gray-500" />
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Serial Number</span>
                        </div>
                        <p className="text-sm font-mono text-gray-800 bg-white p-2 rounded-lg border border-gray-100">{viewMachine.serialNumber}</p>
                      </div>
                    )}
                    {viewMachine.model && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Tag className="h-3.5 w-3.5 text-gray-500" />
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Model</span>
                        </div>
                        <p className="text-sm font-medium text-gray-800 bg-white p-2 rounded-lg border border-gray-100">{viewMachine.model}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Description */}
              {viewMachine.description && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-1.5 mb-2">
                    <FileText className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed bg-white p-3 rounded-lg border border-gray-100">{viewMachine.description}</p>
                </div>
              )}
              
              {/* Maintenance History Section */}
              {viewMachine.maintenanceHistory && viewMachine.maintenanceHistory.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-orange-100 rounded-lg">
                        <Wrench className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">Maintenance History</span>
                    </div>
                    <span className="px-2 py-1 bg-white rounded-lg text-xs font-medium text-gray-600 shadow-sm">
                      {viewMachine.maintenanceHistory.length} records
                    </span>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {viewMachine.maintenanceHistory.map((record, index) => (
                      <div key={index} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="font-semibold text-sm text-blue-700">{record.type}</span>
                          </div>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">{formatDate(record.date)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{record.description}</p>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <UserCheck className="h-3 w-3" />
                            {record.performedBy}
                          </span>
                          <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                            {formatCurrency(record.cost)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Close Button */}
              <div className="flex justify-end pt-2">
                <Button 
                  onClick={() => setViewMachine(null)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ADD MAINTENANCE RECORD DIALOG - IMPROVED DESIGN */}
      <Dialog open={maintenanceDialogOpen} onOpenChange={(open) => {
        setMaintenanceDialogOpen(open);
        if (!open) {
          setSelectedMachineForMaintenance(null);
          setMaintenanceRecord({
            type: "Routine",
            description: "",
            cost: 0,
            performedBy: "",
          });
        }
      }}>
        <DialogContent className="max-w-[95vw] sm:max-w-md bg-white rounded-xl shadow-xl">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Wrench className="h-4 w-4 text-blue-600" />
              </div>
              <DialogTitle className="text-lg font-semibold text-gray-900">Add Maintenance Record</DialogTitle>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Record maintenance activity for machinery</p>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            handleAddMaintenance();
          }} className="space-y-4 py-2">
            {/* Select Machine */}
            <div className="space-y-1.5">
              <Label htmlFor="maintenanceMachine" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Cpu className="h-3.5 w-3.5" />
                Select Machine <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedMachineForMaintenance || ""}
                onValueChange={setSelectedMachineForMaintenance}
              >
                <SelectTrigger className="h-10 text-sm rounded-lg border-gray-200 bg-gray-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                  <SelectValue placeholder="Choose a machine..." />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  {machines.map(machine => (
                    <SelectItem key={machine.id} value={machine.id} className="rounded-md">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm">{machine.name}</span>
                        {machine.model && <span className="text-xs text-gray-400">({machine.model})</span>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedMachineForMaintenance && (
              <>
                {/* Maintenance Type */}
                <div className="space-y-1.5">
                  <Label htmlFor="maintenanceType" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" />
                    Maintenance Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={maintenanceRecord.type}
                    onValueChange={(value) => setMaintenanceRecord({...maintenanceRecord, type: value})}
                  >
                    <SelectTrigger className="h-10 text-sm rounded-lg border-gray-200 bg-gray-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                      <SelectValue placeholder="Select maintenance type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      {maintenanceTypes.map(type => {
                        const typeIcons: Record<string, any> = {
                          "Routine": <Settings className="h-3.5 w-3.5 text-blue-500" />,
                          "Preventive": <Shield className="h-3.5 w-3.5 text-green-500" />,
                          "Corrective": <Wrench className="h-3.5 w-3.5 text-orange-500" />,
                          "Emergency": <AlertTriangle className="h-3.5 w-3.5 text-red-500" />,
                          "Scheduled": <Calendar className="h-3.5 w-3.5 text-purple-500" />,
                          "Overhaul": <Settings className="h-3.5 w-3.5 text-gray-500" />
                        };
                        return (
                          <SelectItem key={type} value={type} className="rounded-md">
                            <div className="flex items-center gap-2">
                              {typeIcons[type] || <Tag className="h-3.5 w-3.5" />}
                              <span className="text-sm">{type}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Description */}
                <div className="space-y-1.5">
                  <Label htmlFor="maintenanceDescription" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="maintenanceDescription"
                    value={maintenanceRecord.description}
                    onChange={(e) => setMaintenanceRecord({...maintenanceRecord, description: e.target.value})}
                    placeholder="Describe the maintenance performed..."
                    rows={3}
                    className="text-sm rounded-lg border-gray-200 bg-gray-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                </div>
                
                {/* Cost and Performed By - Side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="maintenanceCost" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      Cost
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                      <Input
                        id="maintenanceCost"
                        type="number"
                        step="0.01"
                        min="0"
                        value={maintenanceRecord.cost}
                        onChange={(e) => setMaintenanceRecord({...maintenanceRecord, cost: parseFloat(e.target.value) || 0})}
                        placeholder="0.00"
                        className="pl-7 h-10 text-sm rounded-lg border-gray-200 bg-gray-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="performedBy" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <UserCheck className="h-3.5 w-3.5" />
                      Performed By <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="performedBy"
                      value={maintenanceRecord.performedBy}
                      onChange={(e) => setMaintenanceRecord({...maintenanceRecord, performedBy: e.target.value})}
                      placeholder="Technician name"
                      className="h-10 text-sm rounded-lg border-gray-200 bg-gray-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </>
            )}
            
            {/* Action Buttons */}
            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t mt-2">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setMaintenanceDialogOpen(false)}
                className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm h-10"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={!selectedMachineForMaintenance || maintenanceLoading}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 rounded-lg text-sm h-10"
              >
                {maintenanceLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Maintenance
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* IMPORT DIALOG */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-sm md:max-w-md bg-white rounded-xl md:rounded-2xl">
          <DialogHeader><DialogTitle className="text-base md:text-lg font-semibold text-gray-900">Import Data from CSV</DialogTitle></DialogHeader>
          <div className="space-y-3 md:space-y-4">
            <div className="space-y-1 md:space-y-2"><Label htmlFor="csv-file" className="text-xs md:text-sm font-medium text-gray-700">Upload CSV File</Label><div className="border-2 border-dashed border-gray-300 rounded-xl p-4 md:p-6 text-center hover:border-blue-400 transition-colors bg-gray-50"><Input id="csv-file" type="file" accept=".csv" className="hidden" /><Label htmlFor="csv-file" className="cursor-pointer"><UploadCloud className="h-8 w-8 md:h-10 md:w-10 mx-auto mb-2 text-gray-400" /><p className="text-xs md:text-sm font-medium text-gray-700">Click to upload</p><p className="text-[10px] md:text-xs text-gray-500 mt-1">Supports .csv files</p></Label></div></div>
            <div className="p-3 md:p-4 border border-gray-200 rounded-xl bg-gray-50"><h4 className="font-medium text-gray-900 text-xs md:text-sm mb-2">CSV Format (Inventory)</h4><div className="text-[10px] md:text-xs space-y-1 md:space-y-2 text-gray-600"><div className="flex items-center gap-2"><CheckCircle className="h-2 w-2 md:h-3 md:w-3 text-green-500" /><span>Required fields: SKU, Name, Department, Category</span></div><div className="grid grid-cols-2 gap-1 md:gap-2 mt-2"><div><span className="font-medium">SKU</span> <span className="text-red-500">*</span></div><div><span className="font-medium">Name</span> <span className="text-red-500">*</span></div><div><span className="font-medium">Department</span> <span className="text-red-500">*</span></div><div><span className="font-medium">Category</span> <span className="text-red-500">*</span></div></div></div></div>
            <div className="flex flex-col sm:flex-row gap-2"><Button onClick={handleExport} disabled={items.length === 0} variant="outline" className="w-full sm:flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg md:rounded-xl text-xs md:text-sm h-8 md:h-10"><Download className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />Export Template</Button><Button disabled={true} className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 rounded-lg md:rounded-xl text-xs md:text-sm h-8 md:h-10">Import Data</Button></div>
            <p className="text-[10px] md:text-xs text-gray-500 text-center">Note: Import functionality is under development</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* CHANGE HISTORY DIALOG */}
      <Dialog open={!!changeHistoryDialogOpen} onOpenChange={() => setChangeHistoryDialogOpen(null)}>
        <DialogContent className="max-w-sm md:max-w-md bg-white rounded-xl md:rounded-2xl">
          <DialogHeader><DialogTitle className="text-base md:text-lg font-semibold text-gray-900">Change History</DialogTitle></DialogHeader>
          {changeHistoryDialogOpen && (
            <div className="space-y-1 md:space-y-2 max-h-40 md:max-h-60 overflow-y-auto">
              {(() => {
                const item = items.find(item => item.id === changeHistoryDialogOpen);
                return item?.changeHistory && item.changeHistory.length > 0 ? (
                  item.changeHistory.map((change, index) => (
                    <div key={index} className="flex flex-col md:flex-row md:items-center justify-between text-[10px] md:text-xs p-2 md:p-3 bg-gray-50/50 rounded-lg border border-gray-100 gap-1 md:gap-0">
                      <span className="text-blue-600">{change.date}</span>
                      <span className="text-gray-700">{change.change}</span>
                      <span className="text-gray-600">by {change.user}</span>
                      <span className={`font-medium ${change.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>{change.quantity > 0 ? '+' : ''}{change.quantity}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs md:text-sm text-gray-500 text-center py-4">No change history available for this item</p>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPage;