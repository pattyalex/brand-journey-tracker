
import { Home, FolderOpen, FileText, Settings, CreditCard, TrendingUp, BarChart, HelpCircle, CheckSquare, Clipboard, CheckCircle, Handshake, Clapperboard, Sparkles, Calendar, Building2 } from 'lucide-react';
import { MenuItem } from '@/types/sidebar';

export const defaultMenuItems: MenuItem[] = [
  { title: 'Dashboard', icon: Home, url: '/home-page', isDeletable: false },
  { title: 'Planner and Calendar', icon: Calendar, url: '/task-board', isDeletable: false },
  {
    title: 'Content Hub',
    icon: Clapperboard,
    url: '/production',
    isDeletable: false
  },
  {
    title: 'Partnerships',
    icon: Handshake,
    url: '/brands',
    isDeletable: false
  },
  {
    title: 'Strategy and Goals',
    icon: TrendingUp,
    url: '/strategy-growth',
    isDeletable: false
  },
];

export const settingsItem: MenuItem = { title: 'Settings', icon: Settings, url: '/settings', isDeletable: false, hidden: false };
export const myAccountItem: MenuItem = { title: 'My Account', icon: CreditCard, url: '/my-account', isDeletable: false };
export const helpItem: MenuItem = { title: 'Help', icon: HelpCircle, url: '/help', isDeletable: false };
