import React, { useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
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
  const { timedParents, untimedParents, childrenMap } = useMemo(() => {
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

    const timed = parentTasks
      .filter(t => !!t.time)
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    const untimed = parentTasks
      .filter(t => !t.time)
      .sort((a, b) => a.order_index - b.order_index);

    return { timedParents: timed, untimedParents: untimed, childrenMap };
  }, [tasks]);

  const visibleTimed = showCompleted ? timedParents : timedParents.filter(t => !t.completed || (childrenMap[t.id]?.some(c => !c.completed)));
  const visibleUntimed = showCompleted ? untimedParents : untimedParents.filter(t => !t.completed);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );

  // Collect all draggable IDs: untimed parents + all subtasks without time (from any parent)
  const allDraggableIds = useMemo(() => {
    const ids: string[] = [];
    const addChildren = (parentId: string) => {
      const children = childrenMap[parentId] || [];
      const visible = showCompleted ? children : children.filter(c => !c.completed);
      visible.forEach(child => {
        if (!child.time) ids.push(child.id);
        const grandchildren = childrenMap[child.id] || [];
        const visibleGC = showCompleted ? grandchildren : grandchildren.filter(c => !c.completed);
        visibleGC.forEach(gc => { if (!gc.time) ids.push(gc.id); });
      });
    };
    // Untimed parents and their children
    visibleUntimed.forEach(t => {
      ids.push(t.id);
      addChildren(t.id);
    });
    // Subtasks of timed parents that have no time
    visibleTimed.forEach(t => addChildren(t.id));
    return ids;
  }, [visibleUntimed, visibleTimed, childrenMap, showCompleted]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = allDraggableIds.indexOf(active.id as string);
    const newIndex = allDraggableIds.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(visibleUntimed, oldIndex, newIndex);
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

  const renderTaskWithChildren = (task: Task, isDraggable: boolean) => {
    const children = childrenMap[task.id] || [];
    const visibleChildren = showCompleted ? children : children.filter(c => !c.completed);
    const info = getSubtaskInfo(task.id);

    return (
      <div key={task.id}>
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
      {/* Add task input */}
      <div className="mb-4">
        <TaskInput
          onAdd={onAdd}
          autoFocus={isEmpty}
          placeholder={isEmpty ? "What's on your plate today?" : undefined}
        />
      </div>

      {isEmpty && (
        <div className="py-8 text-center">
          <p
            className="text-[18px] text-gray-300 font-medium mb-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            What's on your plate today?
          </p>
          <p className="text-[13px] text-gray-300">Start typing above to add your first task.</p>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={allDraggableIds} strategy={verticalListSortingStrategy}>
          {visibleTimed.length > 0 && (
            <div className="mb-2">
              {visibleTimed.map(task => renderTaskWithChildren(task, false))}
            </div>
          )}

          {visibleUntimed.length > 0 && visibleTimed.length > 0 && (
            <div className="mt-4 mb-2">
              <div className="border-t border-gray-100 pt-3 mb-1">
                <p className="text-[11px] font-medium text-gray-300 uppercase tracking-wider">No time set</p>
              </div>
            </div>
          )}

          {visibleUntimed.length > 0 && (
            visibleUntimed.map(task => renderTaskWithChildren(task, true))
          )}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default TaskList;
