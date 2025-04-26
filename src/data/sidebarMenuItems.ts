import { Home, FolderOpen, FileText, Settings, Database, CreditCard, Calendar, TrendingUp, BarChart, HelpCircle, CheckSquare, Clipboard, CheckCircle, Handshake } from 'lucide-react';
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
      { title: "What's Trending", icon: TrendingUp, url: '/trending' },
      { title: 'Idea Development', icon: Database, url: '/bank-of-content' },
      { title: 'Content Calendar', icon: Calendar, url: '/content-calendar' },
      { title: 'Analytics', icon: BarChart, url: '/analytics' },
    ]
  },
  { 
    title: 'Strategy and Growth', 
    icon: TrendingUp, 
    url: '/strategy-growth', 
    isDeletable: false
  },
  { title: 'Partnerships', icon: Handshake, url: '/partnerships-management', isDeletable: false },
  { title: 'Quick Notes', icon: Clipboard, url: '/quick-notes', isDeletable: false },
  { 
    title: 'Collab Management', 
    icon: Handshake, 
    url: '/collab-management', 
    isDeletable: false 
  },
];

export const settingsItem: MenuItem = { title: 'Settings', icon: Settings, url: '/settings', isDeletable: false };
export const myAccountItem: MenuItem = { title: 'My Account', icon: CreditCard, url: '/my-account', isDeletable: false };
export const helpItem: MenuItem = { title: 'Help', icon: HelpCircle, url: '/help', isDeletable: false };
