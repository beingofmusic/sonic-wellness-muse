
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface UserListItem {
  id: string;
  email: string;
  role: UserRole;
  username: string | null;
  created_at: string;
  last_sign_in_at: string | null;
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url');

      if (profilesError) {
        throw profilesError;
      }

      // For each profile, fetch user details and add the role
      if (profiles) {
        const usersWithDetails = await Promise.all(
          profiles.map(async (profile) => {
            // Here in a real app we'd make admin API calls to get user details
            // But for this demo, we'll just return the profile data with mock data
            
            // Get the user's role (which might not be in the type definition yet)
            const { data: roleData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', profile.id)
              .single();
              
            const role = (roleData as any)?.role || 'user';
            
            const mockUserData = {
              email: `${profile.username || profile.id.substring(0, 8)}@example.com`,
              created_at: new Date().toISOString(),
              last_sign_in_at: null,
              role: role as UserRole
            };
            
            return {
              ...profile,
              ...mockUserData
            } as UserListItem;
          })
        );
        
        setUsers(usersWithDetails);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error loading users",
        description: "There was a problem fetching the user data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      // We need to use a raw SQL update because the types don't include role yet
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole } as any)
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast({
        title: "Role updated",
        description: `User role has been updated to ${newRole}.`
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error updating role",
        description: "There was a problem updating the user role.",
        variant: "destructive"
      });
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch(role) {
      case 'admin': return "bg-red-500/20 text-red-300 hover:bg-red-500/30";
      case 'team': return "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30";
      case 'user': return "bg-green-500/20 text-green-300 hover:bg-green-500/30";
      default: return "bg-gray-500/20 text-gray-300 hover:bg-gray-500/30";
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold mb-1">Admin Panel</h1>
          <p className="text-white/70">Manage users, roles, and content</p>
        </header>
        
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="content">Content Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4">
            <Card className="bg-card/30 backdrop-blur-sm border-white/10">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>User Management</CardTitle>
                  <Button 
                    size="sm" 
                    onClick={fetchUsers}
                    variant="outline"
                    className="bg-white/5 hover:bg-white/10"
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Refresh"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-music-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-md border border-white/10 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-white/5">
                          <tr>
                            <th className="py-3 px-4 text-left font-medium">User</th>
                            <th className="py-3 px-4 text-left font-medium">Role</th>
                            <th className="py-3 px-4 text-left font-medium">Created</th>
                            <th className="py-3 px-4 text-left font-medium">Last Login</th>
                            <th className="py-3 px-4 text-right font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.id} className="border-t border-white/10 hover:bg-white/5">
                              <td className="py-3 px-4">
                                <div>
                                  <div className="font-medium">{user.username || 'No Username'}</div>
                                  <div className="text-white/60 text-xs">{user.email}</div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <Badge className={`${getRoleBadgeColor(user.role)} cursor-pointer`}>
                                  {user.role}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-white/70">
                                {new Date(user.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4 text-white/70">
                                {user.last_sign_in_at 
                                  ? new Date(user.last_sign_in_at).toLocaleDateString() 
                                  : 'Never'
                                }
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <select
                                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs"
                                    value={user.role}
                                    onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                                  >
                                    <option value="user">User</option>
                                    <option value="team">Team</option>
                                    <option value="admin">Admin</option>
                                  </select>
                                </div>
                              </td>
                            </tr>
                          ))}
                          
                          {users.length === 0 && (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-white/50">
                                No users found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="permissions">
            <Card className="bg-card/30 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle>Role Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Admin Permissions */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Badge className={getRoleBadgeColor('admin')}>Admin</Badge>
                      <span>Permissions</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-white/10 text-white">manage_users</Badge>
                      <Badge className="bg-white/10 text-white">manage_content</Badge>
                      <Badge className="bg-white/10 text-white">manage_roles</Badge>
                      <Badge className="bg-white/10 text-white">access_dashboard</Badge>
                      <Badge className="bg-white/10 text-white">access_courses</Badge>
                      <Badge className="bg-white/10 text-white">access_practice</Badge>
                      <Badge className="bg-white/10 text-white">access_community</Badge>
                      <Badge className="bg-white/10 text-white">access_wellness</Badge>
                      <Badge className="bg-white/10 text-white">moderate_content</Badge>
                    </div>
                  </div>
                  
                  {/* Team Permissions */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Badge className={getRoleBadgeColor('team')}>Team</Badge>
                      <span>Permissions</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-white/10 text-white">contribute_content</Badge>
                      <Badge className="bg-white/10 text-white">moderate_content</Badge>
                      <Badge className="bg-white/10 text-white">access_dashboard</Badge>
                      <Badge className="bg-white/10 text-white">access_courses</Badge>
                      <Badge className="bg-white/10 text-white">access_practice</Badge>
                      <Badge className="bg-white/10 text-white">access_community</Badge>
                      <Badge className="bg-white/10 text-white">access_wellness</Badge>
                    </div>
                  </div>
                  
                  {/* User Permissions */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Badge className={getRoleBadgeColor('user')}>User</Badge>
                      <span>Permissions</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-white/10 text-white">access_dashboard</Badge>
                      <Badge className="bg-white/10 text-white">access_courses</Badge>
                      <Badge className="bg-white/10 text-white">access_practice</Badge>
                      <Badge className="bg-white/10 text-white">access_community</Badge>
                      <Badge className="bg-white/10 text-white">access_wellness</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="content">
            <Card className="bg-card/30 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-white/60">
                  <p>Content management features will be implemented here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;
