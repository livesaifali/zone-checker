
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
import { UserPlus, Edit, Trash, Search } from "lucide-react";
import { format } from "date-fns";

interface User {
  id: number;
  username: string;
  password: string;
  role: string;
  concernId: string;
  lastLogin?: string;
  email?: string;
}

const ManageUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState<number | null>(null);
  const [cities, setCities] = useState<{id: number; name: string; concernId: string}[]>([]);
  const [newUser, setNewUser] = useState<Partial<User>>({
    username: "",
    password: "",
    role: "user",
    concernId: "",
    email: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    // Mock data for now - this would be a database fetch in production
    const mockUsers: User[] = [
      { id: 1, username: "admin", password: "admin123", role: "admin", concernId: "ADMIN", lastLogin: "2023-09-15", email: "admin@example.com" },
      { id: 2, username: "karachi", password: "user123", role: "user", concernId: "KHI001", lastLogin: "2023-09-10", email: "karachi@example.com" },
      { id: 3, username: "lahore", password: "user123", role: "user", concernId: "LHR001", lastLogin: "2023-09-08", email: "lahore@example.com" },
      { id: 4, username: "islamabad", password: "user123", role: "user", concernId: "ISB001", lastLogin: "2023-09-05", email: "islamabad@example.com" },
    ];

    setUsers(mockUsers);
    setFilteredUsers(mockUsers);

    // Mock cities data
    const mockCities = [
      { id: 1, name: "Karachi", concernId: "KHI001" },
      { id: 2, name: "Lahore", concernId: "LHR001" },
      { id: 3, name: "Islamabad", concernId: "ISB001" },
      { id: 4, name: "Hyderabad", concernId: "HYD001" },
      { id: 5, name: "Sukkur", concernId: "SUK001" },
      { id: 6, name: "Larkana", concernId: "LRK001" },
      { id: 7, name: "Rawalpindi", concernId: "RWP001" },
      { id: 8, name: "Head Office", concernId: "HQ001" },
    ];
    setCities(mockCities);
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

  const handleAddUser = () => {
    if (!newUser.username || !newUser.password || !newUser.concernId) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const userExists = users.some(user => user.username === newUser.username);
    if (userExists) {
      toast({
        title: "Username taken",
        description: "Please choose a different username",
        variant: "destructive",
      });
      return;
    }

    const newUserId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const userToAdd = {
      ...newUser,
      id: newUserId,
      role: newUser.role || "user",
    } as User;

    setUsers([...users, userToAdd]);
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
      description: `${userToAdd.username} has been added successfully`,
    });
  };

  const handleUpdateUser = () => {
    if (!isEditingUser) return;

    if (!newUser.username || !newUser.concernId) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setUsers(
      users.map(user => 
        user.id === isEditingUser 
          ? { ...user, ...newUser, password: newUser.password || user.password } 
          : user
      )
    );

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
  };

  const handleDeleteUser = (id: number) => {
    if (id === 1) { // Prevent deleting the main admin
      toast({
        title: "Cannot delete",
        description: "The main administrator account cannot be deleted",
        variant: "destructive",
      });
      return;
    }

    setUsers(users.filter(user => user.id !== id));
    toast({
      title: "User deleted",
      description: "User has been deleted successfully",
    });
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
                    disabled={isEditingUser === 1} // Cannot change role of main admin
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
                <TableCell>{user.email || "-"}</TableCell>
                <TableCell>
                  {user.role === "admin" ? "Administrator" : "City User"}
                </TableCell>
                <TableCell>{user.concernId}</TableCell>
                <TableCell>{user.lastLogin || "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" onClick={() => startEditUser(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.id === 1} // Prevent deleting main admin
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
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
