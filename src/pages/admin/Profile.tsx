"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Shield, 
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  User as UserIcon,
  Settings,
  AlertTriangle,
  Loader2,
  Save
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import userService from "@/services/userService";
import { useRole } from "@/context/RoleContext";
import { User as UserType } from "@/types/user";

const Profile = () => {
  const { user: authUser, isAuthenticated } = useRole();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    site: "",
  });

  useEffect(() => {
    if (authUser && isAuthenticated) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [authUser, isAuthenticated]);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const userId = authUser?._id || authUser?.id;
      
      if (!userId) {
        throw new Error("No user ID found");
      }
      
      const allUsersResponse = await userService.getAllUsers();
      const allUsers = allUsersResponse.allUsers;
      const foundUser = allUsers.find(user => 
        user._id === userId || user.id === userId
      );
      
      if (foundUser) {
        setCurrentUser(foundUser);
        setFormData({
          name: foundUser.name || "",
          email: foundUser.email || "",
          phone: foundUser.phone || "",
          department: foundUser.department || "",
          site: foundUser.site || "",
        });
      } else {
        const storedUser = localStorage.getItem('sk_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
          setFormData({
            name: parsedUser.name || "",
            email: parsedUser.email || "",
            phone: parsedUser.phone || "",
            department: parsedUser.department || "",
            site: parsedUser.site || "",
          });
          toast.warning("Using cached user data");
        } else {
          throw new Error("User not found");
        }
      }
      
    } catch (error: any) {
      console.error("Error fetching user:", error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?._id) {
      toast.error("No user data available");
      return;
    }
    
    setSaving(true);
    
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        site: formData.site,
        isActive: currentUser.isActive,
        firstName: formData.name.split(' ')[0] || "",
        lastName: formData.name.split(' ').slice(1).join(' ') || "",
        joinDate: currentUser.joinDate || new Date().toISOString()
      };

      const updatedUser = await userService.updateUser(currentUser._id, updateData);
      setCurrentUser(prev => prev ? { ...prev, ...updatedUser } : null);
      
      const storedUser = localStorage.getItem('sk_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        localStorage.setItem('sk_user', JSON.stringify({
          ...parsedUser,
          ...formData
        }));
      }
      
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'superadmin': return 'destructive';
      case 'admin': return 'destructive';
      case 'manager': return 'default';
      case 'supervisor': return 'secondary';
      default: return 'outline';
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader title="My Profile" subtitle="Manage your account settings" />
        <div className="p-4 max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-3" />
              <h2 className="text-lg font-bold mb-2">Authentication Required</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Please log in to view your profile.
              </p>
              <Button size="sm" onClick={() => window.location.href = '/login'}>
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader title="My Profile" subtitle="Manage your account settings" />
        <div className="p-4 max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        title="My Profile" 
        subtitle="Manage your account settings and preferences" 
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 max-w-5xl mx-auto space-y-4"
      >
        {/* User Header Card - Compact */}
        <Card className="border shadow-sm overflow-hidden">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3 sm:gap-4">
              <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border-2 border-background shadow-sm">
                <AvatarFallback className="text-lg bg-primary text-white">
                  {getInitials(formData.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-lg sm:text-xl font-bold truncate">{formData.name}</h1>
                  <Badge variant={getRoleColor(currentUser?.role || '')} className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    {currentUser?.role?.toUpperCase() || 'USER'}
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1 truncate">
                    <Mail className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{formData.email}</span>
                  </div>
                  {formData.department && (
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{formData.department}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="gap-2 text-xs sm:text-sm">
              <UserIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Profile Information</span>
              <span className="sm:hidden">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-2 text-xs sm:text-sm">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Account Details</span>
              <span className="sm:hidden">Account</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Personal Information</CardTitle>
                <CardDescription className="text-xs">
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2 text-sm">
                        <User className="h-3.5 w-3.5" />
                        Full Name
                      </Label>
                      <Input 
                        id="name" 
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                        required
                        className="h-9 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2 text-sm">
                        <Mail className="h-3.5 w-3.5" />
                        Email Address
                      </Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="h-9 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2 text-sm">
                        <Phone className="h-3.5 w-3.5" />
                        Phone Number
                      </Label>
                      <Input 
                        id="phone" 
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter your phone number"
                        className="h-9 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department" className="flex items-center gap-2 text-sm">
                        <Building2 className="h-3.5 w-3.5" />
                        Department
                      </Label>
                      <Input 
                        id="department" 
                        value={formData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        placeholder="Enter your department"
                        className="h-9 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="site" className="flex items-center gap-2 text-sm">
                        <MapPin className="h-3.5 w-3.5" />
                        Site/Location
                      </Label>
                      <Input 
                        id="site" 
                        value={formData.site}
                        onChange={(e) => handleInputChange('site', e.target.value)}
                        placeholder="Enter your site location"
                        className="h-9 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3.5 w-3.5" />
                        Member Since
                      </Label>
                      <div className="px-3 py-1.5 border rounded-md bg-muted/50 text-sm">
                        {formatDate(currentUser?.joinDate || '')}
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <Button type="submit" disabled={saving} size="sm" className="w-full sm:w-auto">
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-3.5 w-3.5" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Account Details</CardTitle>
                <CardDescription className="text-xs">
                  Your account information and metadata
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">User ID</Label>
                  <div className="font-mono text-xs bg-muted p-2 rounded break-all">
                    {currentUser?._id || 'N/A'}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Role</Label>
                    <div>
                      <Badge variant={getRoleColor(currentUser?.role || '')} className="text-xs">
                        {currentUser?.role?.toUpperCase() || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <div className="flex items-center gap-1.5 text-sm">
                      {currentUser?.isActive ? (
                        <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
                      )}
                      <span className="text-sm capitalize">
                        {currentUser?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Join Date</Label>
                    <p className="text-sm font-medium">{formatDate(currentUser?.joinDate || '')}</p>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Last Updated
                    </Label>
                    <p className="text-sm font-medium">Just now</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Profile;