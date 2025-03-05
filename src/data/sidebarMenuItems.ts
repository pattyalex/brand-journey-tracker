
import { Home, FolderOpen, FileText, Settings, Lightbulb, Database, CreditCard } from 'lucide-react';
import { MenuItem } from '@/types/sidebar';

export const defaultMenuItems: MenuItem[] = [
  { title: 'Dashboard', icon: Home, url: '/', isDeletable: false },
  { 
    title: 'Projects', 
    icon: FolderOpen, 
    url: '/projects', 
    isDeletable: false,
    subItems: [
      { title: 'Bank of Ideas', icon: Database, url: '/ideas-bank' },
      { title: 'Vision Board & Goals', icon: Lightbulb, url: '/projects/vision-board' },
    ]
  },
  { title: 'Documents', icon: FileText, url: '/documents', isDeletable: true },
];

export const settingsItem: MenuItem = { title: 'Settings', icon: Settings, url: '/settings', isDeletable: false };
export const myAccountItem: MenuItem = { title: 'My Account', icon: CreditCard, url: '/my-account', isDeletable: false };
