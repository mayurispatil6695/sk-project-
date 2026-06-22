// src/components/hrms/HRMS.tsx
import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { DashboardSidebar } from "@/components/shared/DashboardSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import EmployeesTab from "@/components/shared/EmployeesTab"
import OnboardingTab from "./OnboardingTab";
import AttendanceTab from "./AttendanceTab";
import LeaveManagementTab from "./LeaveManagementTab";

import PayrollTab from "./PayrollTab";
import PerformanceTab from "./PerformanceTab";
import ReportsTab from "./ReportsTab";
import { useSearchParams } from "react-router-dom";
import { 
  Employee, 
  LeaveRequest, 
  Attendance, 
  Payroll, 
  Performance, 
  Shift, 
  SalaryStructure, 
  SalarySlip 
} from "./types";
import { Deduction } from "@/services/DeductionService";

const HRMS = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [payroll, setPayroll] = useState<Payroll[]>([]);
  const [performance, setPerformance] = useState<Performance[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [salaryStructures, setSalaryStructures] = useState<SalaryStructure[]>([]);
  const [salarySlips, setSalarySlips] = useState<SalarySlip[]>([]);
  const [activeTab, setActiveTab] = useState("employees");
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  
  // Mobile sidebar state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const handleMobileClose = () => {
    setMobileSidebarOpen(false);
  };

  useEffect(() => {
    const addParam = searchParams.get("add");
    const tabParam = searchParams.get("tab");
    if (addParam === "true" && tabParam === "onboarding") {
      setActiveTab("onboarding");
      searchParams.delete("add");
      searchParams.delete("tab");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        title="HRMS - Human Resource Management" 
        onMenuClick={handleMenuClick}
      />
      
      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <DashboardSidebar 
          mobileOpen={mobileSidebarOpen}
          onMobileClose={handleMobileClose}
        />
      )}
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 w-full">
          <TabsList className="w-full justify-start flex-wrap h-auto">
            <TabsTrigger value="employees" className="flex-1 min-w-[120px]">Employees</TabsTrigger>
            <TabsTrigger value="leave" className="flex-1 min-w-[120px]">Leave Management</TabsTrigger>
            
            <TabsTrigger value="payroll" className="flex-1 min-w-[120px]">Payroll</TabsTrigger>
            <TabsTrigger value="reports" className="flex-1 min-w-[120px]">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="employees">
            <EmployeesTab
              employees={employees}
              setEmployees={setEmployees}
              setActiveTab={setActiveTab}
            />
          </TabsContent>

          <TabsContent value="onboarding">
            <OnboardingTab
              employees={employees}
              setEmployees={setEmployees}
              salaryStructures={salaryStructures}
              setSalaryStructures={setSalaryStructures}
            />
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceTab
              attendance={attendance}
              setAttendance={setAttendance}
            />
          </TabsContent>

          <TabsContent value="leave">
            <LeaveManagementTab
              leaveRequests={leaveRequests}
              setLeaveRequests={setLeaveRequests}
            />
          </TabsContent>
          <TabsContent value="payroll">
            <PayrollTab
              employees={employees}
              payroll={payroll}
              setPayroll={setPayroll}
              salaryStructures={salaryStructures}
              setSalaryStructures={setSalaryStructures}
              salarySlips={salarySlips}
              setSalarySlips={setSalarySlips}
              attendance={attendance}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
            />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceTab
              performance={performance}
              setDeductions={setDeductions} 
              setPerformance={setPerformance}
            />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab
              employees={employees}
              attendance={attendance}
              payroll={payroll}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default HRMS;