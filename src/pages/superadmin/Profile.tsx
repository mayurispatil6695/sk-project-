// src/pages/superadmin/Profile.tsx
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOutletContext } from "react-router-dom";

const SuperAdminProfile = () => {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Profile" onMenuClick={onMenuClick} />
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Super Admin Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Profile details will be displayed here.</p>
            {/* You can add your own fields, edit form, etc. */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminProfile;