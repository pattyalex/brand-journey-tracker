
import { Home, FolderOpen, FileText, Settings, Lightbulb, Database, CreditCard, PenLine, Calendar, TrendingUp, BarChart, HelpCircle, CheckSquare, Clipboard, CheckCircle } from 'lucide-react';
import { MenuItem } from '@/types/sidebar';

export const defaultMenuItems: MenuItem[] = [
  { title: 'Dashboard', icon: Home, url: '/', isDeletable: false },
  { title: 'Planner', icon: CheckCircle, url: '/task-board', isDeletable: false },
  { 
    title: 'Workflow', 
    icon: FolderOpen, 
    url: '/get-started', 
    isDeletable: false,
    subItems: [
      { title: 'Idea Development', icon: Database, url: '/bank-of-content' },
      { title: 'Content Calendar', icon: Calendar, url: '/content-calendar' },
      { title: 'Strategy and Growth', icon: TrendingUp, url: '/strategy-growth' },
      { title: 'Income Tracker', icon: CreditCard, url: '/income-tracker' },
      { title: 'Analytics', icon: BarChart, url: '/analytics' },
    ]
  },
  { title: 'Quick Notes', icon: Clipboard, url: '/quick-notes', isDeletable: false },
  { title: 'Goals and Objectives', icon: Lightbulb, url: '/projects/vision-board', isDeletable: true },
  { title: 'Documents', icon: FileText, url: '/documents', isDeletable: true },
];

export const settingsItem: MenuItem = { title: 'Settings', icon: Settings, url: '/settings', isDeletable: false };
export const myAccountItem: MenuItem = { title: 'My Account', icon: CreditCard, url: '/my-account', isDeletable: false };
export const helpItem: MenuItem = { title: 'Help', icon: HelpCircle, url: '/help', isDeletable: false };
