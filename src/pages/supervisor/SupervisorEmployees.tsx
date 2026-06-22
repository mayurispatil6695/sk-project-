// src/pages/supervisor/SupervisorEmployees.tsx
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import EmployeeManagementWrapper from "@/components/shared/EmployeeManagementWrapper";
import { useOutletContext } from "react-router-dom";

const SupervisorEmployees = () => {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="My Team" subtitle="Manage your direct reports" onMenuClick={onMenuClick} />
      <div className="p-6">
        <EmployeeManagementWrapper />
      </div>
    </div>
  );
};

export default SupervisorEmployees;