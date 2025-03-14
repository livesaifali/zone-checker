import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Edit, Trash, Search, Eye, EyeOff, KeyRound } from "lucide-react";
import axios from 'axios';
import { format } from "date-fns";

const API_URL = 'http://localhost:5000'; // Update this to your actual backend URL

interface User {
  id: number;
  username: string;
  password?: string;
  role: string;
  concernId: string;
  lastLogin?: string;
  email?: string;
}

interface City {
  id: number;
  name: string;
  concernId: string;
}

const ManageUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState<number | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState<number | null>(null);
  const [passwordVisibility, setPasswordVisibility] = useState<{[key: number]: boolean}>({});
  const [cities, setCities] = useState<City[]>([]);
  const [newUser, setNewUser] = useState<Partial<User>>({
    username: "",
    password: "",
    role: "user",
    concernId: "",
    email: "",
  });
  const [newPassword, setNewPassword] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  const { toast } = useToast();

  const getToken = () => localStorage.getItem('token');

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      const formattedUsers = response.data.map((user: any) => ({
        id: user.id,
        username: user.username,
        role: user.role,
        concernId: user.concern_id,
        lastLogin: user.last_login ? format(new Date(user.last_login), 'yyyy-MM-dd') : undefined,
        email: user.email
      }));
      
      setUsers(formattedUsers);
      setFilteredUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error fetching users",
        description: "Failed to load user data",
        variant: "destructive",
      });
    }
  };

  const fetchCities = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cities`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      const formattedCities = response.data.map((city: any) => ({
        id: city.id,
        name: city.name,
        concernId: city.concern_id
      }));
      
      setCities(formattedCities);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCities();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredUsers(
        users.filter(user => 
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.concernId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const togglePasswordVisibility = (userId: number) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleChangePassword = async () => {
    if (!isChangingPassword) return;

    if (!newPassword.current || !newPassword.new || !newPassword.confirm) {
      toast({
        title: "Missing information",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.new !== newPassword.confirm) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match",
        variant: "destructive",
      });
      return;
    }

    try {
      await axios.put(`${API_URL}/api/users/${isChangingPassword}/change-password`, {
        currentPassword: newPassword.current,
        newPassword: newPassword.new
      }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      setIsChangingPassword(null);
      setNewPassword({
        current: "",
        new: "",
        confirm: ""
      });

      toast({
        title: "Password updated",
        description: "User password has been updated successfully",
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Error updating password",
        description: "Current password may be incorrect or server error",
        variant: "destructive",
      });
    }
  };

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.concernId) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await axios.post(`${API_URL}/api/users`, {
        username: newUser.username,
        password: newUser.password,
        email: newUser.email,
        role: newUser.role,
        concern_id: newUser.concernId
      }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      setIsAddingUser(false);
      setNewUser({
        username: "",
        password: "",
        role: "user",
        concernId: "",
        email: "",
      });

      toast({
        title: "User added",
        description: `${newUser.username} has been added successfully`,
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: "Error adding user",
        description: "Username may already exist or server error",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!isEditingUser) return;

    if (!newUser.username || !newUser.concernId) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await axios.put(`${API_URL}/api/users/${isEditingUser}`, {
        username: newUser.username,
        password: newUser.password,
        email: newUser.email,
        role: newUser.role,
        concern_id: newUser.concernId
      }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      setIsEditingUser(null);
      setNewUser({
        username: "",
        password: "",
        role: "user",
        concernId: "",
        email: "",
      });

      toast({
        title: "User updated",
        description: `User has been updated successfully`,
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error updating user",
        description: "Server error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (id: number) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (id === currentUser.id) {
      toast({
        title: "Cannot delete",
        description: "You cannot delete your own account",
        variant: "destructive",
      });
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      toast({
        title: "User deleted",
        description: "User has been deleted successfully",
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error deleting user",
        description: "Server error occurred",
        variant: "destructive",
      });
    }
  };

  const startEditUser = (user: User) => {
    setIsEditingUser(user.id);
    setNewUser({
      username: user.username,
      password: "", // Don't show current password
      role: user.role,
      concernId: user.concernId,
      email: user.email,
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="username" className="text-right">
                    Username
                  </label>
                  <Input
                    id="username"
                    className="col-span-3"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="password" className="text-right">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    className="col-span-3"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="email" className="text-right">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    className="col-span-3"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="role" className="text-right">
                    Role
                  </label>
                  <Select 
                    value={newUser.role} 
                    onValueChange={(value) => setNewUser({...newUser, role: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="user">City User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="city" className="text-right">
                    Assigned City
                  </label>
                  <Select 
                    value={newUser.concernId} 
                    onValueChange={(value) => setNewUser({...newUser, concernId: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {newUser.role === "admin" && <SelectItem value="ADMIN">All Cities (Admin)</SelectItem>}
                      {cities.map(city => (
                        <SelectItem key={city.id} value={city.concernId}>
                          {city.name} ({city.concernId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAddUser}>Add User</Button>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditingUser !== null} onOpenChange={(open) => !open && setIsEditingUser(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="username" className="text-right">
                    Username
                  </label>
                  <Input
                    id="username"
                    className="col-span-3"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="password" className="text-right">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    className="col-span-3"
                    placeholder="Leave blank to keep current password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="email" className="text-right">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    className="col-span-3"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="role" className="text-right">
                    Role
                  </label>
                  <Select 
                    value={newUser.role} 
                    onValueChange={(value) => setNewUser({...newUser, role: value})}
                    disabled={isEditingUser === 1}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="user">City User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="city" className="text-right">
                    Assigned City
                  </label>
                  <Select 
                    value={newUser.concernId} 
                    onValueChange={(value) => setNewUser({...newUser, concernId: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {newUser.role === "admin" && <SelectItem value="ADMIN">All Cities (Admin)</SelectItem>}
                      {cities.map(city => (
                        <SelectItem key={city.id} value={city.concernId}>
                          {city.name} ({city.concernId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleUpdateUser}>Update User</Button>
            </DialogContent>
          </Dialog>

          <Dialog open={isChangingPassword !== null} onOpenChange={(open) => !open && setIsChangingPassword(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="current-password" className="text-right">
                    Current Password
                  </label>
                  <Input
                    id="current-password"
                    type="password"
                    className="col-span-3"
                    value={newPassword.current}
                    onChange={(e) => setNewPassword({...newPassword, current: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="new-password" className="text-right">
                    New Password
                  </label>
                  <Input
                    id="new-password"
                    type="password"
                    className="col-span-3"
                    value={newPassword.new}
                    onChange={(e) => setNewPassword({...newPassword, new: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="confirm-password" className="text-right">
                    Confirm Password
                  </label>
                  <Input
                    id="confirm-password"
                    type="password"
                    className="col-span-3"
                    value={newPassword.confirm}
                    onChange={(e) => setNewPassword({...newPassword, confirm: e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={handleChangePassword}>Update Password</Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow overflow-hidden">
        <Table>
          <TableCaption>List of all system users</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>City ID</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Input 
                      type={passwordVisibility[user.id] ? "text" : "password"} 
                      value={user.password} 
                      readOnly 
                      className="w-32"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => togglePasswordVisibility(user.id)}
                    >
                      {passwordVisibility[user.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </TableCell>
                <TableCell>{user.email || "-"}</TableCell>
                <TableCell>
                  {user.role === "admin" ? "Administrator" : "City User"}
                </TableCell>
                <TableCell>{user.concernId}</TableCell>
                <TableCell>{user.lastLogin || "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setIsChangingPassword(user.id)}
                      title="Change Password"
                    >
                      <KeyRound className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => startEditUser(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.id === 1}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ManageUsers;
