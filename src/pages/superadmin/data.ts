// Types
export interface Attachment {
  id: string;
  filename: string;
  url: string;
  uploadedAt: string;
  size: number;
  type: string;
}

export interface HourlyUpdate {
  id: string;
  timestamp: string;
  content: string;
  submittedBy: string;
}

export interface Task {
  category: string;
  type: any;
  notes: any;
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in-progress" | "completed";
  deadline: string;
  dueDateTime: string;
  siteId: string;
  attachments: Attachment[];
  hourlyUpdates: HourlyUpdate[];
}

// Update your Site interface to include staffDeployment
export interface Site {
  issues: number;
  id: string;
  name: string;
  clientName: string;
  location: string;
  areaSqft: number;
  siteManager: string;
  managerPhone: string;
  supervisor: string;
  supervisorPhone: string;
  contractValue: number;
  contractEndDate: string;
  services: string[];
  staffDeployment?: Array<{
    role: string;
    count: number;
  }>;
  status: "active" | "inactive";
}

export interface Service {
  id: string;
  name: string;
  status: "operational" | "maintenance" | "down";
  lastChecked: string;
  assignedTeam: string;
}

export interface RosterEntry {
  id: string;
  date: string;
  employeeName: string;
  employeeId: string;
  designation: string;
  shift: string;
  shiftTiming: string;
  assignedTask: string;
  attendance: "present" | "absent" | "half-day";
  hours: number;
  remark: string;
  type: "daily" | "weekly" | "fortnightly" | "monthly";
  siteClient: string;
  supervisor: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "resolved";
  date: string; // Format: "YYYY-MM-DD HH:mm"
  reportedBy: string;
  site: string;
  photos?: string[]; // Base64 strings or URLs
  assignedTo?: string;
}

