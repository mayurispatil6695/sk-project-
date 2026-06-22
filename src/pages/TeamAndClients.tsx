import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Users, Building2 } from "lucide-react";
import EmployeeManagementWrapper from "@/components/shared/EmployeeManagementWrapper";
import CRM from "./superadmin/CRM";  // adjust path if needed
import { useRole } from "@/context/RoleContext";

const TeamAndClients = () => {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const { role } = useRole();
  const [activeTab, setActiveTab] = useState<"employees" | "crm">("employees");

  const showEmployees = role !== "employee";
  const showCRM = role === "superadmin" || role === "admin";

  useEffect(() => {
    if (!showEmployees && showCRM) setActiveTab("crm");
    if (!showCRM && showEmployees) setActiveTab("employees");
  }, [showEmployees, showCRM]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        title="Team & Clients"
        subtitle="Manage employees, managers, supervisors, and client relationships"
        onMenuClick={onMenuClick}
      />

      <div className="p-4 md:p-6">
        <Card className="border shadow-sm rounded-xl overflow-hidden">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <div className="border-b px-4 pt-4">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                {showEmployees && (
                  <TabsTrigger value="employees" className="gap-2">
                    <Users className="h-4 w-4" />
                    Employees
                  </TabsTrigger>
                )}
                {showCRM && (
                  <TabsTrigger value="crm" className="gap-2">
                    <Building2 className="h-4 w-4" />
                    CRM
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            {showEmployees && (
              <TabsContent value="employees" className="p-4">
                <EmployeeManagementWrapper />
              </TabsContent>
            )}

            {showCRM && (
              <TabsContent value="crm" className="p-4">
                <CRM />
              </TabsContent>
            )}
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default TeamAndClients;