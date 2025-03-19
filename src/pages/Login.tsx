
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
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

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
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Show appropriate error message
      if (error.response && error.response.status === 401) {
        setErrorMessage('Invalid username or password');
      } else if (!error.response) {
        setErrorMessage('Cannot connect to server. Please check your connection.');
      } else {
        setErrorMessage('An error occurred during login. Please try again.');
      }
      
      toast({
        title: "Login failed",
        description: errorMessage || "Authentication failed",
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

            {errorMessage && (
              <div className="text-sm text-red-500 font-medium">
                {errorMessage}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Database users from initial setup:</p>
            <p className="mt-1">Admin: <strong>admin / admin123</strong></p>
            <p>City user: <strong>karachi / user123</strong></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
