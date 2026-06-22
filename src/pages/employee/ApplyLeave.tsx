import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const previousLeaves = [
  { id: 1, type: "Sick Leave", from: "2024-01-10", to: "2024-01-12", status: "approved" },
  { id: 2, type: "Casual Leave", from: "2023-12-25", to: "2023-12-26", status: "approved" },
];

const ApplyLeave = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("Leave application submitted successfully!");
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "approved": return "default";
      case "rejected": return "destructive";
      case "pending": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Apply for Leave" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Leave Application Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="leave-type">Leave Type</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="casual">Casual Leave</SelectItem>
                      <SelectItem value="earned">Earned Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="days">Number of Days</Label>
                  <Input id="days" type="number" min="1" placeholder="Enter number of days" required />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="from-date">From Date</Label>
                  <Input id="from-date" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to-date">To Date</Label>
                  <Input id="to-date" type="date" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Leave</Label>
                <Textarea 
                  id="reason" 
                  placeholder="Enter reason for leave" 
                  required 
                  className="min-h-[100px]"
                />
              </div>

              <Button type="submit" className="w-full">Submit Leave Application</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leave History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previousLeaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell className="font-medium">{leave.type}</TableCell>
                    <TableCell>{leave.from}</TableCell>
                    <TableCell>{leave.to}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(leave.status)}>
                        {leave.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ApplyLeave;
