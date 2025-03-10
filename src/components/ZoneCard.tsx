
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea'; 
import { Check, Upload, AlertTriangle, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ZoneCardProps {
  id: number;
  name: string;
  isActive: boolean;
  onToggle: (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
  onCommentChange: (id: number, comment: string) => void;
}

const ZoneCard: React.FC<ZoneCardProps> = ({
  id,
  name,
  isActive,
  onToggle,
  onStatusChange,
  onCommentChange,
}) => {
  const [status, setStatus] = useState<'pending' | 'uploaded' | null>(null);
  const [comment, setComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const { toast } = useToast();

  const handleStatusChange = (newStatus: 'pending' | 'uploaded') => {
    setStatus(newStatus);
    onStatusChange(id, newStatus);
    
    toast({
      title: `Status updated`,
      description: `Zone ${name} marked as ${newStatus}`,
      duration: 2000,
    });
  };

  const handleCommentSave = () => {
    onCommentChange(id, comment);
    setIsCommenting(false);
    
    toast({
      title: `Comment saved`,
      description: `Comment added to Zone ${name}`,
      duration: 2000,
    });
  };

  return (
    <Card 
      className={cn(
        "zone-card subtle-shadow overflow-hidden",
        isActive ? "border-primary border-2" : "border"
      )}
      onClick={() => onToggle(id)}
    >
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="bg-primary/10 text-primary w-7 h-7 rounded-full flex items-center justify-center text-sm">
            {id}
          </span>
          <span className="flex-1">{name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Button 
              variant={status === 'pending' ? 'default' : 'outline'} 
              size="sm" 
              className={cn(
                "flex-1 transition-all duration-300",
                status === 'pending' ? "bg-amber-500 hover:bg-amber-600" : ""
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange('pending');
              }}
            >
              <AlertTriangle className="mr-1 h-4 w-4" />
              Pending
            </Button>
            
            <Button 
              variant={status === 'uploaded' ? 'default' : 'outline'} 
              size="sm" 
              className={cn(
                "flex-1 transition-all duration-300",
                status === 'uploaded' ? "bg-green-500 hover:bg-green-600" : ""
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange('uploaded');
              }}
            >
              <Check className="mr-1 h-4 w-4" />
              Uploaded
            </Button>
          </div>
          
          {isCommenting ? (
            <div 
              className="flex flex-col gap-2" 
              onClick={(e) => e.stopPropagation()}
            >
              <Textarea 
                placeholder="Add your comment here..." 
                className="min-h-[80px] text-sm"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsCommenting(false)}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handleCommentSave}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-muted-foreground"
              onClick={(e) => {
                e.stopPropagation();
                setIsCommenting(true);
              }}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              {comment ? 'Edit Comment' : 'Add Comment'}
            </Button>
          )}
          
          {comment && !isCommenting && (
            <div className="bg-muted/50 p-2 rounded-md text-sm text-muted-foreground">
              {comment}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ZoneCard;
