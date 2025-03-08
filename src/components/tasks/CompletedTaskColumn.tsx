
import React from 'react';
import { Task } from '@/types/task';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { CheckCircle, ArrowLeft, Trash2, CalendarIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CompletedTaskColumnProps {
  title: string;
  icon: React.ReactNode;
  tasks: Task[];
  moveTask: (taskId: string, newStatus: Task["status"]) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  columnId: Task["status"];
}

const CompletedTaskColumn = ({ 
  title, 
  icon, 
  tasks, 
  moveTask, 
  onDeleteTask, 
  columnId 
}: CompletedTaskColumnProps) => {
  return (
    <Card className="h-full bg-gray-50">
      <CardHeader className="pb-2 p-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title} <span className="ml-2 text-sm bg-primary/10 px-2.5 py-0.5 rounded-full">{tasks.length}</span>
        </CardTitle>
        <CardDescription>
          Completed tasks
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <Droppable droppableId={columnId}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="h-[calc(100vh-280px)]"
            >
              <ScrollArea className="h-full">
                <div className="flex flex-col gap-2 min-h-40 pr-2">
                  {tasks.length === 0 ? (
                    <div className="flex h-[100px] items-center justify-center rounded-md border border-dashed">
                      <p className="text-center text-muted-foreground text-sm px-2">No completed tasks</p>
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
                            <div className="group bg-white rounded-lg border py-2.5 px-3 hover:shadow-sm transition-shadow">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                <div className="flex-1">
                                  <span className="text-gray-800 text-sm line-through">{task.title}</span>
                                  {task.dueDate && (
                                    <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                                      <CalendarIcon className="mr-1 h-3 w-3" />
                                      {new Date(task.dueDate).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button 
                                    variant="ghost" 
                                    className="h-7 px-2" 
                                    size="sm"
                                    onClick={() => moveTask(task.id, "todo-all")}
                                  >
                                    <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                                    <span className="text-xs">Restore</span>
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-6 w-6 hover:text-destructive" 
                                    onClick={() => onDeleteTask(task.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </div>
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

export default CompletedTaskColumn;
