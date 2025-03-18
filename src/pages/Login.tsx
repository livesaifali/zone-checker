
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock, User } from 'lucide-react';
import { authService } from '@/services/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use the authService from our API service
      const response = await authService.login(username, password);
      
      // Store JWT token in localStorage
      localStorage.setItem('token', response.token);
      
      // Fetch user details with the token
      const userData = await authService.getCurrentUser();
      
      // Store user info in localStorage
      localStorage.setItem('currentUser', JSON.stringify({
        id: userData.id,
        username: userData.username,
        role: userData.role,
        concernId: userData.concern_id
      }));
      
      toast({
        title: "Login successful",
        description: `Welcome ${userData.username}!`,
      });
      
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      
      // For development purposes, let's add a way to bypass login
      if (username === 'admin' && password === 'admin123') {
        // Mock admin user data
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('currentUser', JSON.stringify({
          id: 1,
          username: 'admin',
          role: 'superadmin',
          concernId: 'ADMIN'
        }));
        
        toast({
          title: "Development login",
          description: "Logged in with mock admin credentials",
        });
        
        navigate('/');
        return;
      }
      
      // Handle other user roles for development
      if (username && password === 'user123') {
        // Mock city user data
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('currentUser', JSON.stringify({
          id: 2,
          username: username,
          role: 'user',
          concernId: username.toUpperCase().slice(0, 3) + '001'
        }));
        
        toast({
          title: "Development login",
          description: `Logged in as ${username}`,
        });
        
        navigate('/');
        return;
      }
      
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Development logins:</p>
            <p className="mt-1">Admin: <strong>admin / admin123</strong></p>
            <p>City user: <strong>karachi / user123</strong></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
