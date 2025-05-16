import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from 'sonner';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const TaskBoard = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('plannerTasks');
    return savedTasks ? JSON.parse(savedTasks) : [
      { id: '1', text: 'Film summer lookbook video', completed: false },
      { id: '2', text: 'Edit weekend vlog', completed: false },
      { id: '3', text: 'Schedule Instagram posts for the week', completed: true },
      { id: '4', text: 'Respond to brand partnership emails', completed: false },
      { id: '5', text: 'Plan content for next month', completed: false }
    ];
  });

  const [newTask, setNewTask] = useState('');

  const handleAddTask = () => {
    if (!newTask.trim()) {
      toast.error("Task cannot be empty");
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      text: newTask,
      completed: false
    };

    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);
    localStorage.setItem('plannerTasks', JSON.stringify(updatedTasks));
    setNewTask('');
    toast.success("Task added successfully");
  };

  const handleToggleTask = (id: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem('plannerTasks', JSON.stringify(updatedTasks));
  };

  const handleDeleteTask = (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    localStorage.setItem('plannerTasks', JSON.stringify(updatedTasks));
    toast.success("Task removed");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Task Planner</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter task here..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            />
            <Button onClick={handleAddTask}>Add Task</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>To Do</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {tasks
                .filter(task => !task.completed)
                .map(task => (
                  <li key={task.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`task-${task.id}`} 
                      checked={task.completed}
                      onCheckedChange={() => handleToggleTask(task.id)}
                    />
                    <label 
                      htmlFor={`task-${task.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                    >
                      {task.text}
                    </label>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      Delete
                    </Button>
                  </li>
                ))}

              {tasks.filter(task => !task.completed).length === 0 && (
                <p className="text-sm text-muted-foreground">No tasks to do. Add some above!</p>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {tasks
                .filter(task => task.completed)
                .map(task => (
                  <li key={task.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`task-${task.id}`} 
                      checked={task.completed}
                      onCheckedChange={() => handleToggleTask(task.id)}
                    />
                    <label 
                      htmlFor={`task-${task.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 line-through text-muted-foreground"
                    >
                      {task.text}
                    </label>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      Delete
                    </Button>
                  </li>
                ))}

              {tasks.filter(task => task.completed).length === 0 && (
                <p className="text-sm text-muted-foreground">No completed tasks yet.</p>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskBoard;