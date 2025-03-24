
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileSpreadsheet, 
  Calendar, 
  Clock, 
  MessageSquare, 
  RefreshCw,
  Users,
  AlertTriangle,
  Trash2,
  User,
  Lock
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Task } from '@/types';

interface TaskListProps {
  tasks: Task[];
  userConcernId?: string;
  isUser?: boolean;
  isAdmin?: boolean;
  onStatusUpdate?: (taskId: number, status: 'pending' | 'updated') => void;
  onCommentUpdate?: (taskId: number, comment: string) => void;
  onDeleteTask?: (taskId: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  userConcernId, 
  isUser = false,
  isAdmin = false,
  onStatusUpdate,
  onCommentUpdate,
  onDeleteTask
}) => {
  const [commentInputs, setCommentInputs] = useState<{[key: number]: string}>({});
  const [isCommenting, setIsCommenting] = useState<{[key: number]: boolean}>({});
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  
  console.log("TaskList component received props:", {
    tasksCount: tasks.length,
    userConcernId,
    isUser,
    isAdmin,
    tasks
  });

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-muted/50 rounded-lg p-6 mx-auto max-w-md">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Tasks Available</h3>
          <p className="text-muted-foreground">
            {isUser 
              ? "There are currently no tasks assigned to your zone."
              : "There are no tasks in the system yet."}
          </p>
        </div>
      </div>
    );
  }

  const handleStatusChange = (taskId: number, status: 'pending' | 'updated') => {
    if (!onStatusUpdate) return;
    console.log(`Updating task ${taskId} status to ${status}`);
    onStatusUpdate(taskId, status);
  };

  const handleCommentSubmit = (taskId: number) => {
    if (!onCommentUpdate || !commentInputs[taskId]) return;
    console.log(`Submitting comment for task ${taskId}: ${commentInputs[taskId]}`);
    onCommentUpdate(taskId, commentInputs[taskId]);
    setCommentInputs({...commentInputs, [taskId]: ''});
    setIsCommenting({...isCommenting, [taskId]: false});
  };

  const handleDeleteTask = (taskId: number) => {
    if (!onDeleteTask) return;
    console.log(`Deleting task ${taskId}`);
    onDeleteTask(taskId);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (e) {
      console.error(`Error formatting date: ${dateString}`, e);
      return dateString;
    }
  };

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <Card 
          key={task.id} 
          className={cn(
            "transition-all hover:shadow-md overflow-hidden",
            selectedTaskId === task.id ? "border-primary border-2" : "border"
          )}
          onClick={() => setSelectedTaskId(task.id === selectedTaskId ? null : task.id)}
        >
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start mb-1">
              <Badge variant="outline" className="bg-primary/10 text-primary">
                Task #{task.id}
              </Badge>
              {!isUser && !isAdmin && <Lock className="h-4 w-4 text-muted-foreground" />}
              {onDeleteTask && (isAdmin || (!isUser && !isAdmin)) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTask(task.id);
                  }}
                  className="h-8 w-8 text-destructive hover:text-destructive/80"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary bg-primary/10 rounded p-0.5" />
              <span className="flex-1">{task.title}</span>
            </CardTitle>
            <div className="text-xs text-muted-foreground mt-1 flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{formatDate(task.createdAt)}</span>
              {task.createdByUsername && (
                <span className="ml-2">by {task.createdByUsername}</span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <p className="text-muted-foreground mb-3">{task.description}</p>
            {task.dueDate && (
              <div className="mt-2 text-sm text-muted-foreground flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Due: {formatDate(task.dueDate)}
              </div>
            )}
            {task.assignedZones && task.assignedZones.length > 0 && (
              <div className="mt-2 text-sm text-muted-foreground flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Assigned to: {task.assignedZones.join(', ')}
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <Button 
                variant={task.status === 'pending' ? 'default' : 'outline'} 
                size="sm" 
                className={cn(
                  "flex-1 transition-all duration-300",
                  task.status === 'pending' ? "bg-amber-500 hover:bg-amber-600" : ""
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(task.id, 'pending');
                }}
                disabled={!isUser}
              >
                <AlertTriangle className="mr-1 h-4 w-4" />
                Pending
              </Button>
              
              <Button 
                variant={task.status === 'updated' ? 'default' : 'outline'} 
                size="sm" 
                className={cn(
                  "flex-1 transition-all duration-300",
                  task.status === 'updated' ? "bg-green-500 hover:bg-green-600" : ""
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(task.id, 'updated');
                }}
                disabled={!isUser}
              >
                <RefreshCw className="mr-1 h-4 w-4" />
                Updated
              </Button>
            </div>
            
            {isCommenting[task.id] ? (
              <div 
                className="flex flex-col gap-2 mt-4" 
                onClick={(e) => e.stopPropagation()}
              >
                <Textarea 
                  placeholder="Add your comment here..." 
                  className="min-h-[80px] text-sm"
                  value={commentInputs[task.id] || ''}
                  onChange={(e) => setCommentInputs({...commentInputs, [task.id]: e.target.value})}
                  disabled={!isUser}
                />
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsCommenting({...isCommenting, [task.id]: false})}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleCommentSubmit(task.id)}
                    disabled={!isUser}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-muted-foreground mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCommenting({...isCommenting, [task.id]: true});
                }}
                disabled={!isUser}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                {task.comments && task.comments.length > 0 ? 'Edit Comment' : 'Add Comment'}
              </Button>
            )}
            
            {task.comments && task.comments.length > 0 && !isCommenting[task.id] && (
              <div className="mt-4 pt-3 border-t">
                <div className="space-y-2">
                  {task.comments.map(comment => (
                    <div key={comment.id} className="bg-muted/50 p-2 rounded-md">
                      <div className="font-medium text-sm">{comment.userName}</div>
                      <div className="text-sm">{comment.comment}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(comment.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Show status section */}
            <div className="mt-4 pt-2 border-t border-border">
              <div className="text-xs font-medium mb-1 flex items-center">
                {task.status === 'pending' ? (
                  <>
                    <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
                    Pending Status
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 text-green-500" />
                    Updated Status
                  </>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {task.status === 'pending' 
                  ? "This task is currently pending updates."
                  : "This task has been updated."}
              </div>
              
              {task.comments && task.comments.length > 0 && (
                <div className="text-xs text-muted-foreground mt-2 flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  <span>Last updated by: {task.comments[task.comments.length - 1].userName}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TaskList;
