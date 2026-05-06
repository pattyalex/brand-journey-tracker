import React, { useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Task } from '@/types/tasks';
import TaskRow from './TaskRow';
import TaskInput from './TaskInput';
import TaskCheckbox from './TaskCheckbox';
import { formatTimeShort } from '@/lib/taskParser';

interface TaskListProps {
  tasks: Task[];
  date: string;
  showCompleted: boolean;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onAdd: (title: string, time: string | null, end_time: string | null, duration: string | null, tag: string | null) => void;
  onReorder: (tasks: Task[]) => void;
  onIndent: (id: string) => void;
  onOutdent: (id: string) => void;
  onAddSubtask: (parentId: string, title: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  date,
  showCompleted,
  onToggle,
  onUpdate,
  onDelete,
  onAdd,
  onReorder,
  onIndent,
  onOutdent,
  onAddSubtask,
}) => {
  const { allParents, childrenMap } = useMemo(() => {
    const childrenMap: Record<string, Task[]> = {};
    const parentTasks: Task[] = [];

    tasks.forEach(t => {
      if (t.parent_task_id) {
        if (!childrenMap[t.parent_task_id]) childrenMap[t.parent_task_id] = [];
        childrenMap[t.parent_task_id].push(t);
      } else {
        parentTasks.push(t);
      }
    });

    Object.values(childrenMap).forEach(arr => arr.sort((a, b) => a.order_index - b.order_index));

    // Keep tasks in the order they were created (by order_index)
    const sorted = parentTasks.sort((a, b) => a.order_index - b.order_index);

    return { allParents: sorted, childrenMap };
  }, [tasks]);

  const visibleParents = showCompleted ? allParents : allParents.filter(t => !t.completed || (childrenMap[t.id]?.some(c => !c.completed)));

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as string ?? null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
  };

  // Collect all draggable IDs: all parents + all subtasks
  const allDraggableIds = useMemo(() => {
    const ids: string[] = [];
    const addChildren = (parentId: string) => {
      const children = childrenMap[parentId] || [];
      const visible = showCompleted ? children : children.filter(c => !c.completed);
      visible.forEach(child => {
        ids.push(child.id);
        const grandchildren = childrenMap[child.id] || [];
        const visibleGC = showCompleted ? grandchildren : grandchildren.filter(c => !c.completed);
        visibleGC.forEach(gc => { ids.push(gc.id); });
      });
    };
    visibleParents.forEach(t => {
      ids.push(t.id);
      addChildren(t.id);
    });
    return ids;
  }, [visibleParents, childrenMap, showCompleted]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = allDraggableIds.indexOf(active.id as string);
    const newIndex = allDraggableIds.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(visibleParents, oldIndex, newIndex);
    const updatedTasks = tasks.map(t => {
      const idx = reordered.findIndex(r => r.id === t.id);
      if (idx !== -1) return { ...t, order_index: idx + 100 };
      return t;
    });
    onReorder(updatedTasks);
  };

  const getSubtaskInfo = (parentId: string) => {
    const children = childrenMap[parentId];
    if (!children || children.length === 0) return { count: 0, completed: 0 };
    return { count: children.length, completed: children.filter(c => c.completed).length };
  };

  const renderInsertLine = (taskId: string) => {
    if (!activeId || !overId || overId !== taskId || activeId === taskId) return null;
    const activeIndex = allDraggableIds.indexOf(activeId);
    const overIndex = allDraggableIds.indexOf(taskId);
    if (activeIndex === -1 || overIndex === -1) return null;
    const isBefore = activeIndex > overIndex;
    return (
      <div
        className={`h-[1px] bg-[#612A4F] rounded-full mx-2 ${isBefore ? 'mb-0.5' : 'mt-0.5'}`}
        style={{ marginLeft: 120 }}
      />
    );
  };

  const renderTaskWithChildren = (task: Task, isDraggable: boolean) => {
    const children = childrenMap[task.id] || [];
    const visibleChildren = showCompleted ? children : children.filter(c => !c.completed);
    const info = getSubtaskInfo(task.id);
    const isBeingDragged = activeId === task.id;

    return (
      <div key={task.id}>
        {renderInsertLine(task.id)}
        <TaskRow
          task={task}
          depth={0}
          subtaskCount={info.count > 0 ? info.count : undefined}
          completedSubtaskCount={info.count > 0 ? info.completed : undefined}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onIndent={onIndent}
          onOutdent={onOutdent}
          onAddSubtask={onAddSubtask}
          isDraggable={isDraggable}
        />
        {visibleChildren.map(child => {
          const grandchildren = childrenMap[child.id] || [];
          const visibleGrandchildren = showCompleted ? grandchildren : grandchildren.filter(c => !c.completed);
          return (
            <div key={child.id}>
              <TaskRow
                task={child}
                depth={1}
                onToggle={onToggle}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onIndent={onIndent}
                onOutdent={onOutdent}
                isDraggable={!child.time}
              />
              {visibleGrandchildren.map(gc => (
                <TaskRow
                  key={gc.id}
                  task={gc}
                  depth={2}
                  onToggle={onToggle}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onIndent={onIndent}
                  onOutdent={onOutdent}
                  isDraggable={!gc.time}
                />
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  const isEmpty = tasks.length === 0;

  return (
    <div>
      {isEmpty && (
        <div className="py-8 text-center">
          <p
            className="text-[18px] text-gray-300 font-medium mb-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Add task
          </p>
          <p className="text-[13px] text-gray-300">Start typing below to add your first task.</p>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={allDraggableIds} strategy={verticalListSortingStrategy}>
          {visibleParents.map(task => renderTaskWithChildren(task, true))}
        </SortableContext>
        <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
          {activeTask ? (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-2 flex items-center gap-2.5 opacity-90">
              {activeTask.time && (
                <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap">
                  {formatTimeShort(activeTask.time)}
                </span>
              )}
              <TaskCheckbox checked={activeTask.completed} onChange={() => {}} size="md" />
              <span className={`text-[14px] ${activeTask.completed ? 'text-gray-300 line-through' : 'text-gray-800'}`}>
                {activeTask.title}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Add task input */}
      <div className="mt-4">
        <TaskInput
          onAdd={onAdd}
          autoFocus={isEmpty}
          placeholder={isEmpty ? "Add task" : undefined}
        />
      </div>
    </div>
  );
};

export default TaskList;
