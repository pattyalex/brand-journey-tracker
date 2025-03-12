import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Task } from "@/types/task-board";
import { PlusCircle, Edit, Trash2, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Droppable, Draggable } from "react-beautiful-dnd";

interface TaskColumnProps {
  title: string;
  icon: React.ReactNode;
  tasks: Task[];
  moveTask: (taskId: string, newStatus: Task["status"]) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  getPriorityColor: (priority: Task["priority"]) => string;
  columnId: Task["status"];
}

const TaskColumn = ({ title, icon, tasks, moveTask, onEditTask, onDeleteTask, getPriorityColor, columnId }: TaskColumnProps) => {
  const getStatusFromTitle = (title: string): Task["status"] => {
    switch (title) {
      case "All": return "todo-all";
      case "Today": return "todo-today";
      case "Scheduled": return "scheduled";
      case "Completed": return "completed";
      default: return "todo-all";
    }
  };

  return (
    <Card className="col-span-1 h-full">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-base">{title}</CardTitle>
            <div className="text-xs rounded-full bg-gray-100 px-2 py-0.5">
              {tasks.length}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <Droppable droppableId={columnId}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-3 min-h-[200px]"
            >
              {tasks.length === 0 ? (
                <div className="flex h-[100px] items-center justify-center rounded-md border border-dashed">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">No tasks in this column</p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-350px)] pr-3">
                  {tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`${snapshot.isDragging ? "opacity-70" : ""}`}
                        >
                          <Card className="group hover:shadow-md transition-shadow">
                            <CardContent className="p-3">
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-medium">{task.title}</h3>
                                    <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                    </span>
                                  </div>
                                  {task.description && (
                                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{task.description}</p>
                                  )}
                                  {task.dueDate && (
                                    <div className="flex items-center text-xs text-muted-foreground mt-2">
                                      <CalendarIcon className="mr-1 h-3 w-3" />
                                      {new Date(task.dueDate).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={() => onEditTask(task)}
                                  >
                                    <Edit size={14} />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 hover:text-destructive"
                                    onClick={() => onDeleteTask(task.id)}
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  ))}
                </ScrollArea>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </CardContent>
    </Card>
  );
};

export default TaskColumn;
