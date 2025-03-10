
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  username: string;
  role: string;
  concernId: string;
}

const AppHeader = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate('/login');
  };

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold text-lg text-primary">
          City Checklist System
        </Link>
        
        {currentUser ? (
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <div className="font-medium">{currentUser.username}</div>
              <div className="text-muted-foreground text-xs">
                {currentUser.role === 'admin' ? 'Administrator' : 'City User'} • ID: {currentUser.concernId}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
            <User className="h-4 w-4 mr-2" />
            Login
          </Button>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
