
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from './ThemeToggle';
import { format } from 'date-fns';

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
  const currentDate = format(new Date(), 'MMMM d, yyyy');

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

  return (
    <header className="border-b bg-card shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="font-semibold text-lg text-primary flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          {currentDate}
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {currentUser && (
            <div className="text-sm">
              <div className="font-medium">{currentUser.username}</div>
              <div className="text-muted-foreground text-xs">
                {currentUser.role === 'admin' ? 'Administrator' : 'City User'} • {currentUser.concernId}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
