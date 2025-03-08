
import React from 'react';
import { Task } from '@/types/task';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { CalendarIcon, Edit, Trash2, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ScheduledTaskColumnProps {
  title: string;
  icon: React.ReactNode;
  tasks: Task[];
  moveTask: (taskId: string, newStatus: Task["status"]) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  getPriorityColor: (priority: Task["priority"]) => string;
  columnId: Task["status"];
}

const ScheduledTaskColumn = ({ 
  title, 
  icon, 
  tasks, 
  moveTask, 
  onEditTask, 
  onDeleteTask, 
  getPriorityColor, 
  columnId 
}: ScheduledTaskColumnProps) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title} <span className="ml-2 text-sm bg-primary/10 px-2.5 py-0.5 rounded-full">{tasks.length}</span>
        </CardTitle>
        <CardDescription>
          Future scheduled tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Droppable droppableId={columnId}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="h-[calc(100vh-280px)]"
            >
              <ScrollArea className="h-full">
                <div className="flex flex-col gap-3 min-h-40 pr-4">
                  {tasks.length === 0 ? (
                    <div className="flex h-[130px] items-center justify-center rounded-md border border-dashed">
                      <p className="text-center text-muted-foreground text-sm px-2">No tasks in this section</p>
                    </div>
                  ) : (
                    tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`${snapshot.isDragging ? "opacity-70" : ""}`}
                          >
                            <Card key={task.id} className={`group p-3 shadow-sm border hover:shadow-md transition-shadow ${snapshot.isDragging ? "ring-2 ring-primary" : ""}`}>
                              <div className="grid gap-2">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h3 className="font-medium mb-1">{task.title}</h3>
                                    {task.description && (
                                      <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-7 w-7" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEditTask(task);
                                      }}
                                    >
                                      <Edit size={14} />
                                    </Button>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-7 w-7 hover:text-destructive" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteTask(task.id);
                                      }}
                                    >
                                      <Trash2 size={14} />
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between text-xs">
                                  <span className={`font-medium ${getPriorityColor(task.priority)}`}>
                                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                  </span>
                                  
                                  {task.dueDate && (
                                    <div className="flex items-center text-muted-foreground">
                                      <CalendarIcon className="mr-1 h-3 w-3" />
                                      {new Date(task.dueDate).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="pt-2 border-t mt-2">
                                  <Button 
                                    size="xs" 
                                    variant="outline" 
                                    className="text-xs w-full"
                                    onClick={() => moveTask(task.id, "completed")}
                                  >
                                    <CheckCircle2 size={12} className="mr-1" />
                                    Complete
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              </ScrollArea>
            </div>
          )}
        </Droppable>
      </CardContent>
    </Card>
  );
};

export default ScheduledTaskColumn;
