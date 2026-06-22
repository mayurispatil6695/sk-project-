export const dashboardStats = {
  superadmin: {
    totalManagers: 12,
    totalSupervisors: 45,
    totalEmployees: 324,
    totalSites: 28,
    pendingLeaves: 23,
    activeTasks: 156,
  },
  admin: {
    totalManagers: 12,
    totalSupervisors: 45,
    totalEmployees: 324,
    totalSites: 28,
    pendingLeaves: 23,
    activeTasks: 156,
  },
  manager: {
    totalSupervisors: 8,
    activeProjects: 12,
    pendingTasks: 34,
    completedTasks: 142,
  },
  supervisor: {
    totalEmployees: 15,
    assignedTasks: 28,
    completedTasks: 87,
    pendingReports: 5,
  },
  employee: {
    assignedTasks: 8,
    completedTasks: 42,
    pendingLeaves: 1,
    upcomingShifts: 5,
  },
};

export const recentActivities = [
  { id: 1, user: "John Doe", action: "Completed Task #1234", time: "2 hours ago", type: "success" },
  { id: 2, user: "Jane Smith", action: "Applied for Leave", time: "3 hours ago", type: "info" },
  { id: 3, user: "Mike Johnson", action: "Uploaded Report", time: "5 hours ago", type: "info" },
  { id: 4, user: "Sarah Williams", action: "Task Overdue", time: "6 hours ago", type: "warning" },
  { id: 5, user: "David Brown", action: "New Employee Added", time: "1 day ago", type: "success" },
];

export const documents = [
  { id: 1, name: "Joining Form Template", type: "PDF", size: "245 KB", uploadedBy: "Super Admin", date: "2024-01-15" },
  { id: 2, name: "Salary Slip Template", type: "XLSX", size: "128 KB", uploadedBy: "Admin", date: "2024-01-14" },
  { id: 3, name: "Invoice Template", type: "DOCX", size: "98 KB", uploadedBy: "Super Admin", date: "2024-01-13" },
  { id: 4, name: "Attendance Report", type: "PDF", size: "342 KB", uploadedBy: "Manager", date: "2024-01-12" },
  { id: 5, name: "Experience Certificate", type: "DOCX", size: "156 KB", uploadedBy: "Admin", date: "2024-01-11" },
];

export const leaveRequests = [
  { id: 1, employee: "John Doe", type: "Sick Leave", from: "2024-01-20", to: "2024-01-22", status: "pending", reason: "Medical emergency" },
  { id: 2, employee: "Jane Smith", type: "Casual Leave", from: "2024-01-25", to: "2024-01-26", status: "pending", reason: "Personal work" },
  { id: 3, employee: "Mike Johnson", type: "Earned Leave", from: "2024-02-01", to: "2024-02-05", status: "approved", reason: "Family vacation" },
  { id: 4, employee: "Sarah Williams", type: "Sick Leave", from: "2024-01-18", to: "2024-01-19", status: "rejected", reason: "Fever" },
];

export const tasks = [
  { id: 1, title: "Complete Site Inspection", assignedTo: "Supervisor A", priority: "high", status: "in-progress", deadline: "2024-01-22" },
  { id: 2, title: "Submit Monthly Report", assignedTo: "Manager B", priority: "medium", status: "pending", deadline: "2024-01-25" },
  { id: 3, title: "Equipment Maintenance", assignedTo: "Supervisor C", priority: "high", status: "pending", deadline: "2024-01-21" },
  { id: 4, title: "Client Meeting Preparation", assignedTo: "Manager A", priority: "low", status: "completed", deadline: "2024-01-20" },
];

export const employees = [
  { id: 1, name: "John Doe", role: "Employee", supervisor: "Supervisor A", site: "Site 01", status: "active", phone: "+1234567890" },
  { id: 2, name: "Jane Smith", role: "Employee", supervisor: "Supervisor A", site: "Site 01", status: "active", phone: "+1234567891" },
  { id: 3, name: "Mike Johnson", role: "Employee", supervisor: "Supervisor B", site: "Site 02", status: "active", phone: "+1234567892" },
  { id: 4, name: "Sarah Williams", role: "Employee", supervisor: "Supervisor B", site: "Site 02", status: "inactive", phone: "+1234567893" },
];

export const supervisors = [
  { id: 1, name: "Supervisor A", site: "Site 01", employees: 12, manager: "Manager A", status: "active", phone: "+1234567800" },
  { id: 2, name: "Supervisor B", site: "Site 02", employees: 15, manager: "Manager A", status: "active", phone: "+1234567801" },
  { id: 3, name: "Supervisor C", site: "Site 03", employees: 8, manager: "Manager B", status: "active", phone: "+1234567802" },
];

export const managers = [
  { id: 1, name: "Manager A", department: "Operations", supervisors: 5, sites: 8, status: "active", phone: "+1234567700" },
  { id: 2, name: "Manager B", department: "Maintenance", supervisors: 3, sites: 6, status: "active", phone: "+1234567701" },
];

export const chartData = {
  attendance: [
    { month: "Jan", present: 95, absent: 5 },
    { month: "Feb", present: 92, absent: 8 },
    { month: "Mar", present: 97, absent: 3 },
    { month: "Apr", present: 94, absent: 6 },
    { month: "May", present: 96, absent: 4 },
    { month: "Jun", present: 93, absent: 7 },
  ],
  taskCompletion: [
    { week: "Week 1", completed: 45, pending: 12 },
    { week: "Week 2", completed: 52, pending: 8 },
    { week: "Week 3", completed: 48, pending: 15 },
    { week: "Week 4", completed: 61, pending: 6 },
  ],
};
