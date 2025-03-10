
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea'; 
import { Badge } from '@/components/ui/badge';
import { Check, Upload, AlertTriangle, MessageSquare, Info, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ZoneCardProps {
  id: number;
  name: string;
  concernId: string;
  isActive: boolean;
  status: 'pending' | 'uploaded' | null;
  comment: string;
  updatedBy?: string;
  lastUpdated?: string;
  isEditable: boolean;
  onToggle: (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
  onCommentChange: (id: number, comment: string) => void;
}

const ZoneCard: React.FC<ZoneCardProps> = ({
  id,
  name,
  concernId,
  isActive,
  status,
  comment,
  updatedBy,
  lastUpdated,
  isEditable,
  onToggle,
  onStatusChange,
  onCommentChange,
}) => {
  const [isCommenting, setIsCommenting] = useState(false);
  const [localComment, setLocalComment] = useState(comment);
  const { toast } = useToast();

  const handleStatusChange = (newStatus: 'pending' | 'uploaded') => {
    if (!isEditable) {
      toast({
        title: "Access denied",
        description: "You don't have permission to update this city",
        variant: "destructive",
      });
      return;
    }
    onStatusChange(id, newStatus);
  };

  const handleCommentSave = () => {
    if (!isEditable) {
      toast({
        title: "Access denied",
        description: "You don't have permission to update this city",
        variant: "destructive",
      });
      return;
    }
    onCommentChange(id, localComment);
    setIsCommenting(false);
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
        <div className="flex justify-between items-start mb-1">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            {concernId}
          </Badge>
          {!isEditable && <Lock className="h-4 w-4 text-muted-foreground" />}
        </div>
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
              disabled={!isEditable}
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
              disabled={!isEditable}
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
                value={localComment}
                onChange={(e) => setLocalComment(e.target.value)}
                disabled={!isEditable}
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
                  disabled={!isEditable}
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
                setLocalComment(comment);
              }}
              disabled={!isEditable}
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
          
          {(updatedBy || lastUpdated) && (
            <div className="text-xs text-muted-foreground mt-2 flex items-center">
              <Info className="h-3 w-3 mr-1" />
              {updatedBy && <span>Updated by: {updatedBy}</span>}
              {lastUpdated && <span className="ml-auto">Date: {lastUpdated}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ZoneCard;
