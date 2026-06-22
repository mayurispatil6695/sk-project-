import { useState } from "react";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Search, Filter, Eye, MessageCircle, CheckCircle, XCircle, Clock, AlertCircle, User, Sparkles, Trash2, Car, Shield, Wifi, Paperclip, Image, Video, FileText, Download, BarChart3, TrendingUp, Calendar } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Types
interface WorkQuery {
  id: number;
  queryId: string;
  title: string;
  description: string;
  type: "task" | "service";
  relatedId: string;
  relatedTo: string;
  employeeId?: string;
  employeeName?: string;
  serviceType?: "cleaning" | "waste-management" | "parking-management" | "security" | "maintenance";
  serviceStaffId?: string;
  serviceStaffName?: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "in-progress" | "resolved" | "rejected";
  category: string;
  proofFiles: ProofFile[];
  supervisorId: string;
  supervisorName: string;
  createdAt: string;
  updatedAt: string;
  superadminResponse?: string;
  responseDate?: string;
  assignedTo?: string;
  assignedToName?: string;
  resolutionDate?: string;
}

interface ProofFile {
  id: number;
  name: string;
  type: "image" | "video" | "document" | "other";
  url: string;
  uploadDate: string;
  size: string;
}

interface ActionLog {
  id: number;
  queryId: string;
  action: string;
  performedBy: string;
  performedByName: string;
  timestamp: string;
  details?: string;
}

// Sample Data
const initialWorkQueries: WorkQuery[] = [
  {
    id: 1,
    queryId: "QUERY001",
    title: "Employee not following task guidelines",
    description: "The assigned employee is not following the established design guidelines for the homepage redesign. The color scheme and layout are inconsistent with our brand standards.",
    type: "task",
    relatedId: "TASK001",
    relatedTo: "Website Redesign - Homepage",
    employeeId: "EMP001",
    employeeName: "Rajesh Kumar",
    priority: "high",
    status: "pending",
    category: "work-quality",
    proofFiles: [
      {
        id: 1,
        name: "screenshot-design-issue.png",
        type: "image",
        url: "#",
        uploadDate: "2024-02-01",
        size: "2.4 MB"
      }
    ],
    supervisorId: "SUP001",
    supervisorName: "Supervisor User",
    createdAt: "2024-02-01T10:30:00",
    updatedAt: "2024-02-01T10:30:00"
  },
  {
    id: 2,
    queryId: "QUERY002",
    title: "Cleaning service not meeting standards",
    description: "The deep cleaning service performed today did not meet the expected standards. Dust accumulation visible in corners and windows not properly cleaned.",
    type: "service",
    relatedId: "CLEAN001",
    relatedTo: "Office Floor Deep Cleaning",
    serviceType: "cleaning",
    serviceStaffId: "STAFF001",
    serviceStaffName: "Ramesh Kumar",
    priority: "high",
    status: "in-progress",
    category: "service-quality",
    proofFiles: [
      {
        id: 1,
        name: "dust-corner.jpg",
        type: "image",
        url: "#",
        uploadDate: "2024-02-15",
        size: "1.8 MB"
      },
      {
        id: 2,
        name: "dirty-window.jpg",
        type: "image",
        url: "#",
        uploadDate: "2024-02-15",
        size: "2.1 MB"
      }
    ],
    supervisorId: "SUP001",
    supervisorName: "Supervisor User",
    createdAt: "2024-02-15T11:20:00",
    updatedAt: "2024-02-15T14:30:00",
    superadminResponse: "We will arrange for re-cleaning and provide additional training to the staff.",
    responseDate: "2024-02-15T14:30:00",
    assignedTo: "FM001",
    assignedToName: "Facility Manager"
  },
  {
    id: 3,
    queryId: "QUERY003",
    title: "Waste not collected on time",
    description: "Scheduled waste collection for biomedical waste was missed. Waste bins are overflowing and creating hygiene issues in clinic area.",
    type: "service",
    relatedId: "WASTE001",
    relatedTo: "Biomedical Waste Collection",
    serviceType: "waste-management",
    serviceStaffId: "STAFF002",
    serviceStaffName: "Suresh Patel",
    priority: "critical",
    status: "pending",
    category: "service-delay",
    proofFiles: [
      {
        id: 1,
        name: "overflowing-bins.jpg",
        type: "image",
        url: "#",
        uploadDate: "2024-02-15",
        size: "2.5 MB"
      }
    ],
    supervisorId: "SUP001",
    supervisorName: "Supervisor User",
    createdAt: "2024-02-15T16:45:00",
    updatedAt: "2024-02-15T16:45:00"
  },
  {
    id: 4,
    queryId: "QUERY004",
    title: "Parking slots not properly marked",
    description: "New parking slots are not clearly marked and numbered. Employees are confused about assigned parking areas.",
    type: "service",
    relatedId: "PARK001",
    relatedTo: "Parking Lot Reorganization",
    serviceType: "parking-management",
    serviceStaffId: "STAFF003",
    serviceStaffName: "Anil Sharma",
    priority: "medium",
    status: "resolved",
    category: "service-quality",
    proofFiles: [
      {
        id: 1,
        name: "parking-markings.jpg",
        type: "image",
        url: "#",
        uploadDate: "2024-02-14",
        size: "3.2 MB"
      }
    ],
    supervisorId: "SUP001",
    supervisorName: "Supervisor User",
    createdAt: "2024-02-14T15:30:00",
    updatedAt: "2024-02-15T10:15:00",
    superadminResponse: "Parking attendant has been instructed to re-mark all slots clearly. Work completed today.",
    responseDate: "2024-02-15T10:15:00",
    assignedTo: "FM001",
    assignedToName: "Facility Manager",
    resolutionDate: "2024-02-15T16:00:00"
  },
  {
    id: 5,
    queryId: "QUERY005",
    title: "Database performance issues - urgent attention needed",
    description: "Critical performance issues in production database causing application timeouts and user complaints. Multiple error reports received.",
    type: "task",
    relatedId: "TASK002",
    relatedTo: "Database Optimization",
    employeeId: "EMP002",
    employeeName: "Priya Sharma",
    priority: "critical",
    status: "in-progress",
    category: "technical-issue",
    proofFiles: [
      {
        id: 1,
        name: "performance-metrics.csv",
        type: "document",
        url: "#",
        uploadDate: "2024-02-15",
        size: "1.2 MB"
      },
      {
        id: 2,
        name: "error-logs.txt",
        type: "document",
        url: "#",
        uploadDate: "2024-02-15",
        size: "0.8 MB"
      }
    ],
    supervisorId: "SUP001",
    supervisorName: "Supervisor User",
    createdAt: "2024-02-15T09:15:00",
    updatedAt: "2024-02-15T11:30:00",
    superadminResponse: "Senior DBA team assigned to investigate immediately. Expected resolution within 4 hours.",
    responseDate: "2024-02-15T11:30:00",
    assignedTo: "DBA001",
    assignedToName: "Database Admin Team"
  }
];

const actionTeamMembers = [
  { id: "FM001", name: "Facility Manager", department: "Facility" },
  { id: "DBA001", name: "Database Admin Team", department: "IT" },
  { id: "HR001", name: "HR Manager", department: "Human Resources" },
  { id: "IT001", name: "IT Support Team", department: "IT" },
  { id: "OPS001", name: "Operations Manager", department: "Operations" },
  { id: "TECH001", name: "Technical Lead", department: "IT" }
];

const categories = [
  "work-quality",
  "deadline-missed",
  "technical-issue",
  "communication-issue",
  "resource-needed",
  "behavioral-issue",
  "service-quality",
  "service-delay",
  "safety-issue",
  "other"
];

const categoryLabels: { [key: string]: string } = {
  "work-quality": "Work Quality Issue",
  "deadline-missed": "Deadline Missed",
  "technical-issue": "Technical Issue",
  "communication-issue": "Communication Issue",
  "resource-needed": "Resources Needed",
  "behavioral-issue": "Behavioral Issue",
  "service-quality": "Service Quality Issue",
  "service-delay": "Service Delay",
  "safety-issue": "Safety Issue",
  "other": "Other"
};

const serviceTypeLabels: { [key: string]: string } = {
  "cleaning": "Cleaning Service",
  "waste-management": "Waste Management",
  "parking-management": "Parking Management",
  "security": "Security Service",
  "maintenance": "Maintenance"
};

const serviceIcons: { [key: string]: any } = {
  "cleaning": Sparkles,
  "waste-management": Trash2,
  "parking-management": Car,
  "security": Shield,
  "maintenance": Wifi
};

// Reusable Components
const PriorityBadge = ({ priority }: { priority: string }) => {
  const styles = {
    low: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    high: "bg-orange-100 text-orange-800 border-orange-200",
    critical: "bg-red-100 text-red-800 border-red-200"
  };

  const icons = {
    low: <CheckCircle className="h-3 w-3" />,
    medium: <Clock className="h-3 w-3" />,
    high: <AlertCircle className="h-3 w-3" />,
    critical: <AlertCircle className="h-3 w-3" />
  };

  return (
    <Badge variant="outline" className={styles[priority as keyof typeof styles]}>
      <span className="flex items-center gap-1">
        {icons[priority as keyof typeof icons]}
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    </Badge>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    "in-progress": "bg-blue-100 text-blue-800 border-blue-200",
    resolved: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200"
  };

  const icons = {
    pending: <Clock className="h-3 w-3" />,
    "in-progress": <AlertCircle className="h-3 w-3" />,
    resolved: <CheckCircle className="h-3 w-3" />,
    rejected: <XCircle className="h-3 w-3" />
  };

  return (
    <Badge variant="outline" className={styles[status as keyof typeof styles]}>
      <span className="flex items-center gap-1">
        {icons[status as keyof typeof icons]}
        {status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </span>
    </Badge>
  );
};

const QueryTypeBadge = ({ type }: { type: string }) => {
  const styles = {
    task: "bg-purple-100 text-purple-800 border-purple-200",
    service: "bg-blue-100 text-blue-800 border-blue-200"
  };

  const icons = {
    task: <User className="h-3 w-3" />,
    service: <Sparkles className="h-3 w-3" />
  };

  return (
    <Badge variant="outline" className={styles[type as keyof typeof styles]}>
      <span className="flex items-center gap-1">
        {icons[type as keyof typeof icons]}
        {type.charAt(0).toUpperCase() + type.slice(1)} Related
      </span>
    </Badge>
  );
};

const ServiceTypeBadge = ({ type }: { type: string }) => {
  const Icon = serviceIcons[type] || Sparkles;
  const styles = {
    cleaning: "bg-blue-100 text-blue-800 border-blue-200",
    "waste-management": "bg-green-100 text-green-800 border-green-200",
    "parking-management": "bg-purple-100 text-purple-800 border-purple-200",
    "security": "bg-orange-100 text-orange-800 border-orange-200",
    "maintenance": "bg-red-100 text-red-800 border-red-200"
  };

  return (
    <Badge variant="outline" className={styles[type as keyof typeof styles]}>
      <span className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {serviceTypeLabels[type]}
      </span>
    </Badge>
  );
};

const FileIcon = ({ type }: { type: string }) => {
  const icons = {
    image: <Image className="h-4 w-4" />,
    video: <Video className="h-4 w-4" />,
    document: <FileText className="h-4 w-4" />,
    other: <Paperclip className="h-4 w-4" />
  };

  return icons[type as keyof typeof icons] || <Paperclip className="h-4 w-4" />;
};

// Main Component
const SuperAdminWorkIssues = () => {
  const [workQueries, setWorkQueries] = useState<WorkQuery[]>(initialWorkQueries);
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedQuery, setSelectedQuery] = useState<WorkQuery | null>(null);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // Action form state
  const [actionData, setActionData] = useState({
    status: "in-progress" as "in-progress" | "resolved" | "rejected",
    assignedTo: "",
    response: "",
    resolutionNotes: ""
  });

  // Filter work queries
  const filteredQueries = workQueries.filter(query => {
    const matchesSearch = 
      query.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.queryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.supervisorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || query.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || query.priority === priorityFilter;
    const matchesType = typeFilter === "all" || query.type === typeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  // Handle action dialog open
  const handleOpenActionDialog = (query: WorkQuery) => {
    setSelectedQuery(query);
    setActionData({
      status: query.status === "pending" ? "in-progress" : query.status,
      assignedTo: query.assignedTo || "",
      response: query.superadminResponse || "",
      resolutionNotes: ""
    });
    setIsActionDialogOpen(true);
  };

  // Handle action submission
  const handleSubmitAction = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedQuery) return;

    if (actionData.status === "in-progress" && !actionData.assignedTo) {
      toast.error("Please assign the query to a team member for action");
      return;
    }

    if ((actionData.status === "resolved" || actionData.status === "rejected") && !actionData.response) {
      toast.error("Please provide a response for the supervisor");
      return;
    }

    // Update the query
    const updatedQueries = workQueries.map(query => 
      query.id === selectedQuery.id 
        ? {
            ...query,
            status: actionData.status,
            assignedTo: actionData.assignedTo,
            assignedToName: actionTeamMembers.find(member => member.id === actionData.assignedTo)?.name,
            superadminResponse: actionData.response,
            responseDate: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...(actionData.status === "resolved" && { 
              resolutionDate: new Date().toISOString(),
              resolutionNotes: actionData.resolutionNotes
            })
          }
        : query
    );

    // Add to action logs
    const newActionLog: ActionLog = {
      id: actionLogs.length + 1,
      queryId: selectedQuery.queryId,
      action: `Status changed to ${actionData.status}`,
      performedBy: "SA001",
      performedByName: "Super Admin",
      timestamp: new Date().toISOString(),
      details: actionData.response || `Assigned to: ${actionTeamMembers.find(member => member.id === actionData.assignedTo)?.name}`
    };

    setWorkQueries(updatedQueries);
    setActionLogs(prev => [newActionLog, ...prev]);
    setIsActionDialogOpen(false);
    
    toast.success(`Query ${selectedQuery.queryId} ${actionData.status} successfully!`);
  };

  // Handle quick actions
  const handleQuickAction = (queryId: string, action: "assign" | "resolve" | "reject") => {
    const query = workQueries.find(q => q.queryId === queryId);
    if (!query) return;

    let status: WorkQuery['status'] = "in-progress";
    let response = "";

    switch (action) {
      case "assign":
        status = "in-progress";
        response = "Issue has been assigned to the relevant team for investigation and resolution.";
        break;
      case "resolve":
        status = "resolved";
        response = "Issue has been resolved. Thank you for bringing this to our attention.";
        break;
      case "reject":
        status = "rejected";
        response = "This issue does not require further action based on our assessment.";
        break;
    }

    const updatedQueries = workQueries.map(q => 
      q.queryId === queryId 
        ? {
            ...q,
            status,
            superadminResponse: response,
            responseDate: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...(status === "resolved" && { resolutionDate: new Date().toISOString() })
          }
        : q
    );

    const newActionLog: ActionLog = {
      id: actionLogs.length + 1,
      queryId,
      action: `Quick action: ${action}`,
      performedBy: "SA001",
      performedByName: "Super Admin",
      timestamp: new Date().toISOString(),
      details: response
    };

    setWorkQueries(updatedQueries);
    setActionLogs(prev => [newActionLog, ...prev]);
    
    toast.success(`Query ${queryId} ${action === 'assign' ? 'assigned' : action + 'd'} successfully!`);
  };

  // Get statistics
  const statusCounts = {
    pending: workQueries.filter(q => q.status === "pending").length,
    "in-progress": workQueries.filter(q => q.status === "in-progress").length,
    resolved: workQueries.filter(q => q.status === "resolved").length,
    rejected: workQueries.filter(q => q.status === "rejected").length
  };

  const priorityCounts = {
    low: workQueries.filter(q => q.priority === "low").length,
    medium: workQueries.filter(q => q.priority === "medium").length,
    high: workQueries.filter(q => q.priority === "high").length,
    critical: workQueries.filter(q => q.priority === "critical").length
  };

  const typeCounts = {
    task: workQueries.filter(q => q.type === "task").length,
    service: workQueries.filter(q => q.type === "service").length
  };

  const responseTimeStats = {
    avgResponseTime: "2.5 hours",
    pendingOver24h: workQueries.filter(q => 
      q.status === "pending" && 
      (Date.now() - new Date(q.createdAt).getTime()) > 24 * 60 * 60 * 1000
    ).length,
    resolvedToday: workQueries.filter(q => 
      q.status === "resolved" && 
      new Date(q.resolutionDate!).toDateString() === new Date().toDateString()
    ).length
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        title="Work Issues Management" 
        subtitle="Review and take action on supervisor-reported work issues"
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 space-y-6"
      >
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="issues">All Issues</TabsTrigger>
            <TabsTrigger value="pending">Pending Action</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="dark:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-gray-200">Total Issues</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">{workQueries.length}</div>
                <p className="text-xs text-muted-foreground dark:text-gray-400">All reported issues</p>
              </CardContent>
              </Card>
              <Card className="dark:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-gray-200">Pending Action</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">{statusCounts.pending}</div>
                <p className="text-xs text-muted-foreground dark:text-gray-400">Require attention</p>
              </CardContent>
              </Card>
              <Card className="dark:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-gray-200">In Progress</CardTitle>
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">{statusCounts["in-progress"]}</div>
                <p className="text-xs text-muted-foreground dark:text-gray-400">Being handled</p>
              </CardContent>
              </Card>
              <Card className="dark:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-gray-200">Resolved Today</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-500">{responseTimeStats.resolvedToday}</div>
                <p className="text-xs text-muted-foreground dark:text-gray-400">Issues closed today</p>
              </CardContent>
              </Card>
            </div>

            {/* Priority and Type Distribution */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-200">
                <AlertCircle className="h-5 w-5 dark:text-gray-400" />
                Priority Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                {Object.entries(priorityCounts).map(([priority, count]) => (
                  <div key={priority} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={priority} />
                  </div>
                  <div className="text-right">
                    <div className="font-medium dark:text-gray-200">{count}</div>
                    <div className="text-xs text-muted-foreground dark:text-gray-400">
                    {workQueries.length > 0 ? Math.round((count / workQueries.length) * 100) : 0}%
                    </div>
                  </div>
                  </div>
                ))}
                </div>
              </CardContent>
              </Card>

              <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-200">
                <BarChart3 className="h-5 w-5 dark:text-gray-400" />
                Issue Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <QueryTypeBadge type="task" />
                  <div className="text-right">
                  <div className="font-medium dark:text-gray-200">{typeCounts.task}</div>
                  <div className="text-xs text-muted-foreground dark:text-gray-400">
                    {workQueries.length > 0 ? Math.round((typeCounts.task / workQueries.length) * 100) : 0}%
                  </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <QueryTypeBadge type="service" />
                  <div className="text-right">
                  <div className="font-medium dark:text-gray-200">{typeCounts.service}</div>
                  <div className="text-xs text-muted-foreground dark:text-gray-400">
                    {workQueries.length > 0 ? Math.round((typeCounts.service / workQueries.length) * 100) : 0}%
                  </div>
                  </div>
                </div>
                </div>
              </CardContent>
              </Card>
            </div>

            {/* Recent Critical Issues */}
            <Card className="dark:bg-gray-800">
              <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-gray-200">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
                Critical & High Priority Issues
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Issues requiring immediate attention
              </CardDescription>
              </CardHeader>
              <CardContent>
              <Table>
                <TableHeader>
                <TableRow className="dark:bg-gray-900">
                  <TableHead className="dark:text-gray-300">Query ID</TableHead>
                  <TableHead className="dark:text-gray-300">Title</TableHead>
                  <TableHead className="dark:text-gray-300">Type</TableHead>
                  <TableHead className="dark:text-gray-300">Priority</TableHead>
                  <TableHead className="dark:text-gray-300">Status</TableHead>
                  <TableHead className="dark:text-gray-300">Supervisor</TableHead>
                  <TableHead className="text-right dark:text-gray-300">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {workQueries
                  .filter(q => q.priority === "critical" || q.priority === "high")
                  .slice(0, 5)
                  .map((query) => (
                  <TableRow key={query.id} className={
                  query.priority === "critical" ? "dark:bg-red-900/20" : "dark:bg-orange-900/20"
                  }>
                  <TableCell className="font-medium dark:text-gray-200">{query.queryId}</TableCell>
                  <TableCell className="dark:text-gray-300">
                    <div className="max-w-xs truncate">{query.title}</div>
                  </TableCell>
                  <TableCell>
                    <QueryTypeBadge type={query.type} />
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={query.priority} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={query.status} />
                  </TableCell>
                  <TableCell className="dark:text-gray-300">{query.supervisorName}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleOpenActionDialog(query)}
                      className="dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
                    >
                      Take Action
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                        <Eye className="h-3 w-3" />
                      </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl dark:bg-gray-800">
                      <DialogHeader>
                        <DialogTitle className="dark:text-gray-200">Issue Details - {query.queryId}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {/* Details will be shown here */}
                      </div>
                      </DialogContent>
                    </Dialog>
                    </div>
                  </TableCell>
                  </TableRow>
                ))}
                </TableBody>
              </Table>
              </CardContent>
            </Card>
            </TabsContent>

          {/* All Issues Tab */}
          <TabsContent value="issues" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Work Issues</CardTitle>
                <CardDescription>
                  Complete overview of all reported issues from supervisors
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label>Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search issues..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="task">Task Related</SelectItem>
                        <SelectItem value="service">Service Related</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Issues Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Query ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Related To</TableHead>
                      <TableHead>Supervisor</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQueries.map((query) => (
                      <TableRow key={query.id}>
                        <TableCell className="font-medium">{query.queryId}</TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium truncate">{query.title}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {query.description.substring(0, 50)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <QueryTypeBadge type={query.type} />
                          {query.serviceType && (
                            <div className="mt-1">
                              <ServiceTypeBadge type={query.serviceType} />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium text-sm truncate">{query.relatedTo}</div>
                            <div className="text-xs text-muted-foreground">{query.relatedId}</div>
                          </div>
                        </TableCell>
                        <TableCell>{query.supervisorName}</TableCell>
                        <TableCell>
                          <PriorityBadge priority={query.priority} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={query.status} />
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(query.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          {query.assignedToName ? (
                            <Badge variant="outline">{query.assignedToName}</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-100">Unassigned</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {query.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleQuickAction(query.queryId, "assign")}
                                >
                                  Assign
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleQuickAction(query.queryId, "resolve")}
                                >
                                  Resolve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleQuickAction(query.queryId, "reject")}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenActionDialog(query)}
                            >
                              Action
                            </Button>
                            <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setSelectedQuery(query)}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Issue Details - {query.queryId}</DialogTitle>
                                </DialogHeader>
                                {selectedQuery && (
                                  <div className="space-y-6">
                                    {/* Query Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-semibold">Query Type</Label>
                                        <div className="mt-1">
                                          <QueryTypeBadge type={selectedQuery.type} />
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Category</Label>
                                        <Badge className="mt-1">{categoryLabels[selectedQuery.category]}</Badge>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Priority</Label>
                                        <div className="mt-1">
                                          <PriorityBadge priority={selectedQuery.priority} />
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Status</Label>
                                        <div className="mt-1">
                                          <StatusBadge status={selectedQuery.status} />
                                        </div>
                                      </div>
                                    </div>

                                    {/* Related Information */}
                                    <div>
                                      <Label className="font-semibold">
                                        Related {selectedQuery.type === "task" ? "Task" : "Service"}
                                      </Label>
                                      <div className="mt-1 p-3 border rounded-lg">
                                        <div className="font-medium">{selectedQuery.relatedTo}</div>
                                        <div className="text-sm text-muted-foreground">ID: {selectedQuery.relatedId}</div>
                                        {selectedQuery.serviceType && (
                                          <div className="mt-2">
                                            <ServiceTypeBadge type={selectedQuery.serviceType} />
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* People Involved */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-semibold">Reported By</Label>
                                        <div className="flex items-center gap-2 mt-1 p-3 border rounded-lg">
                                          <User className="h-4 w-4" />
                                          <div>
                                            <div className="font-medium">{selectedQuery.supervisorName}</div>
                                            <div className="text-sm text-muted-foreground">Supervisor</div>
                                          </div>
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">
                                          {selectedQuery.type === "task" ? "Assigned Employee" : "Service Staff"}
                                        </Label>
                                        <div className="flex items-center gap-2 mt-1 p-3 border rounded-lg">
                                          {selectedQuery.type === "task" ? (
                                            <>
                                              <User className="h-4 w-4" />
                                              <div>
                                                <div className="font-medium">{selectedQuery.employeeName}</div>
                                                <div className="text-sm text-muted-foreground">{selectedQuery.employeeId}</div>
                                              </div>
                                            </>
                                          ) : (
                                            <>
                                              <Sparkles className="h-4 w-4" />
                                              <div>
                                                <div className="font-medium">{selectedQuery.serviceStaffName}</div>
                                                <div className="text-sm text-muted-foreground">{selectedQuery.serviceStaffId}</div>
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                      <Label className="font-semibold">Description</Label>
                                      <p className="mt-1 text-sm whitespace-pre-wrap">{selectedQuery.description}</p>
                                    </div>

                                    {/* Proof Files */}
                                    {selectedQuery.proofFiles.length > 0 && (
                                      <div>
                                        <Label className="font-semibold">Supporting Evidence</Label>
                                        <div className="grid gap-2 mt-2">
                                          {selectedQuery.proofFiles.map((file) => (
                                            <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                                              <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-100 rounded-lg">
                                                  <FileIcon type={file.type} />
                                                </div>
                                                <div>
                                                  <div className="font-medium">{file.name}</div>
                                                  <div className="text-xs text-muted-foreground">
                                                    {file.size} • {file.type} • {new Date(file.uploadDate).toLocaleDateString()}
                                                  </div>
                                                </div>
                                              </div>
                                              <Button size="sm" variant="outline">
                                                <Download className="h-3 w-3 mr-1" />
                                                Download
                                              </Button>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Superadmin Response */}
                                    {selectedQuery.superadminResponse && (
                                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <Label className="font-semibold text-blue-900">Your Response</Label>
                                        <p className="mt-1 text-sm text-blue-800 whitespace-pre-wrap">
                                          {selectedQuery.superadminResponse}
                                        </p>
                                        {selectedQuery.responseDate && (
                                          <div className="text-xs text-blue-600 mt-2">
                                            Responded on: {new Date(selectedQuery.responseDate).toLocaleString()}
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Action History */}
                                    <div>
                                      <Label className="font-semibold">Action History</Label>
                                      <div className="space-y-2 mt-2">
                                        {actionLogs
                                          .filter(log => log.queryId === selectedQuery.queryId)
                                          .map((log) => (
                                            <div key={log.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                              <div className="p-2 bg-gray-100 rounded-full">
                                                <User className="h-4 w-4" />
                                              </div>
                                              <div className="flex-1">
                                                <div className="font-medium text-sm">{log.action}</div>
                                                <div className="text-xs text-muted-foreground">
                                                  By {log.performedByName} • {new Date(log.timestamp).toLocaleString()}
                                                </div>
                                                {log.details && (
                                                  <div className="text-xs text-muted-foreground mt-1">
                                                    {log.details}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredQueries.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No issues found</h3>
                    <p>No work issues match your current filters.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Action Tab */}
          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  Pending Action Issues
                </CardTitle>
                <CardDescription>
                  Issues awaiting superadmin review and action
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Query ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Supervisor</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workQueries
                      .filter(q => q.status === "pending")
                      .map((query) => (
                      <TableRow key={query.id}>
                        <TableCell className="font-medium">{query.queryId}</TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium truncate">{query.title}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {query.description.substring(0, 50)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <QueryTypeBadge type={query.type} />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {categoryLabels[query.category]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <PriorityBadge priority={query.priority} />
                        </TableCell>
                        <TableCell>{query.supervisorName}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(query.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(query.createdAt).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleOpenActionDialog(query)}
                            >
                              Take Action
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuickAction(query.queryId, "assign")}
                            >
                              Quick Assign
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {workQueries.filter(q => q.status === "pending").length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                    <h3 className="text-lg font-medium">No pending issues</h3>
                    <p>All issues have been addressed. Great work!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Response Time Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Response Time Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">Average Response Time</div>
                        <div className="text-sm text-muted-foreground">From report to first action</div>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">{responseTimeStats.avgResponseTime}</div>
                    </div>
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">Pending Over 24h</div>
                        <div className="text-sm text-muted-foreground">Issues needing urgent attention</div>
                      </div>
                      <div className="text-2xl font-bold text-red-600">{responseTimeStats.pendingOver24h}</div>
                    </div>
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">Resolved Today</div>
                        <div className="text-sm text-muted-foreground">Issues closed today</div>
                      </div>
                      <div className="text-2xl font-bold text-green-600">{responseTimeStats.resolvedToday}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Issue Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(
                      workQueries.reduce((acc, query) => {
                        acc[query.category] = (acc[query.category] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([category, count]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-sm">{categoryLabels[category]}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(count / workQueries.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Supervisor Report Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Supervisor Reporting</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(
                      workQueries.reduce((acc, query) => {
                        acc[query.supervisorName] = (acc[query.supervisorName] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([supervisor, count]) => (
                      <div key={supervisor} className="flex justify-between items-center p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{supervisor}</span>
                        </div>
                        <Badge>{count} issues</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Resolution Rate */}
              <Card>
                <CardHeader>
                  <CardTitle>Resolution Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Resolved Issues</span>
                      <span className="font-medium text-green-600">{statusCounts.resolved}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rejected Issues</span>
                      <span className="font-medium text-red-600">{statusCounts.rejected}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Handled</span>
                      <span className="font-medium">{statusCounts.resolved + statusCounts.rejected}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>Resolution Rate</span>
                      <span className="font-medium text-blue-600">
                        {workQueries.length > 0 
                          ? Math.round(((statusCounts.resolved + statusCounts.rejected) / workQueries.length) * 100)
                          : 0
                        }%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Dialog */}
        <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Take Action - {selectedQuery?.queryId}
              </DialogTitle>
            </DialogHeader>
            {selectedQuery && (
              <form onSubmit={handleSubmitAction} className="space-y-6">
                <div>
                  <Label className="font-semibold">Issue Summary</Label>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedQuery.title}</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Action Type *</Label>
                    <Select 
                      value={actionData.status} 
                      onValueChange={(value) => setActionData(prev => ({ ...prev, status: value as any }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in-progress">Assign for Action</SelectItem>
                        <SelectItem value="resolved">Mark as Resolved</SelectItem>
                        <SelectItem value="rejected">Reject Issue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {actionData.status === "in-progress" && (
                    <div className="space-y-2">
                      <Label htmlFor="assignedTo">Assign To *</Label>
                      <Select 
                        value={actionData.assignedTo} 
                        onValueChange={(value) => setActionData(prev => ({ ...prev, assignedTo: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select team member" />
                        </SelectTrigger>
                        <SelectContent>
                          {actionTeamMembers.map(member => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name} ({member.department})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="response">
                      Response to Supervisor *
                      {(actionData.status === "resolved" || actionData.status === "rejected") && (
                        <span className="text-muted-foreground text-sm ml-2">
                          This will be sent to the supervisor
                        </span>
                      )}
                    </Label>
                    <Textarea
                      id="response"
                      value={actionData.response}
                      onChange={(e) => setActionData(prev => ({ ...prev, response: e.target.value }))}
                      placeholder="Provide your response and action taken..."
                      rows={4}
                      required={actionData.status === "resolved" || actionData.status === "rejected"}
                    />
                  </div>

                  {actionData.status === "resolved" && (
                    <div className="space-y-2">
                      <Label htmlFor="resolutionNotes">Resolution Notes (Internal)</Label>
                      <Textarea
                        id="resolutionNotes"
                        value={actionData.resolutionNotes}
                        onChange={(e) => setActionData(prev => ({ ...prev, resolutionNotes: e.target.value }))}
                        placeholder="Internal notes about how the issue was resolved..."
                        rows={3}
                      />
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsActionDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {actionData.status === "in-progress" ? "Assign Issue" :
                     actionData.status === "resolved" ? "Mark Resolved" : "Reject Issue"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default SuperAdminWorkIssues;